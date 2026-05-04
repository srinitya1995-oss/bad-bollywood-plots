#!/usr/bin/env node
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { program } from 'commander';
import { createInterface } from 'readline';
import { writeFileSync } from 'fs';
import { loadExistingCards, getNextId, getExistingMovieNames, getExistingMovieList } from './lib/existing-cards.js';
import { validateCard, formatCardForInsert } from './lib/card-schema.js';

const BATCH_SIZE = 5;

const SYSTEM_PROMPT = `You are a card writer for "Bad Desi Plots", a desi movie trivia party game.
You write terrible, hilarious one-paragraph plot summaries of real Indian films.

VOICE FINGERPRINT (see docs/voice-fingerprint.md for full spec):
Sound like a drily amused friend texting about a movie at 1am, not a Buzzfeed intern.
The register is "drily amused aunt, not drunk cousin" — family-safe, never coarse.

Pick ONE register per card (do not mix):
- Whispered drag — one plain-English observation that drags the movie from an unexpected angle
- Genre confusion — characters committed to the wrong genre (e.g. "Two idiots think they're in a spy thriller. The villain thinks so too." — Andaz Apna Apna)
- Job-description deadpan — reduce high-stakes plot to a LinkedIn bullet (e.g. "Hitman takes a three-week sabbatical as someone else's brother. Performs admirably." — Athadu)
- Side-character promotion — make a minor element the main character (e.g. "Mom's helicopter is the real main character." — K3G)
- Middle-management drama — treat epic conflict as workplace friction (e.g. "Empire's future decided by one middle-manager with a sword." — Baahubali)

SIGNATURE MOVES:
- The plain-English put-down: "Takes himself very seriously." "Is not a fun uncle." "Has opinions about how everyone eats rice." "Will not be joining the party."
- The soft-drag adjective: one factually-correct adjective that's tonally deflating ("Unemployed man, unimpressed woman, food truck.")
- The deadpan aside: period-clause that undercuts ("Son comes home for Diwali. Dad cries for three hours. Standard.")
- The texting cadence: short clauses, periods not commas, no caps-emphasis ("Dockyard. Gold bar. Two brothers. Mom has a favorite.")

VOICE RULES (tactical):
- Under 2 sentences per clue. If longer, compress.
- No exclamation marks. No questions. No emoji. No caps-for-emphasis.
- Third person. Never name actors, directors, or character proper nouns — only roles (Man, Woman, Cop, Father, Engineer, Hitman).
- Every clue must contain ONE concrete anchor (object, profession, location, relationship, event) unique to this film. If stripping the anchor still identifies the film, the anchor is weak — rewrite.

AUTO-REJECT (these mean the card fails):
- Words: "heartwarming", "journey", "discovers", "bonds", "finds love", "meditation on", "subversion of", "redemptive", "wholesome", "sprawling", "electrifying", "iconic"
- Any Hera Pheri reference or quote
- Any "Flower nahi fire hai" style quoted dialogue inside the clue
- Twitter-reaction syntax ("THIS movie? EVERYTHING.")
- Single-big-punchline structure (prefer scattered micro-laughs)
- Academic film-critic vocabulary
- Anything coarse: slurs, scatology, innuendo, regional/religious/caste stereotyping

FUN FACT RULES:
- One real, verifiable piece of trivia about the film.
- Stated plainly with one editorial comment at the end.
- 1-3 sentences max. Keep it tight.
- MUST be factually accurate. Do not invent trivia.

DIFFICULTY CALIBRATION:
- easy: Blockbusters everyone has seen. Iconic films. Mass appeal.
- medium: Well-known but not household names. Cult classics. Film buffs know these.
- hard: Deep cuts, art house, regional classics, older films. Cinephile territory.

OUTPUT FORMAT:
Return a JSON array of card objects. Each card:
{
  "id": "(leave empty, will be assigned)",
  "ind": "BW or TW",
  "diff": "easy|medium|hard",
  "era": "70s|80s|90s|2000s|2010s|2020s",
  "y": "4-digit year as string",
  "n": "Movie Name",
  "f": "Fun fact about the film",
  "c": "\\"Clue text in double quotes\\""
}

Return ONLY the JSON array. No markdown, no explanation.

EXAMPLES OF THE VOICE:

Easy (whispered drag + texting cadence):
{"id":"","ind":"BW","diff":"easy","era":"90s","y":"1995","n":"Dilwale Dulhania Le Jayenge","f":"Ran continuously at Maratha Mandir for over 25 years. The train that never left.","c":"\\"Boy meets girl on a Eurail trip. Two hours later, pigeons are involved.\\""}

{"id":"","ind":"BW","diff":"easy","era":"2000s","y":"2001","n":"Lagaan","f":"Oscar-nominated. Aamir Khan spent a full year actually learning cricket.","c":"\\"Villagers bet the farm on a sports tournament they barely understand. They win. Obviously.\\""}

{"id":"","ind":"TW","diff":"easy","era":"2010s","y":"2015","n":"Baahubali: The Beginning","f":"First installment of SS Rajamouli\\'s two-part epic. The waterfall shot took weeks.","c":"\\"Empire\\'s future decided by one middle-manager with a sword.\\""}

Medium (job-description deadpan + genre confusion):
{"id":"","ind":"BW","diff":"medium","era":"90s","y":"1998","n":"Dil Se","f":"Chaiyya Chaiyya was shot on a moving train roof. AR Rahman. One take.","c":"\\"Journalist falls for a woman about to blow something up. He knows. He escalates anyway.\\""}

{"id":"","ind":"TW","diff":"medium","era":"2010s","y":"2018","n":"Mahanati","f":"Keerthy Suresh won the National Award. The film documents Savitri\\'s life with historical footage intercut throughout.","c":"\\"Actress rises. Industry worships her. Husband drinks. Nobody catches her.\\""}

{"id":"","ind":"BW","diff":"medium","era":"90s","y":"1994","n":"Andaz Apna Apna","f":"Flopped at release. Became a cult classic over the next decade. Every line is now a meme.","c":"\\"Two broke guys, an heiress, and a villain with a stage name. Everyone commits fully.\\""}

Hard (side-character promotion + middle-management drama):
{"id":"","ind":"BW","diff":"hard","era":"90s","y":"1995","n":"Bombay","f":"Mani Ratnam was attacked at his home after release. AR Rahman\\'s Bollywood debut. Banned in several states.","c":"\\"Hindu-Muslim couple in a city that catches fire. The love story nobody wanted to tell.\\""}

{"id":"","ind":"TW","diff":"hard","era":"80s","y":"1989","n":"Geethanjali","f":"Nagarjuna. The film\\'s dream logic and Ilaiyaraaja\\'s score made it a cult classic decades later.","c":"\\"Man dying of cancer goes to a hill station. Falls for a woman who may or may not exist. Director refuses to clarify.\\""}

{"id":"","ind":"TW","diff":"hard","era":"2000s","y":"2005","n":"Athadu","f":"Trivikram Srinivas\\'s sophomore film. Mahesh Babu pivoted to dramatic restraint here.","c":"\\"Hitman takes a three-week sabbatical as someone else\\'s brother. Performs admirably.\\""}`;

function buildUserPrompt(industry, diff, era, count, existingMovies) {
  const indName = industry === 'BW' ? 'Bollywood (Hindi)' : 'Tollywood (Telugu)';
  let prompt = `Generate ${count} ${indName} movie cards.\n\n`;

  if (diff !== 'mixed') prompt += `Difficulty: ${diff}\n`;
  else prompt += `Difficulty: mix of easy, medium, and hard\n`;

  if (era !== 'mixed') prompt += `Era: ${era}\n`;
  else prompt += `Era: mix across decades (70s through 2020s)\n`;

  prompt += `\nALREADY IN THE DECK (do NOT repeat these movies):\n`;
  prompt += existingMovies.join('\n');
  prompt += `\n\nGenerate ${count} NEW cards. Return ONLY a JSON array.`;
  return prompt;
}

function parseResponse(text) {
  // Strip markdown code fences if present
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(clean);
}

async function generateBatch(client, industry, diff, era, count, existingMovies) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: buildUserPrompt(industry, diff, era, count, existingMovies),
    }],
  });

  const text = response.content[0].text;
  const cards = parseResponse(text);
  const usage = response.usage;
  return { cards, usage };
}

function printCards(cards) {
  console.log('\n' + '─'.repeat(80));
  for (const card of cards) {
    const errors = validateCard(card);
    const status = errors.length === 0 ? '\x1b[32mVALID\x1b[0m' : `\x1b[31m${errors.join(', ')}\x1b[0m`;
    console.log(`\n  \x1b[1m${card.n}\x1b[0m (${card.y}) — ${card.ind} ${card.diff} [${status}]`);
    console.log(`  \x1b[33mClue:\x1b[0m ${card.c}`);
    console.log(`  \x1b[36mFact:\x1b[0m ${card.f}`);
  }
  console.log('\n' + '─'.repeat(80));
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  program
    .requiredOption('--industry <BW|TW>', 'Industry: BW (Bollywood) or TW (Tollywood)')
    .option('--count <n>', 'Number of cards to generate', '10')
    .option('--diff <level>', 'Difficulty: easy, medium, hard, mixed', 'mixed')
    .option('--era <era>', 'Target era: 70s, 80s, 90s, 2000s, 2010s, 2020s, mixed', 'mixed')
    .option('--output <file>', 'Output file path (default: stdout)')
    .option('--dry-run', 'Show what would be generated without calling the API')
    .parse();

  const opts = program.opts();
  const industry = opts.industry.toUpperCase();
  const count = parseInt(opts.count, 10);
  const diff = opts.diff;
  const era = opts.era;

  if (!['BW', 'TW'].includes(industry)) {
    console.error('Industry must be BW or TW');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY && !opts.dryRun) {
    console.error('Set ANTHROPIC_API_KEY in .env');
    process.exit(1);
  }

  // Load existing cards
  console.log('Loading existing cards from index.html...');
  const existingCards = loadExistingCards();
  const existingNames = getExistingMovieNames(existingCards);
  const existingList = getExistingMovieList(existingCards, industry);
  let nextId = getNextId(existingCards, industry);

  console.log(`Found ${existingCards.length} existing cards (${existingList.length} ${industry})`);
  console.log(`Next ID: ${industry.toLowerCase()}${nextId}`);
  console.log(`Generating ${count} ${industry} cards (diff: ${diff}, era: ${era})\n`);

  if (opts.dryRun) {
    console.log('DRY RUN — would generate with these settings:');
    console.log(`  Industry: ${industry}`);
    console.log(`  Count: ${count}`);
    console.log(`  Difficulty: ${diff}`);
    console.log(`  Era: ${era}`);
    console.log(`  Existing movies to avoid: ${existingList.length}`);
    console.log(`  API calls needed: ${Math.ceil(count / BATCH_SIZE)}`);
    console.log(`  Estimated cost: ~$${(count * 0.004).toFixed(3)}`);
    return;
  }

  const client = new Anthropic();
  const allCards = [];
  let totalInput = 0, totalOutput = 0;
  const batches = Math.ceil(count / BATCH_SIZE);

  for (let b = 0; b < batches; b++) {
    const batchCount = Math.min(BATCH_SIZE, count - allCards.length);
    console.log(`Batch ${b + 1}/${batches} — generating ${batchCount} cards...`);

    try {
      const { cards, usage } = await generateBatch(client, industry, diff, era, batchCount, existingList);
      totalInput += usage.input_tokens;
      totalOutput += usage.output_tokens;

      // Assign IDs and validate
      for (const card of cards) {
        card.ind = industry;
        const prefix = industry === 'BW' ? 'bw' : 'tw';
        card.id = `${prefix}${String(nextId).padStart(2, '0')}`;
        nextId++;

        // Check for duplicate movie names
        if (existingNames.has(card.n.toLowerCase())) {
          console.warn(`  \x1b[33mWARNING: "${card.n}" already exists in deck — keeping but flagged\x1b[0m`);
        }

        // Ensure clue is in quotes
        if (card.c && !card.c.startsWith('"')) card.c = `"${card.c}"`;
        if (card.c && !card.c.endsWith('"')) card.c = `${card.c}"`;

        allCards.push(card);
        existingNames.add(card.n.toLowerCase());
        existingList.push(`${card.n} (${card.y})`);
      }
    } catch (err) {
      console.error(`Batch ${b + 1} failed:`, err.message);
    }
  }

  if (allCards.length === 0) {
    console.error('No cards generated.');
    process.exit(1);
  }

  // Print for review
  console.log(`\n\x1b[1m${allCards.length} cards generated:\x1b[0m`);
  printCards(allCards);

  // Cost summary
  const inputCost = (totalInput / 1_000_000) * 3;
  const outputCost = (totalOutput / 1_000_000) * 15;
  console.log(`\x1b[36mTokens:\x1b[0m ${totalInput} input + ${totalOutput} output`);
  console.log(`\x1b[36mCost:\x1b[0m $${(inputCost + outputCost).toFixed(4)}\n`);

  // Validation summary
  const invalid = allCards.filter(c => validateCard(c).length > 0);
  if (invalid.length > 0) {
    console.log(`\x1b[31m${invalid.length} cards have validation issues.\x1b[0m`);
  }

  // Ask to save
  const answer = await confirm('Save these cards? (y/n): ');
  if (answer !== 'y' && answer !== 'yes') {
    console.log('Discarded.');
    return;
  }

  // Format output
  const formatted = allCards.map(c => formatCardForInsert(c)).join(',\n');
  const output = `// ── GENERATED ${industry} ${diff.toUpperCase()} (${new Date().toISOString().split('T')[0]}) ──\n${formatted}`;

  if (opts.output) {
    writeFileSync(opts.output, output, 'utf-8');
    console.log(`Saved to ${opts.output}`);
  } else {
    console.log('\n\x1b[1mCopy-paste into CARDS array in index.html:\x1b[0m\n');
    console.log(output);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
