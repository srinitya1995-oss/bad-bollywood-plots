/**
 * Accuracy pipeline proof-of-concept.
 *
 * Pipeline (6 steps per docs/card-inclusion-spec.md, to be formalized):
 *   1. Atomic claim extraction
 *   2. Multi-source cross-ref (wiki + IMDB + Letterboxd)
 *   3. Humor-aware ruling
 *   4. Native-speaker override (regional only)
 *   5. Adversarial re-check (second-model pass — placeholder here, real version uses separate agent)
 *   6. Drift guard (not in POC)
 *
 * This POC runs on a SINGLE card we expect to FAIL:
 *   "Father is proud. He moves next door." (vague-no-source)
 *
 * And a SINGLE card we expect to PASS:
 *   Lagaan — "Village challenges the British Empire. To cricket."
 *
 * To run: node scripts/fact-check-v2-poc.js
 * Dependencies: built into Node 20+ (fetch, URL).
 */

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function fetchWikiExtract(title) {
  const url = `${WIKI_API}?action=query&format=json&prop=extracts&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'seedhaplot-fact-check/0.1' } });
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return page?.extract ?? '';
}

/**
 * Step 1: split a clue into atomic claims.
 * Naive implementation — a real one would use an LLM call.
 * Good enough for POC: split on sentence boundary, then on "and" / "but".
 */
function extractClaims(clue) {
  return clue
    .split(/(?<=[.!?])\s+/)
    .flatMap(s => s.split(/\s+(?:and|but)\s+/i))
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Step 2: is a claim supported by the source text?
 * Naive token-overlap check. Real pipeline uses LLM for entailment.
 */
function claimSupported(claim, source) {
  if (!source) return 'VAGUE_NO_SOURCE';
  const stop = new Set(['the','a','an','is','he','she','it','to','of','in','on','for','and','or','but','his','her']);
  const tokens = claim
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stop.has(t));
  if (tokens.length === 0) return 'VAGUE_NO_CONTENT';
  const srcLower = source.toLowerCase();
  const hits = tokens.filter(t => srcLower.includes(t)).length;
  const ratio = hits / tokens.length;
  if (ratio >= 0.5) return 'VERIFIED';
  if (ratio >= 0.2) return 'PARTIAL';
  return 'VAGUE_NO_SOURCE';
}

async function checkCard(card) {
  const source = await fetchWikiExtract(card.movie);
  const claims = extractClaims(card.clue);
  const verdicts = claims.map(c => ({ text: c, verdict: claimSupported(c, source) }));
  const allVerified = verdicts.every(v => v.verdict === 'VERIFIED');
  const anyVague = verdicts.some(v => v.verdict === 'VAGUE_NO_SOURCE' || v.verdict === 'VAGUE_NO_CONTENT');
  const overall = allVerified ? 'PASS' : anyVague ? 'FAIL — vague / no specificity' : 'REVIEW';
  return { id: card.id, movie: card.movie, clue: card.clue, claims: verdicts, overall };
}

// Load real deck. The cards.json uses short field names: n=movie, c=clue (often quoted).
import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('cards.json', 'utf8'));
const sample = raw.slice(0, parseInt(process.argv[2] || '30', 10));

const results = [];
for (const card of sample) {
  const movie = card.n;
  const clue = (card.c || '').replace(/^["']|["']$/g, '').replace(/\\"/g, '"');
  try {
    const r = await checkCard({ id: card.id, movie, clue });
    results.push(r);
    console.log(`${r.overall.padEnd(35)} ${card.id}  ${movie}`);
  } catch (e) {
    console.log(`ERROR                               ${card.id}  ${movie}: ${e.message}`);
    results.push({ id: card.id, movie, clue, error: e.message, overall: 'ERROR' });
  }
}

const summary = {
  total: results.length,
  pass: results.filter(r => r.overall === 'PASS').length,
  review: results.filter(r => r.overall === 'REVIEW').length,
  fail: results.filter(r => r.overall.startsWith('FAIL')).length,
  error: results.filter(r => r.overall === 'ERROR').length,
};

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));

fs.writeFileSync('docs/fact-check-report.json', JSON.stringify({ summary, results }, null, 2));
console.log('\nFull report written to docs/fact-check-report.json');
