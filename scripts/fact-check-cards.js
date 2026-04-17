#!/usr/bin/env node
// Fact-check each card's clue against the movie's Wikipedia plot.
// Closes the gap that audit-cards.js misses: factually wrong claims that sound right.
// Does NOT rescore style — only flags contradictions.
//
// Usage:
//   node scripts/fact-check-cards.js                  # all cards
//   node scripts/fact-check-cards.js --id bw10        # one card
//   node scripts/fact-check-cards.js --industry BW    # filter
//   node scripts/fact-check-cards.js --output fact-report.json

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';

const MODEL = 'claude-sonnet-4-20250514';
const UA = 'BadDesiPlots/1.0 (fact-check; https://github.com/seedhaplot)';

const SYSTEM = `You are a factuality checker for a Bollywood/Tollywood trivia card game.

You receive:
1. A trivia card clue describing a movie (deliberately terse, sardonic, sometimes interpretive)
2. The Wikipedia plot/synopsis for that movie

Your job: flag ONLY hard factual contradictions between the clue and the Wikipedia plot.

Flag:
- Wrong location/setting (clue says Europe but movie is Australia)
- Wrong relationship (clue says brothers but they are cousins)
- Wrong outcome (clue says they succeed but they fail)
- Wrong profession/role (clue says doctor but character is an engineer)
- Wrong key event (clue says a death but nobody dies)

Do NOT flag:
- Interpretive language ("chaos ensues", "things get weird")
- Deliberate understatement or sardonic framing
- Compressed/paraphrased plot beats
- Style, tone, or humor choices
- Missing details (absence is not contradiction)
- Ambiguity you cannot verify from the Wikipedia extract

Return STRICT JSON, no markdown, no prose:
{
  "id": "card id",
  "movie": "movie name",
  "status": "clean" | "flagged" | "no_source",
  "confidence": "high" | "medium" | "low",
  "issues": [
    { "claim": "exact claim from the clue", "contradiction": "what the Wikipedia plot says" }
  ]
}

"no_source" = Wikipedia extract too thin to judge. Do NOT hallucinate contradictions.`;

function loadCards() {
  return JSON.parse(readFileSync('cards.json', 'utf8'));
}

function filterCards(cards, opts) {
  let f = cards;
  if (opts.industry) f = f.filter(c => c.ind === opts.industry.toUpperCase());
  if (opts.diff) f = f.filter(c => c.diff === opts.diff);
  if (opts.id) f = f.filter(c => c.id === opts.id);
  return f;
}

// Try a sequence of likely Wikipedia titles (movies collide with other topics).
async function fetchWikiExtract(title, year) {
  const candidates = [
    `${title} (${year} film)`,
    `${title} (film)`,
    title,
    `${title} (Hindi film)`,
    `${title} (Telugu film)`,
    `${title} (Tamil film)`,
  ];
  for (const q of candidates) {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`,
        { headers: { 'User-Agent': UA, 'Accept': 'application/json' } }
      );
      if (!res.ok) continue;
      const j = await res.json();
      if (j.type === 'disambiguation') continue;
      // must at least mention film/movie/cinema to reduce wrong-topic matches
      const text = (j.extract || '').toLowerCase();
      if (!/\bfilm\b|\bmovie\b|\bcinema\b|directed|starring/i.test(j.extract || '')) continue;
      return { title: j.title, extract: j.extract, url: j.content_urls?.desktop?.page };
    } catch { /* try next */ }
  }
  return null;
}

// Fetch the "Plot" section text (more detail than summary).
async function fetchWikiPlot(title) {
  try {
    // get section index for "Plot"
    const sres = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=sections&format=json&origin=*`,
      { headers: { 'User-Agent': UA } }
    );
    const sj = await sres.json();
    const sections = sj?.parse?.sections || [];
    const plotSec = sections.find(s => /^plot|synopsis|story$/i.test(s.line));
    if (!plotSec) return null;
    const tres = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&section=${plotSec.index}&format=json&origin=*`,
      { headers: { 'User-Agent': UA } }
    );
    const tj = await tres.json();
    let raw = tj?.parse?.wikitext?.['*'] || '';
    // strip wikitext formatting roughly
    raw = raw
      .replace(/\{\{[^{}]*\}\}/g, '')       // templates
      .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2') // links
      .replace(/<[^>]+>/g, '')              // html tags
      .replace(/==+\s*[^=]+\s*==+/g, '')    // headings
      .replace(/\s+/g, ' ')
      .trim();
    return raw.slice(0, 2800);
  } catch { return null; }
}

async function buildContext(card) {
  const summary = await fetchWikiExtract(card.n, card.y);
  if (!summary) return null;
  const plotSection = await fetchWikiPlot(summary.title);
  const combined = [summary.extract, plotSection].filter(Boolean).join('\n\n').slice(0, 3200);
  return { wikiTitle: summary.title, wikiUrl: summary.url, text: combined };
}

async function checkOne(client, card, ctx) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content:
`CARD
id: ${card.id}
movie: ${card.n}
year: ${card.y}
industry: ${card.ind}
clue: ${card.c}
fact line: ${card.f}

WIKIPEDIA (${ctx.wikiTitle})
${ctx.text}

Return the JSON object only.`
    }],
  });
  let t = msg.content[0].text.trim();
  if (t.startsWith('```')) t = t.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return { result: JSON.parse(t), usage: msg.usage };
}

function color(code, text) {
  const map = { green: 32, red: 31, yellow: 33, dim: 90, bold: 1 };
  return `\x1b[${map[code] || 0}m${text}\x1b[0m`;
}

async function main() {
  program
    .option('--industry <BW|TW>', 'Filter by industry')
    .option('--diff <level>', 'Filter by difficulty')
    .option('--id <cardId>', 'Check specific card')
    .option('--output <file>', 'Save JSON report')
    .option('--concurrency <n>', 'Parallel checks', '3')
    .parse();
  const opts = program.opts();

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY in .env');
    process.exit(1);
  }

  const cards = filterCards(loadCards(), opts);
  console.log(`Fact-checking ${cards.length} card(s)...\n`);

  const client = new Anthropic();
  const concurrency = parseInt(opts.concurrency, 10) || 3;
  const results = [];
  let totalIn = 0, totalOut = 0;
  let noSource = 0, clean = 0, flagged = 0;

  // chunk concurrent
  for (let i = 0; i < cards.length; i += concurrency) {
    const batch = cards.slice(i, i + concurrency);
    const done = await Promise.all(batch.map(async card => {
      process.stdout.write(color('dim', `  ${card.id} ${card.n} (${card.y}) ...`));
      const ctx = await buildContext(card);
      if (!ctx) {
        console.log(color('yellow', ' no Wikipedia source'));
        return { id: card.id, movie: card.n, status: 'no_source', confidence: 'low', issues: [] };
      }
      try {
        const { result, usage } = await checkOne(client, card, ctx);
        totalIn += usage.input_tokens;
        totalOut += usage.output_tokens;
        const badge = result.status === 'flagged' ? color('red', ' flagged')
                   : result.status === 'clean' ? color('green', ' clean')
                   : color('yellow', ' no_source');
        console.log(badge + (result.issues?.length ? ` (${result.issues.length})` : ''));
        return { ...result, wiki: ctx.wikiUrl };
      } catch (e) {
        console.log(color('red', ` ERROR: ${e.message}`));
        return { id: card.id, movie: card.n, status: 'error', error: e.message, issues: [] };
      }
    }));
    results.push(...done);
  }

  for (const r of results) {
    if (r.status === 'flagged') flagged++;
    else if (r.status === 'clean') clean++;
    else if (r.status === 'no_source') noSource++;
  }

  // Detail for flagged cards
  const flaggedOnly = results.filter(r => r.status === 'flagged');
  if (flaggedOnly.length) {
    console.log('\n' + '═'.repeat(90));
    console.log(color('bold', '  FLAGGED CARDS'));
    console.log('═'.repeat(90));
    for (const r of flaggedOnly) {
      console.log(`\n  ${r.id} — ${color('bold', r.movie)} (${r.confidence})`);
      for (const issue of r.issues || []) {
        console.log(`    ${color('red', '✗')} "${issue.claim}"`);
        console.log(`    ${color('dim', 'wiki:')} ${issue.contradiction}`);
      }
      if (r.wiki) console.log(color('dim', `    ${r.wiki}`));
    }
  }

  console.log('\n' + '═'.repeat(90));
  console.log(color('bold', '  SUMMARY'));
  console.log(`  Total: ${results.length}`);
  console.log(`  ${color('green', 'Clean')}: ${clean}   ${color('red', 'Flagged')}: ${flagged}   ${color('yellow', 'No source')}: ${noSource}`);
  const cost = (totalIn / 1e6) * 3 + (totalOut / 1e6) * 15;
  console.log(`  Cost: $${cost.toFixed(4)}  (${totalIn} in + ${totalOut} out tokens)`);
  console.log('═'.repeat(90));

  if (opts.output) {
    writeFileSync(opts.output, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { total: results.length, clean, flagged, no_source: noSource },
      results
    }, null, 2));
    console.log(`\nSaved to ${opts.output}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
