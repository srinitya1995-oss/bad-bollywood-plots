#!/usr/bin/env node
/**
 * Feature inventory regression check.
 *
 * Reads .feature-inventory.md, extracts every line of the form:
 *   - <description> . grep: `<literal>`
 * and verifies that each literal appears at least once in src/.
 *
 * Exits 0 on success. Exits 1 if any feature is missing.
 *
 * Run: npm run check-features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const INVENTORY = path.join(ROOT, '.feature-inventory.md');
const SRC_DIR = path.join(ROOT, 'src');

function parseEntries(md) {
  const entries = [];
  const lines = md.split('\n');
  let section = '(top)';
  for (const line of lines) {
    const h2 = /^## (.+)$/.exec(line);
    if (h2) {
      section = h2[1].trim();
      continue;
    }
    const entry = /^-\s+(.+?)\s+[·•]\s+grep:\s+`([^`]+)`\s*$/u.exec(line);
    if (entry) {
      entries.push({ section, name: entry[1].trim(), pattern: entry[2] });
    }
  }
  return entries;
}

function grepExists(pattern) {
  try {
    const result = execSync(
      'grep -rF --include="*.ts" --include="*.tsx" --include="*.css" -l -- ' +
        JSON.stringify(pattern) +
        ' ' +
        JSON.stringify(SRC_DIR),
      { stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return result.toString().trim().length > 0;
  } catch {
    return false;
  }
}

function main() {
  if (!fs.existsSync(INVENTORY)) {
    console.error('No .feature-inventory.md at repo root. Create one.');
    process.exit(1);
  }

  const md = fs.readFileSync(INVENTORY, 'utf8');
  const entries = parseEntries(md);

  if (entries.length === 0) {
    console.error('No parseable entries in .feature-inventory.md. Format: "- <name> . grep: `<literal>`"');
    process.exit(1);
  }

  const missing = [];
  for (const e of entries) {
    if (!grepExists(e.pattern)) {
      missing.push(e);
    }
  }

  console.log(`Feature check: ${entries.length - missing.length} / ${entries.length} present`);

  if (missing.length > 0) {
    console.log('\nMISSING:');
    for (const m of missing) {
      console.log(`  [${m.section}] ${m.name}`);
      console.log(`    grep: ${m.pattern}`);
    }
    console.log('\nEither the feature was removed (update .feature-inventory.md) or the grep pattern drifted.');
    process.exit(1);
  }

  console.log('All features present.');
}

main();
