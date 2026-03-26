const VALID_INDUSTRIES = ['BW', 'TW'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_ERAS = ['70s', '80s', '90s', '2000s', '2010s', '2020s'];

export function validateCard(card) {
  const errors = [];
  if (!card.id || !/^(bw|tw)\d{2,3}$/.test(card.id)) errors.push(`Invalid id: ${card.id}`);
  if (!VALID_INDUSTRIES.includes(card.ind)) errors.push(`Invalid ind: ${card.ind}`);
  if (!VALID_DIFFICULTIES.includes(card.diff)) errors.push(`Invalid diff: ${card.diff}`);
  if (!VALID_ERAS.includes(card.era)) errors.push(`Invalid era: ${card.era}`);
  if (!card.y || !/^\d{4}$/.test(card.y)) errors.push(`Invalid year: ${card.y}`);
  if (!card.n || card.n.length < 2) errors.push(`Invalid name: ${card.n}`);
  if (!card.f || card.f.length < 15) errors.push(`Fun fact too short: ${card.f?.length || 0} chars`);
  if (!card.c || card.c.length < 20) errors.push(`Clue too short: ${card.c?.length || 0} chars`);
  return errors;
}

export function formatCardForInsert(card) {
  // Format as a single-line JS object matching existing CARDS style
  const esc = (s) => s.replace(/'/g, "\\'");
  return `{id:'${card.id}',ind:'${card.ind}',diff:'${card.diff}',era:'${card.era}',y:'${card.y}',n:'${esc(card.n)}',f:'${esc(card.f)}',c:'${esc(card.c)}'}`;
}
