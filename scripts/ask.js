#!/usr/bin/env node
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { program } from 'commander';
import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { fetchAllEvents } from './lib/posthog-client.js';
import { aggregateData, formatForClaude } from './lib/data-aggregator.js';
import { loadExistingCards } from './lib/existing-cards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, '../.cache-aggregated.json');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const SYSTEM_PROMPT = `You are an analytics assistant for SeedhaPlot (Bad Bollywood Plots), a Desi movie trivia party game.

The game has cards with terrible plot summaries of Bollywood and Tollywood movies. Players guess the movie. There are 3 difficulty tiers (easy/medium/hard), solo and multiplayer modes, and a feedback system.

You will receive aggregated engagement data. Analyze it to answer questions about:
- User engagement and behavior
- Card performance (which are too easy, too hard, confusing)
- Whether features like difficulty tiers are useful
- Feedback sentiment and themes
- Product decisions

RULES:
- Be direct. Lead with the answer.
- Use specific numbers and card names when relevant.
- If the data is insufficient to answer, say so clearly.
- Make actionable recommendations when appropriate.
- Keep responses concise — 3-5 paragraphs max.`;

async function loadData(source, filePath) {
  if (source === 'file' && filePath) {
    console.log(`Loading data from ${filePath}...`);
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
    return raw;
  }

  if (source === 'local') {
    console.log('Loading from localStorage export... (provide --file path)');
    console.error('For local source, use --file <path-to-exported-json>');
    process.exit(1);
  }

  // Check cache
  if (existsSync(CACHE_PATH)) {
    const cached = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
    if (Date.now() - cached._cachedAt < CACHE_TTL) {
      console.log('Using cached data (less than 1 hour old)');
      return cached;
    }
  }

  // Fetch from PostHog
  console.log('Fetching data from PostHog...');
  const events = await fetchAllEvents(2000);
  const aggregated = { events, _cachedAt: Date.now() };
  writeFileSync(CACHE_PATH, JSON.stringify(aggregated), 'utf-8');
  return aggregated;
}

function estimateCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;
  return { inputCost, outputCost, total: inputCost + outputCost };
}

async function askQuestion(client, question, dataContext, history = []) {
  const messages = [
    ...history,
    { role: 'user', content: question },
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}\n\nCURRENT DATA:\n${dataContext}`,
    messages,
  });

  const answer = response.content[0].text;
  const usage = response.usage;
  const cost = estimateCost(usage.input_tokens, usage.output_tokens);

  return { answer, usage, cost, messages: [...messages, { role: 'assistant', content: answer }] };
}

async function interactiveMode(client, dataContext) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let history = [];

  console.log('\n\x1b[1mSeedhaPlot Analytics — Interactive Mode\x1b[0m');
  console.log('Ask questions about your data. Type "quit" to exit.\n');

  const prompt = () => {
    rl.question('\x1b[33m❯\x1b[0m ', async (input) => {
      const q = input.trim();
      if (!q || q === 'quit' || q === 'exit') {
        rl.close();
        return;
      }

      try {
        const result = await askQuestion(client, q, dataContext, history);
        history = result.messages;
        console.log(`\n${result.answer}`);
        console.log(`\x1b[36m[${result.usage.input_tokens}in + ${result.usage.output_tokens}out = $${result.cost.total.toFixed(4)}]\x1b[0m\n`);
      } catch (err) {
        console.error(`Error: ${err.message}\n`);
      }
      prompt();
    });
  };
  prompt();
}

async function main() {
  program
    .argument('[question]', 'Question to ask about your data')
    .option('--interactive', 'Start interactive REPL mode')
    .option('--source <source>', 'Data source: posthog, file', 'posthog')
    .option('--file <path>', 'Path to exported data JSON')
    .option('--cost', 'Show estimated cost before sending')
    .parse();

  const opts = program.opts();
  const question = program.args[0];

  if (!question && !opts.interactive) {
    console.log('Usage:');
    console.log('  npm run ask -- "do users need difficulty tiers?"');
    console.log('  npm run ask -- --interactive');
    console.log('  npm run ask -- --file data.json "what do users think?"');
    process.exit(0);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY in .env');
    process.exit(1);
  }

  // Load and aggregate data
  const rawData = await loadData(opts.source, opts.file);
  const cards = loadExistingCards();
  const events = rawData.events || rawData;
  const feedback = rawData.feedback || [];
  const suggestions = rawData.suggestions || [];

  const aggregated = aggregateData({ events, feedback, suggestions, cards });
  const dataContext = formatForClaude(aggregated);

  console.log(`\x1b[36mData context: ~${Math.round(dataContext.length / 4)} tokens\x1b[0m`);

  const client = new Anthropic();

  if (opts.interactive) {
    return interactiveMode(client, dataContext);
  }

  // Single question mode
  const result = await askQuestion(client, question, dataContext);
  console.log(`\n${result.answer}\n`);
  console.log(`\x1b[36m[${result.usage.input_tokens}in + ${result.usage.output_tokens}out = $${result.cost.total.toFixed(4)}]\x1b[0m`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
