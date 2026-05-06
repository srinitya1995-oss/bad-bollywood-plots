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
