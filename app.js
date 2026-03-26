/* ─── Bad Plots v2 — Game Logic ─── */

// ─── State ───
let CARDS = [];
let mode = 'BW';
let gameMode = 'party';
let deck = [];
let idx = 0;
let totalPts = 0;
let isFlipped = false;
let players = [];
let currentPlayerIdx = 0;
let lives = 3;
let streak = 0;
let correctCount = 0;
let highScore = parseInt(localStorage.getItem('sp_highScore') || '0', 10);
const SESSION_ID = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

const PLAYER_COLORS = ['gold', 'red', 'green', 'indigo'];
const POINT_MAP = { easy: 1, medium: 2, hard: 3 };

// ─── Analytics ───
let posthogReady = false;

function initAnalytics() {
  try {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init('phc_im021jzJ6Lx5QSvJdSSeVb23IROC0Kpbrs75X2NOzTd', {
      api_host: 'https://us.i.posthog.com',
      autocapture: false
    });
    posthogReady = true;
  } catch (_) { /* analytics non-critical */ }
}

function track(event, props = {}) {
  const payload = { event, ...props, session: SESSION_ID, ts: Date.now() };
  try {
    if (posthogReady && window.posthog) window.posthog.capture(event, payload);
  } catch (_) {}
  try {
    const events = JSON.parse(localStorage.getItem('sp_events') || '[]');
    events.push(payload);
    if (events.length > 500) events.splice(0, events.length - 500);
    localStorage.setItem('sp_events', JSON.stringify(events));
  } catch (_) {}
}

function announce(msg) {
  const el = document.getElementById('sr-announce');
  if (el) el.textContent = msg;
}

// ─── Card Loading ───
async function loadCards() {
  try {
    const res = await fetch('cards.json');
    CARDS = await res.json();
  } catch (e) {
    console.error('Failed to load cards:', e);
    toast('Failed to load cards. Please refresh.');
  }
}

// ─── Screen Management ───
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    window.scrollTo(0, 0);
    const focusTarget = screen.querySelector('h1, h2, button');
    if (focusTarget) focusTarget.focus();
  }
}

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function openSheet(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  const focusEl = overlay.querySelector('button, input, textarea, select');
  if (focusEl) focusEl.focus();
}

function closeSheet(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
}

// ─── Deck Building ───
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getSeenCards() {
  try { return JSON.parse(localStorage.getItem('sp_seen') || '[]'); }
  catch (_) { return []; }
}

function markCardsSeen(cardIds) {
  try {
    const seen = getSeenCards();
    const updated = [...new Set([...seen, ...cardIds])];
    localStorage.setItem('sp_seen', JSON.stringify(updated));
  } catch (_) {}
}

function filterSeen(cards) {
  const seen = new Set(getSeenCards());
  let filtered = cards.filter(c => !seen.has(c.id));
  if (filtered.length < 12) {
    localStorage.removeItem('sp_seen');
    filtered = cards;
  }
  return filtered;
}

function buildPartyDeck(ind) {
  const pool = filterSeen(CARDS.filter(c => c.ind === ind));
  const easy = shuffle(pool.filter(c => c.diff === 'easy')).slice(0, 4);
  const medium = shuffle(pool.filter(c => c.diff === 'medium')).slice(0, 4);
  const hard = shuffle(pool.filter(c => c.diff === 'hard')).slice(0, 4);
  return [...easy, ...medium, ...hard];
}

function buildEndlessDeck(ind) {
  return shuffle(filterSeen(CARDS.filter(c => c.ind === ind)));
}

// ─── Player Management ───
function addPlayer() {
  if (players.length >= 4) { toast('Max 4 players'); return; }
  players.push({ name: '', score: 0 });
  renderPlayerList();
}

function removePlayer(i) {
  players.splice(i, 1);
  renderPlayerList();
}

function renderPlayerList() {
  const list = document.getElementById('player-list');
  if (!list) return;
  list.innerHTML = players.map((p, i) => `
    <div class="player-row" style="--player-color:${PLAYER_COLORS[i]}">
      <span class="player-avatar" aria-hidden="true">P${i + 1}</span>
      <input class="player-input" type="text" placeholder="Player ${i + 1}" value="${p.name}"
        aria-label="Player ${i + 1} name"
        onchange="window.players[${i}].name=this.value">
      <button class="player-remove" aria-label="Remove player ${i + 1}"
        onclick="window.removePlayer(${i})">&times;</button>
    </div>
  `).join('');
}

function renderGameTabs() {
  const tabs = document.getElementById('player-tabs');
  if (!tabs) return;
  tabs.innerHTML = players.map((p, i) => `
    <button class="player-tab${i === currentPlayerIdx ? ' active' : ''}"
      data-pidx="${i}" role="tab"
      aria-selected="${i === currentPlayerIdx}"
      style="--tab-color:${PLAYER_COLORS[i]}">
      ${p.name || 'P' + (i + 1)}: ${p.score}
    </button>
  `).join('');
}

function updateTabs() {
  document.querySelectorAll('.player-tab').forEach(t => {
    const pidx = parseInt(t.dataset.pidx, 10);
    t.classList.toggle('active', pidx === currentPlayerIdx);
    t.setAttribute('aria-selected', String(pidx === currentPlayerIdx));
    t.textContent = `${players[pidx].name || 'P' + (pidx + 1)}: ${players[pidx].score}`;
  });
}

// ─── Mode Selection & Game Start ───
function selectMode(m) {
  mode = m;
  if (gameMode === 'party') {
    if (players.length === 0) addPlayer();
    renderPlayerList();
    openSheet('players-overlay');
  } else {
    startGame();
  }
}

function startGame() {
  closeSheet('players-overlay');

  // Fill unnamed players
  players.forEach((p, i) => {
    if (!p.name.trim()) p.name = 'Player ' + (i + 1);
  });

  // Build deck
  deck = gameMode === 'party' ? buildPartyDeck(mode) : buildEndlessDeck(mode);
  idx = 0;
  totalPts = 0;
  isFlipped = false;
  currentPlayerIdx = 0;
  lives = 3;
  streak = 0;
  correctCount = 0;
  players.forEach(p => p.score = 0);

  // UI visibility
  const livesEl = document.getElementById('game-lives');
  const tabsEl = document.getElementById('player-tabs');
  const barTrack = document.getElementById('g-bar-track');

  if (gameMode === 'endless') {
    if (livesEl) livesEl.style.display = '';
    if (barTrack) barTrack.style.display = 'none';
    renderLives();
  } else {
    if (livesEl) livesEl.style.display = 'none';
    if (barTrack) barTrack.style.display = '';
  }

  if (players.length > 1) {
    if (tabsEl) tabsEl.style.display = '';
    renderGameTabs();
  } else {
    if (tabsEl) tabsEl.style.display = 'none';
  }

  document.getElementById('score-zone').style.display = 'none';
  document.getElementById('turn-interstitial').style.display = 'none';
  document.getElementById('card-stage').style.display = '';
  document.getElementById('g-pts').textContent = '0 pts';

  show('game');
  track('game_start', { mode, gameMode, playerCount: players.length });
  loadCard(true);
}

function renderLives() {
  document.querySelectorAll('#game-lives .life').forEach((s, i) => {
    s.classList.toggle('active', i < lives);
  });
}

// ─── Card Loading with Transitions ───
function loadCard(isFirst = false) {
  if (gameMode === 'party' && idx >= deck.length) { endGame(); return; }
  if (gameMode === 'endless') {
    if (lives <= 0) { endGame(); return; }
    if (idx >= deck.length) {
      deck = buildEndlessDeck(mode);
      idx = 0;
      if (deck.length === 0) { endGame(); return; }
    }
  }

  const card = deck[idx];
  const wrap = document.getElementById('card-wrap');
  const scoreZone = document.getElementById('score-zone');
  if (scoreZone) scoreZone.style.display = 'none';

  if (!isFirst) {
    wrap.classList.add('exiting');
    setTimeout(() => applyCard(card, wrap), 300);
  } else {
    applyCard(card, wrap);
  }
}

function applyCard(card, wrap) {
  wrap.classList.remove('exiting', 'flipped');
  isFlipped = false;

  // Progress
  if (gameMode === 'party') {
    const prog = document.getElementById('g-prog');
    const bar = document.getElementById('g-bar');
    const barTrack = document.getElementById('g-bar-track');
    if (prog) prog.textContent = `${idx + 1} / ${deck.length}`;
    const pct = (idx / deck.length) * 100;
    if (bar) bar.style.width = pct + '%';
    if (barTrack) barTrack.setAttribute('aria-valuenow', Math.round(pct));
  } else {
    const prog = document.getElementById('g-prog');
    if (prog) prog.textContent = `Card ${idx + 1}`;
  }
  document.getElementById('g-pts').textContent = totalPts + ' pts';

  // Front face
  const isBW = card.ind === 'BW';
  const indLabel = isBW ? 'Bollywood' : 'Tollywood';
  const front = document.getElementById('card-front');
  front.classList.toggle('tw', !isBW);
  const cfInd = document.getElementById('cf-ind');
  cfInd.textContent = indLabel;
  cfInd.className = 'card-ind ' + card.ind.toLowerCase();
  document.getElementById('cf-era').textContent = card.era + ' \u00b7 ' + card.diff.charAt(0).toUpperCase() + card.diff.slice(1);
  document.getElementById('cf-clue').textContent = card.c;

  // Difficulty badge
  const existingBadge = document.querySelector('.card-badge');
  if (existingBadge) existingBadge.remove();
  const badge = document.createElement('span');
  badge.className = 'card-badge badge-' + card.diff;
  badge.textContent = card.diff;
  const meta = document.querySelector('.card-front .card-meta');
  if (meta) meta.appendChild(badge);

  // Back face
  const back = document.getElementById('card-back');
  back.classList.toggle('tw', !isBW);
  const cbInd = document.getElementById('cb-ind');
  cbInd.textContent = indLabel + ' \u00b7 ' + card.diff;
  cbInd.classList.toggle('bw', isBW);
  cbInd.classList.toggle('tw', !isBW);
  document.getElementById('cb-answer').textContent = card.n;
  document.getElementById('cb-year').textContent = card.y;
  document.getElementById('cb-fact').textContent = card.f;

  // Enter animation
  wrap.classList.add('entering');
  setTimeout(() => wrap.classList.remove('entering'), 350);

  announce(`Card ${idx + 1}. ${indLabel} ${card.era}. ${card.diff} difficulty. Tap to reveal answer.`);
  track('card_view', { cardId: card.id, idx, diff: card.diff });
}

// ─── Card Flip & Scoring ───
function flipCard() {
  if (isFlipped) return;
  isFlipped = true;
  document.getElementById('card-wrap').classList.add('flipped');
  setTimeout(() => {
    const sz = document.getElementById('score-zone');
    if (sz) sz.style.display = '';
  }, 320);

  const card = deck[idx];
  announce(`Answer: ${card.n}, ${card.y}. ${card.f}`);
  track('card_flip', { cardId: card.id, idx });
}

function markCard(got) {
  const card = deck[idx];
  const pts = POINT_MAP[card.diff] || 1;

  if (got === true) {
    totalPts += pts;
    streak++;
    correctCount++;
    if (players.length > 0) players[currentPlayerIdx].score += pts;
    const ptsEl = document.getElementById('g-pts');
    ptsEl.textContent = totalPts + ' pts';
    ptsEl.classList.add('flash');
    setTimeout(() => ptsEl.classList.remove('flash'), 400);
  } else if (got === false) {
    streak = 0;
    if (gameMode === 'endless') { lives--; renderLives(); }
  }
  // got === null → skip

  track('card_result', {
    cardId: card.id,
    result: got === true ? 'correct' : got === false ? 'miss' : 'skip',
    pts: got === true ? pts : 0
  });

  if (players.length > 1) {
    currentPlayerIdx = (currentPlayerIdx + 1) % players.length;
    updateTabs();
    idx++;

    if (gameMode === 'party' && idx >= deck.length) { endGame(); return; }
    if (gameMode === 'endless' && lives <= 0) { endGame(); return; }

    // Show turn interstitial
    document.getElementById('score-zone').style.display = 'none';
    document.getElementById('card-stage').style.display = 'none';
    document.getElementById('turn-interstitial').style.display = '';
    document.getElementById('turn-name').textContent = players[currentPlayerIdx].name;
  } else {
    idx++;
    loadCard();
  }
}

function onTurnReady() {
  document.getElementById('turn-interstitial').style.display = 'none';
  document.getElementById('card-stage').style.display = '';
  loadCard();
}

// ─── End Game & Results ───
function endGame() {
  const seenIds = deck.slice(0, idx).map(c => c.id);
  markCardsSeen(seenIds);

  const totalPlayed = idx;
  const pct = totalPlayed > 0 ? (correctCount / totalPlayed) * 100 : 0;

  let title, verdict;
  if (pct >= 90) { title = 'Legendary!'; verdict = 'You are the ultimate Bollywood/Tollywood buff. Take a bow.'; }
  else if (pct >= 70) { title = 'Impressive!'; verdict = 'You clearly know your movies. Almost perfect.'; }
  else if (pct >= 50) { title = 'Not bad!'; verdict = 'Decent knowledge, but there is room to grow.'; }
  else if (pct >= 25) { title = 'Keep trying!'; verdict = 'You got some, missed some. Watch more movies!'; }
  else { title = 'Oof.'; verdict = 'Those plots were too terrible even for you. Try again!'; }

  if (gameMode === 'endless' && totalPts > highScore) {
    highScore = totalPts;
    localStorage.setItem('sp_highScore', String(highScore));
    toast('New high score: ' + highScore + ' pts!');
  }

  document.getElementById('r-title').textContent = title;
  document.getElementById('r-sub').textContent = gameMode === 'endless'
    ? `High score: ${highScore} pts`
    : `${correctCount} of ${totalPlayed} correct`;
  document.getElementById('r-verdict').textContent = verdict;
  document.getElementById('r-correct').textContent = correctCount;
  document.getElementById('r-played').textContent = totalPlayed;
  document.getElementById('r-pts').textContent = totalPts;

  const lb = document.getElementById('leaderboard');
  const lbRows = document.getElementById('lb-rows');
  if (players.length > 1) {
    lb.style.display = '';
    const sorted = [...players].sort((a, b) => b.score - a.score);
    lbRows.innerHTML = sorted.map((p, i) => `
      <div class="lb-row">
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-name">${p.name}</span>
        <span class="lb-score">${p.score} pts</span>
      </div>
    `).join('');
  } else {
    lb.style.display = 'none';
  }

  show('results');
  track('game_end', { mode, gameMode, totalPts, correctCount, totalPlayed, pct: Math.round(pct) });
}

function replayGame() {
  players.forEach(p => p.score = 0);
  startGame();
}

function doShare() {
  const text = `Bad Plots v2: I scored ${totalPts} pts! 🎬\nCan you beat that?\nhttps://seedhaplot.com`;
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => toast('Score copied to clipboard!')).catch(() => toast('Could not copy'));
  }
}

// ─── Feedback & Suggestions ───
function toggleTag(el) {
  const pressed = el.getAttribute('aria-pressed') === 'true';
  el.setAttribute('aria-pressed', String(!pressed));
}

function submitFeedback() {
  const tags = Array.from(document.querySelectorAll('#fb-tags .fb-tag[aria-pressed="true"]')).map(t => t.dataset.v);
  const text = document.getElementById('fb-text').value.trim();
  if (tags.length === 0 && !text) { toast('Please select at least one tag or write something'); return; }

  const entry = { tags, text, ts: Date.now(), session: SESSION_ID };
  try {
    const fb = JSON.parse(localStorage.getItem('sp_feedback') || '[]');
    fb.push(entry);
    localStorage.setItem('sp_feedback', JSON.stringify(fb));
  } catch (_) {}

  track('feedback_submit', entry);
  toast('Thanks for your feedback!');
  closeSheet('fb-overlay');
  document.querySelectorAll('#fb-tags .fb-tag').forEach(t => t.setAttribute('aria-pressed', 'false'));
  document.getElementById('fb-text').value = '';
}

function submitSuggestion() {
  const movie = document.getElementById('suggest-movie').value.trim();
  const industry = document.getElementById('suggest-industry').value;
  if (!movie) { toast('Please enter a movie name'); return; }

  const entry = { movie, industry, ts: Date.now(), session: SESSION_ID };
  try {
    const suggestions = JSON.parse(localStorage.getItem('sp_suggestions') || '[]');
    suggestions.push(entry);
    localStorage.setItem('sp_suggestions', JSON.stringify(suggestions));
  } catch (_) {}

  track('suggestion_submit', entry);
  toast('Thanks! We\'ll check it out.');
  closeSheet('suggest-overlay');
  document.getElementById('suggest-movie').value = '';
  document.getElementById('suggest-industry').selectedIndex = 0;
}

// ─── Event Binding ───
function bindEvents() {
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => selectMode(btn.dataset.mode));
  });

  // Toggle buttons (party / endless)
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gameMode = btn.dataset.gamemode;
      document.querySelectorAll('.toggle-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.gamemode === gameMode);
        b.setAttribute('aria-pressed', String(b.dataset.gamemode === gameMode));
      });
    });
  });

  // Player setup
  document.getElementById('add-player-btn')?.addEventListener('click', addPlayer);
  document.getElementById('start-game-btn')?.addEventListener('click', startGame);

  // Card interaction
  const cardWrap = document.getElementById('card-wrap');
  if (cardWrap) {
    cardWrap.setAttribute('role', 'button');
    cardWrap.setAttribute('tabindex', '0');
    cardWrap.setAttribute('aria-label', 'Tap to flip card and reveal answer');
    cardWrap.addEventListener('click', flipCard);
    cardWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); }
    });
  }

  // Score buttons
  document.getElementById('btn-got')?.addEventListener('click', () => markCard(true));
  document.getElementById('btn-miss')?.addEventListener('click', () => markCard(false));
  document.getElementById('btn-skip')?.addEventListener('click', () => markCard(null));

  // Game exit
  document.getElementById('game-exit')?.addEventListener('click', () => {
    if (confirm('Exit this game? Progress will be lost.')) {
      show('home');
      track('game_exit', { idx, totalPts });
    }
  });

  // Turn ready
  document.getElementById('turn-ready-btn')?.addEventListener('click', onTurnReady);

  // Results
  document.getElementById('btn-replay')?.addEventListener('click', replayGame);
  document.getElementById('btn-share')?.addEventListener('click', doShare);
  document.getElementById('btn-feedback-end')?.addEventListener('click', () => openSheet('fb-overlay'));

  // Feedback
  document.getElementById('fb-submit')?.addEventListener('click', submitFeedback);
  document.getElementById('fb-skip')?.addEventListener('click', () => closeSheet('fb-overlay'));
  document.querySelectorAll('#fb-tags .fb-tag').forEach(tag => {
    tag.addEventListener('click', () => toggleTag(tag));
  });

  // Suggest
  document.getElementById('suggest-btn')?.addEventListener('click', () => openSheet('suggest-overlay'));
  document.getElementById('suggest-submit')?.addEventListener('click', submitSuggestion);
  document.getElementById('suggest-cancel')?.addEventListener('click', () => closeSheet('suggest-overlay'));
  document.getElementById('feedback-btn')?.addEventListener('click', () => openSheet('fb-overlay'));

  // Sheet backdrop click to close
  document.querySelectorAll('.sheet-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSheet(overlay.id);
    });
  });

  // Escape key closes sheets
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.sheet-overlay.open').forEach(o => closeSheet(o.id));
    }
  });
}

// ─── Init ───
async function init() {
  await loadCards();
  bindEvents();
  initAnalytics();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

// Make available globally for inline handlers
window.players = players;
window.removePlayer = removePlayer;

init();
