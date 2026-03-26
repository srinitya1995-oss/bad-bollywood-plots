/**
 * Aggregates raw event/feedback/suggestion data into a structured summary
 * optimized for Claude's context window (~3,000 tokens output).
 *
 * Data can come from PostHog API, Supabase, or localStorage exports.
 */

export function aggregateData({ events = {}, feedback = [], suggestions = [], cards = [] }) {
  // Helper: extract properties from PostHog-style events or flat events
  const prop = (e, key) => e.properties?.[key] ?? e[key];
  const evList = (name) => events[name] || [];

  // ── Sessions ──
  const gameStarts = evList('game_start');
  const gameEnds = evList('game_end');
  const replays = evList('replay');
  const appLoads = evList('app_load');

  const sessionIds = new Set();
  for (const type of Object.values(events)) {
    for (const e of type) {
      const sid = prop(e, 'session') || prop(e, 'session_id');
      if (sid) sessionIds.add(sid);
    }
  }

  // ── Card performance ──
  const cardResults = evList('card_result');
  const cardPerf = {};
  for (const e of cardResults) {
    const cid = prop(e, 'card');
    if (!cid) continue;
    if (!cardPerf[cid]) cardPerf[cid] = { got: 0, miss: 0, skip: 0, total: 0 };
    const result = prop(e, 'result');
    if (result === 'got') cardPerf[cid].got++;
    else if (result === 'miss') cardPerf[cid].miss++;
    else if (result === 'skip') cardPerf[cid].skip++;
    cardPerf[cid].total++;
  }

  // Merge with card metadata
  const cardStats = cards.map(c => {
    const perf = cardPerf[c.id] || { got: 0, miss: 0, skip: 0, total: 0 };
    return {
      id: c.id,
      name: c.n,
      industry: c.ind,
      difficulty: c.diff,
      era: c.era,
      year: c.y,
      ...perf,
      gotPct: perf.total > 0 ? Math.round((perf.got / perf.total) * 100) : null,
    };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  // ── Mode & difficulty usage ──
  const modeCount = {};
  const diffCount = {};
  const playerCounts = {};
  for (const e of gameStarts) {
    const m = prop(e, 'mode') || 'unknown';
    modeCount[m] = (modeCount[m] || 0) + 1;
    const d = prop(e, 'diff') || 'unknown';
    diffCount[d] = (diffCount[d] || 0) + 1;
    const p = prop(e, 'players') || 1;
    const pk = p === 1 ? 'solo' : `${p}_players`;
    playerCounts[pk] = (playerCounts[pk] || 0) + 1;
  }

  // ── Feedback analysis ──
  const tagCount = {};
  const cardFeedback = {};
  const textComments = [];
  for (const f of feedback) {
    const tags = f.tags || [];
    for (const t of tags) tagCount[t] = (tagCount[t] || 0) + 1;
    const cid = f.card_id;
    if (cid) cardFeedback[cid] = (cardFeedback[cid] || 0) + 1;
    const text = f.text || f.comment;
    if (text) textComments.push({ card: f.card_name || f.card_id, text, tags });
  }

  // ── Suggestions ──
  const suggestionCount = {};
  const suggestionIndustry = {};
  for (const s of suggestions) {
    const name = (s.movie || s.movie_name || '').toLowerCase();
    if (name) suggestionCount[name] = (suggestionCount[name] || 0) + 1;
    const ind = s.industry || 'unknown';
    suggestionIndustry[ind] = (suggestionIndustry[ind] || 0) + 1;
  }
  const topSuggestions = Object.entries(suggestionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([movie, count]) => ({ movie, count }));

  // ── Assemble ──
  return {
    overview: {
      totalSessions: sessionIds.size,
      gamesStarted: gameStarts.length,
      gamesCompleted: gameEnds.length,
      completionRate: gameStarts.length > 0
        ? Math.round((gameEnds.length / gameStarts.length) * 100) + '%'
        : 'N/A',
      totalCardsPlayed: cardResults.length,
      replays: replays.length,
      totalFeedback: feedback.length,
      totalSuggestions: suggestions.length,
    },
    modeUsage: modeCount,
    difficultyUsage: diffCount,
    playerDistribution: playerCounts,
    feedbackTags: tagCount,
    recentComments: textComments.slice(-25),
    topSuggestions,
    suggestionsByIndustry: suggestionIndustry,
    cardPerformance: {
      totalCardsWithData: cardStats.length,
      easiest: cardStats.filter(c => c.gotPct !== null).sort((a, b) => b.gotPct - a.gotPct).slice(0, 10),
      hardest: cardStats.filter(c => c.gotPct !== null).sort((a, b) => a.gotPct - b.gotPct).slice(0, 10),
      mostPlayed: cardStats.slice(0, 10),
    },
  };
}

export function formatForClaude(aggregated) {
  return JSON.stringify(aggregated, null, 1);
}
