import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = join(__dirname, '../../index.html');

export function loadExistingCards() {
  const html = readFileSync(INDEX_PATH, 'utf-8');
  const match = html.match(/const CARDS\s*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error('Could not find CARDS array in index.html');
  const cards = new Function(`return [${match[1]}]`)();
  return cards;
}

export function getNextId(cards, industry) {
  const prefix = industry === 'BW' ? 'bw' : 'tw';
  const nums = cards
    .filter(c => c.ind === industry)
    .map(c => parseInt(c.id.replace(prefix, ''), 10))
    .sort((a, b) => b - a);
  return nums.length > 0 ? nums[0] + 1 : 1;
}

export function getExistingMovieNames(cards) {
  return new Set(cards.map(c => c.n.toLowerCase()));
}

export function getExistingMovieList(cards, industry) {
  return cards
    .filter(c => c.ind === industry)
    .map(c => `${c.n} (${c.y})`)
    .sort();
}
