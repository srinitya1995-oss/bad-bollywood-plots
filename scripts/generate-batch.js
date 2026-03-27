#!/usr/bin/env node
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { validateCard } from './lib/card-schema.js';

const MODEL = 'claude-sonnet-4-20250514';
const BATCH_SIZE = 5;
const COST_PER_CARD_EST = 0.005; // rough estimate

const SYSTEM_PROMPT = `You are a card writer for "Bad Bollywood Plots" — a Desi movie trivia party game.
You write terrible, hilarious one-paragraph plot summaries of real Indian films.

VOICE RULES:
- Third-person, omniscient, deadpan. You know how the movie ends and you are unimpressed.
- Short sentences. Fragments are encouraged. Periods for pacing.
- No exclamation marks in clues. No questions in clues.
- The clue text must be wrapped in double quotes inside the JSON string.
- Sardonic editorial asides are the signature move: "Nobody stopped him." / "She does not accept easily."
- Never name actors, directors, or characters in the clue. Only roles: "Man", "Woman", "Boy", "Girl", "Cop", "Father", etc.
- The clue should be 2-4 sentences. Never more than 5.
- A good clue lets someone who has SEEN the movie recognize it, but someone who hasn't would never guess.

QUALITY RULES (learned from quality audit):
- Every clue MUST contain at least one detail specific to THIS film and no other.
- "Man falls for woman, family disapproves" is NOT a valid clue. Add the specific thing.
- Vary your sentence structure. Not every clue should be "Short. Sardonic. Punchline."
- The sardonic tag at the end should appear in about 40% of clues, not all of them.
- Hard difficulty clues need MORE identifying details, not fewer.
- Each clue should be guessable by someone who has seen the movie.

FUN FACT RULES:
- One real, verifiable piece of trivia about the film.
- Stated plainly with one editorial comment at the end.
- 1-3 sentences max. MUST be factually accurate.

DIFFICULTY CALIBRATION:
- easy: Blockbusters everyone has seen. Iconic films. Mass appeal.
- medium: Well-known but not household names. Cult classics. Film buffs know these.
- hard: Deep cuts, art house, regional classics, older films. Cinephile territory.

OUTPUT FORMAT:
Return a JSON array of card objects:
{"id":"","ind":"BW or TW","diff":"easy|medium|hard","era":"70s|80s|90s|2000s|2010s|2020s","y":"4-digit year","n":"Movie Name","f":"Fun fact","c":"\\"Clue text\\""}

Return ONLY the JSON array. No markdown, no explanation.`;

const AUDIT_PROMPT = `Rate this card for a movie trivia game. Return JSON:
{"guessability":1-5,"tone_balance":1-5,"uniqueness":1-5,"fact_quality":1-5,"grade":"A/B/C/D/F"}
Grade: A(avg>=4) B(>=3) C(>=2) D(>=1.5) F(<1.5). Be strict.`;

function loadCards() {
  return JSON.parse(readFileSync('cards.json', 'utf8'));
}

function getNextId(cards, industry) {
  const prefix = industry === 'BW' ? 'bw' : 'tw';
  const existing = cards.filter(c => c.id.startsWith(prefix)).map(c => parseInt(c.id.replace(prefix, ''), 10));
  return Math.max(0, ...existing) + 1;
}

function getExistingMovies(cards, industry) {
  return cards.filter(c => c.ind === industry).map(c => `${c.n} (${c.y})`);
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

async function generateBatch(client, industry, diff, era, count, existingMovies) {
  const indName = industry === 'BW' ? 'Bollywood (Hindi)' : 'Tollywood (Telugu)';
  let prompt = `Generate ${count} ${indName} movie cards.\n\n`;
  if (diff !== 'mixed') prompt += `Difficulty: ${diff}\n`;
  else prompt += `Difficulty: mix of easy, medium, and hard\n`;
  if (era !== 'mixed') prompt += `Era: ${era}\n`;
  else prompt += `Era: mix across decades (70s through 2020s)\n`;
  prompt += `\nALREADY IN THE DECK (do NOT repeat):\n${existingMovies.join('\n')}\n\nGenerate ${count} NEW cards. Return ONLY a JSON array.`;

  const response = await client.messages.create({
    model: MODEL, max_tokens: 4096, system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  let text = response.content[0].text.trim();
  if (text.startsWith('```')) text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return { cards: JSON.parse(text), usage: response.usage };
}

async function auditCard(client, card) {
  const prompt = `Card: ${card.n} (${card.y}) [${card.ind} ${card.diff}]\nClue: ${card.c}\nFact: ${card.f}`;
  try {
    const response = await client.messages.create({
      model: MODEL, max_tokens: 256, system: AUDIT_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });
    let text = response.content[0].text.trim();
    if (text.startsWith('```')) text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(text);
  } catch {
    return { grade: 'B' }; // default pass on audit failure
  }
}

async function main() {
  program
    .option('--industry <BW|TW>', 'Industry: BW or TW', 'BW')
    .option('--count <n>', 'Number of cards to generate', '20')
    .option('--diff <level>', 'Difficulty: easy, medium, hard, mixed', 'mixed')
    .option('--era <era>', 'Era: 70s-2020s, mixed', 'mixed')
    .option('--fill-to <n>', 'Auto-generate to reach N total cards')
    .option('--no-audit', 'Skip quality audit (save all cards)')
    .option('--dry-run', 'Show plan without generating')
    .parse();

  const opts = program.opts();
  if (!process.env.ANTHROPIC_API_KEY) { console.error('Set ANTHROPIC_API_KEY in .env'); process.exit(1); }

  const cards = loadCards();
  let targets = [];

  if (opts.fillTo) {
    const target = parseInt(opts.fillTo, 10);
    const current = cards.length;
    if (current >= target) { console.log(`Already at ${current} cards (target: ${target})`); return; }
    const needed = target - current;
    // Split evenly between BW and TW, across difficulties
    for (const ind of ['BW', 'TW']) {
      for (const diff of ['easy', 'medium', 'hard']) {
        const existing = cards.filter(c => c.ind === ind && c.diff === diff).length;
        const perSlot = Math.ceil(target / 6); // target per industry+difficulty
        const gap = Math.max(0, perSlot - existing);
        if (gap > 0) targets.push({ industry: ind, diff, count: gap });
      }
    }
    console.log(`Current: ${current} cards. Target: ${target}. Need ${needed} more.`);
    console.log('Generation plan:');
    targets.forEach(t => console.log(`  ${t.industry} ${t.diff}: ${t.count} cards`));
  } else {
    targets = [{ industry: opts.industry.toUpperCase(), diff: opts.diff, count: parseInt(opts.count, 10) }];
  }

  const totalToGenerate = targets.reduce((s, t) => s + t.count, 0);
  const estCost = totalToGenerate * COST_PER_CARD_EST;
  console.log(`\nTotal to generate: ${totalToGenerate} cards`);
  console.log(`Estimated cost: ~$${estCost.toFixed(2)}`);
  console.log(`API calls: ~${Math.ceil(totalToGenerate / BATCH_SIZE)}`);

  if (opts.dryRun) { console.log('\nDry run — exiting.'); return; }

  const answer = await confirm('\nProceed? (y/n): ');
  if (answer !== 'y' && answer !== 'yes') { console.log('Cancelled.'); return; }

  const client = new Anthropic();
  let allNewCards = [];
  let passed = 0, failed = 0;
  let totalInput = 0, totalOutput = 0;
  let currentCards = [...cards];

  for (const target of targets) {
    const { industry, diff, count } = target;
    let nextId = getNextId(currentCards, industry);
    const existingMovies = getExistingMovies(currentCards, industry);
    const batches = Math.ceil(count / BATCH_SIZE);

    console.log(`\n── Generating ${count} ${industry} ${diff} cards ──`);

    for (let b = 0; b < batches; b++) {
      const batchCount = Math.min(BATCH_SIZE, count - (b * BATCH_SIZE));
      process.stdout.write(`  Batch ${b + 1}/${batches} (${batchCount} cards)...`);

      try {
        const { cards: generated, usage } = await generateBatch(client, industry, diff, 'mixed', batchCount, existingMovies);
        totalInput += usage.input_tokens;
        totalOutput += usage.output_tokens;

        for (const card of generated) {
          const prefix = industry === 'BW' ? 'bw' : 'tw';
          card.id = `${prefix}${String(nextId).padStart(2, '0')}`;
          card.ind = industry;
          if (diff !== 'mixed') card.diff = diff;
          nextId++;

          // Ensure clue is in quotes
          if (card.c && !card.c.startsWith('"')) card.c = `"${card.c}"`;
          if (card.c && !card.c.endsWith('"')) card.c = `${card.c}"`;

          // Validate schema
          const errors = validateCard(card);
          if (errors.length > 0) {
            console.log(` \x1b[31mINVALID: ${card.n} — ${errors.join(', ')}\x1b[0m`);
            failed++;
            continue;
          }

          // Check for duplicate movie names
          if (existingMovies.some(m => m.toLowerCase().startsWith(card.n.toLowerCase()))) {
            console.log(` \x1b[33mDUPE: ${card.n}\x1b[0m`);
            failed++;
            continue;
          }

          // Quality audit
          if (opts.audit !== false) {
            const audit = await auditCard(client, card);
            if (['C', 'D', 'F'].includes(audit.grade)) {
              console.log(` \x1b[33mLOW QUALITY (${audit.grade}): ${card.n}\x1b[0m`);
              failed++;
              continue;
            }
          }

          allNewCards.push(card);
          currentCards.push(card);
          existingMovies.push(`${card.n} (${card.y})`);
          passed++;
        }
        console.log(` +${generated.length} generated`);
      } catch (err) {
        console.log(` FAILED: ${err.message}`);
      }
    }
  }

  if (allNewCards.length === 0) {
    console.log('\nNo cards passed quality check.');
    return;
  }

  // Append to cards.json
  const updatedCards = [...cards, ...allNewCards];
  writeFileSync('cards.json', JSON.stringify(updatedCards, null, 2));

  // Summary
  const inputCost = (totalInput / 1_000_000) * 3;
  const outputCost = (totalOutput / 1_000_000) * 15;

  console.log('\n' + '═'.repeat(60));
  console.log(`  GENERATION COMPLETE`);
  console.log(`  Generated: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`  cards.json: ${cards.length} → ${updatedCards.length} cards`);
  console.log(`  Cost: $${(inputCost + outputCost).toFixed(4)}`);
  console.log('═'.repeat(60));
}

main().catch(err => { console.error(err); process.exit(1); });
