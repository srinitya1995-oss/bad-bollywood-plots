/** Channels exposed by the Results share row. */
export type ShareChannel = 'whatsapp' | 'x' | 'reddit' | 'copy';

/** Game mode the share text was produced from. Drives `utm_campaign`. */
export type ShareMode = 'solo' | 'party';

const BASE_URL = 'https://baddesiplots.com/';

/** Build a UTM-tagged baddesiplots URL for a given share channel + game mode. */
export function buildShareUrl(channel: ShareChannel, mode: ShareMode): string {
  const params = new URLSearchParams({
    utm_source: 'share',
    utm_medium: channel,
    utm_campaign: `results_${mode}`,
  });
  return `${BASE_URL}?${params.toString()}`;
}

/** Inputs needed to render a solo-mode share string. */
export interface SoloShareInput {
  tier: string;
  rating: number;
  correctCount: number;
  totalPlayed: number;
  industryLabel: string;
  /** Top-percent framing: 25 renders as "Top 25%" (lower = better). */
  percentile: number;
  emoji: string;
}

/** Format a solo-mode results brag with tier, score, percentile, and a UTM-tagged URL. */
export function getShareTextSolo(input: SoloShareInput, channel: ShareChannel): string {
  const url = buildShareUrl(channel, 'solo');
  return [
    `${input.emoji} ${input.tier} (${input.rating} rating)`,
    `${input.correctCount}/${input.totalPlayed} ${input.industryLabel} movies · Top ${input.percentile}%`,
    '',
    'Terrible plots. Real movies.',
    'Think you can beat that?',
    url,
  ].join('\n');
}

/** A single participant on the party-mode leaderboard. */
export interface PartyPlayer {
  name: string;
  /** Points-this-game total (not adaptive rating). */
  score: number;
}

/** Format a party-mode results brag with the top-3 leaderboard and a UTM-tagged URL. */
export function getShareTextParty(players: PartyPlayer[], channel: ShareChannel): string {
  const top3 = [...players].sort((a, b) => b.score - a.score).slice(0, 3);
  const ranked = top3.map((p, i) => `${i + 1}. ${p.name} ${p.score}`).join(' · ');
  const url = buildShareUrl(channel, 'party');
  return [
    ranked,
    '',
    'Bad Desi Plots. Terrible plots, real movies.',
    url,
  ].join('\n');
}
