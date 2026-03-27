#!/usr/bin/env node
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';

const MODEL = 'claude-sonnet-4-20250514';

const AUDIT_SYSTEM = `You are a game card quality auditor for "Bad Bollywood Plots" — a Desi movie trivia party game.
You evaluate trivia cards on four criteria. Be honest and specific.

For each card, return a JSON object:
{
  "id": "card id",
  "movie": "movie name",
  "guessability": 1-5,
  "guessability_reason": "why this score",
  "tone_balance": 1-5,
  "tone_reason": "why",
  "uniqueness": 1-5,
  "uniqueness_reason": "why",
  "fact_quality": 1-5,
  "fact_reason": "why",
  "grade": "A/B/C/D/F",
  "rewrite": "suggested better clue if grade C or below, null otherwise"
}

SCORING GUIDE:
- Guessability: Does the clue contain at least one detail unique to THIS movie? Can someone who's seen it guess it? 1=impossible 5=obvious
- Tone balance: Is the sardonic voice adding to the clue or overwhelming it? Best cards have concrete plot details WITH humor. 1=all attitude 5=perfect
- Uniqueness: Could this clue describe 5 other movies, or only this one? 1=generic 5=uniquely this film
- Fun fact: Is it specific, verifiable, interesting? 1=boring/wrong 5=excellent

Grade thresholds: A (avg >= 4.0), B (>= 3.0), C (>= 2.0), D (>= 1.5), F (< 1.5)

Return ONLY a JSON array of audit objects. No markdown, no explanation.`;

function loadCards() {
  return JSON.parse(readFileSync('cards.json', 'utf8'));
}

function filterCards(cards, opts) {
  let filtered = cards;
  if (opts.industry) filtered = filtered.filter(c => c.ind === opts.industry.toUpperCase());
  if (opts.diff) filtered = filtered.filter(c => c.diff === opts.diff);
  if (opts.id) filtered = filtered.filter(c => c.id === opts.id);
  return filtered;
}

async function auditBatch(client, cards) {
  const cardSummaries = cards.map(c =>
    `ID: ${c.id} | ${c.ind} | ${c.diff} | ${c.era} | ${c.y}\nMovie: ${c.n}\nClue: ${c.c}\nFact: ${c.f}`
  ).join('\n\n---\n\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: AUDIT_SYSTEM,
    messages: [{ role: 'user', content: `Audit these ${cards.length} cards:\n\n${cardSummaries}` }],
  });

  let text = response.content[0].text.trim();
  if (text.startsWith('```')) text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return { results: JSON.parse(text), usage: response.usage };
}

function gradeColor(grade) {
  const colors = { A: '\x1b[32m', B: '\x1b[36m', C: '\x1b[33m', D: '\x1b[31m', F: '\x1b[91m' };
  return `${colors[grade] || ''}${grade}\x1b[0m`;
}

async function main() {
  program
    .option('--industry <BW|TW>', 'Filter by industry')
    .option('--diff <level>', 'Filter by difficulty')
    .option('--id <cardId>', 'Audit specific card')
    .option('--grade-below <grade>', 'Show only cards below this grade')
    .option('--output <file>', 'Save results to JSON file')
    .parse();

  const opts = program.opts();

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY in .env');
    process.exit(1);
  }

  const allCards = loadCards();
  const cards = filterCards(allCards, opts);
  console.log(`Auditing ${cards.length} cards...\n`);

  const client = new Anthropic();
  const batchSize = 10;
  const allResults = [];
  let totalInput = 0, totalOutput = 0;

  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(cards.length / batchSize);
    process.stdout.write(`  Batch ${batchNum}/${totalBatches} (${batch.length} cards)...`);

    try {
      const { results, usage } = await auditBatch(client, batch);
      totalInput += usage.input_tokens;
      totalOutput += usage.output_tokens;
      allResults.push(...results);
      console.log(` done`);
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
    }
  }

  // Filter by grade if requested
  let display = allResults;
  if (opts.gradeBelow) {
    const gradeOrder = ['A', 'B', 'C', 'D', 'F'];
    const threshold = gradeOrder.indexOf(opts.gradeBelow.toUpperCase());
    display = allResults.filter(r => gradeOrder.indexOf(r.grade) >= threshold);
  }

  // Print results
  console.log('\n' + '═'.repeat(90));
  console.log('  AUDIT RESULTS');
  console.log('═'.repeat(90));

  for (const r of display) {
    const avg = ((r.guessability + r.tone_balance + r.uniqueness + r.fact_quality) / 4).toFixed(1);
    console.log(`\n  ${r.id} — \x1b[1m${r.movie}\x1b[0m  [${gradeColor(r.grade)} avg:${avg}]`);
    console.log(`    Guessability: ${r.guessability}/5 — ${r.guessability_reason}`);
    console.log(`    Tone balance: ${r.tone_balance}/5 — ${r.tone_reason}`);
    console.log(`    Uniqueness:   ${r.uniqueness}/5 — ${r.uniqueness_reason}`);
    console.log(`    Fun fact:     ${r.fact_quality}/5 — ${r.fact_reason}`);
    if (r.rewrite) console.log(`    \x1b[33mRewrite:\x1b[0m ${r.rewrite}`);
  }

  // Summary
  const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  allResults.forEach(r => { grades[r.grade] = (grades[r.grade] || 0) + 1; });

  console.log('\n' + '═'.repeat(90));
  console.log('  SUMMARY');
  console.log(`  Total audited: ${allResults.length}`);
  console.log(`  A: ${grades.A}  B: ${grades.B}  C: ${grades.C}  D: ${grades.D}  F: ${grades.F}`);
  const inputCost = (totalInput / 1_000_000) * 3;
  const outputCost = (totalOutput / 1_000_000) * 15;
  console.log(`  Cost: $${(inputCost + outputCost).toFixed(4)} (${totalInput} in + ${totalOutput} out tokens)`);
  console.log('═'.repeat(90));

  // Save if requested
  if (opts.output) {
    const report = { timestamp: new Date().toISOString(), total: allResults.length, grades, results: allResults };
    writeFileSync(opts.output, JSON.stringify(report, null, 2));
    console.log(`\nSaved to ${opts.output}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
