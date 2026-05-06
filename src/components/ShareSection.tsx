import { useGameState } from '../hooks/useGameState';
import { getAbilityTier, getAbilityPercentile, pickSoloEmoji } from '../core/adaptive';
import { INDUSTRY_META } from '../core/types';
import {
  buildShareUrl,
  getShareTextSolo,
  getShareTextParty,
  type ShareChannel,
} from '../utils/share';
import { toast } from './Toast';

const CHANNELS: { id: ShareChannel; label: string; aria: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp', aria: 'Share on WhatsApp' },
  { id: 'x',        label: 'X',        aria: 'Share on X' },
  { id: 'reddit',   label: 'Reddit',   aria: 'Share on Reddit' },
  { id: 'copy',     label: 'Copy',     aria: 'Copy share text' },
];

export function ShareSection() {
  const { payload } = useGameState();
  const { scorer, idx, scores, adaptive, industry } = payload;
  const isParty = scorer.players.length > 1;
  const mode: 'solo' | 'party' = isParty ? 'party' : 'solo';

  function getText(channel: ShareChannel): string {
    if (isParty) {
      return getShareTextParty(
        scorer.players.map((p, i) => ({ name: p.name, score: scores[i] ?? 0 })),
        channel,
      );
    }
    const ind = industry ? INDUSTRY_META[industry].lang : 'Cinema';
    const ability = adaptive.ability;
    return getShareTextSolo({
      tier: getAbilityTier(ability),
      rating: ability,
      correctCount: scorer.correctCount,
      totalPlayed: idx,
      industryLabel: ind,
      percentile: getAbilityPercentile(ability),
      emoji: pickSoloEmoji(ability),
    }, channel);
  }

  function handleClick(channel: ShareChannel) {
    window.posthog?.capture('share_click', { channel, mode });
    const text = getText(channel);
    if (channel === 'copy') {
      void navigator.clipboard.writeText(text);
      toast('Copied');
      return;
    }
    const enc = encodeURIComponent;
    const url =
      channel === 'whatsapp'
        ? `https://wa.me/?text=${enc(text)}`
      : channel === 'x'
        ? `https://twitter.com/intent/tweet?text=${enc(text)}`
        : `https://reddit.com/submit?title=${enc(text.split('\n')[0])}&url=${enc(buildShareUrl('reddit', mode))}`;
    window.open(url, '_blank');
  }

  return (
    <div className="v8-results-share">
      <div className="v8-results-share__label">Share the damage</div>
      <div className="v8-results-share__row">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`v8-results-share__btn v8-results-share__btn--${c.id}`}
            aria-label={c.aria}
            onClick={() => handleClick(c.id)}
          >
            <span className="v8-results-share__icon" aria-hidden="true">
              {c.id === 'whatsapp' ? '\u{1F4AC}' : c.id === 'x' ? '\u{2715}' : c.id === 'reddit' ? '\u{1F4E2}' : '\u{1F4CB}'}
            </span>
            <span className="v8-results-share__name">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
