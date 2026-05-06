export type ShareChannel = 'whatsapp' | 'x' | 'reddit' | 'copy';
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

export interface SoloShareInput {
  tier: string;
  rating: number;
  correctCount: number;
  totalPlayed: number;
  industryLabel: string;
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
