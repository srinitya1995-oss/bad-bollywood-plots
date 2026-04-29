import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { track } from '../analytics/posthog';
import { submitFeedback } from '../storage/feedback';
import { toast } from './Toast';

interface FeedbackSheetProps { onClose: () => void; }

const TAG_OPTIONS = [
  { value: 'love_it', label: '🔥 Love it' },
  { value: 'needs_work', label: '🛠 Needs work' },
  { value: 'want_more_cards', label: '🃏 Want more cards' },
  { value: 'great_for_parties', label: '🎉 Great for parties' },
  { value: 'ui_issue', label: '👀 UI issue' },
  { value: 'bug', label: '🐛 Found a bug' },
];

export function FeedbackSheet({ onClose }: FeedbackSheetProps) {
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const handleSubmit = () => {
    if (tags.size === 0 && !text.trim()) {
      toast('Pick at least one or write something');
      return;
    }
    getGameInstance().storage.saveFeedback({
      tags: [...tags],
      text: text.trim(),
      timestamp: Date.now(),
      sessionId: getGameInstance().sessionId,
    });
    const tagPrefix = tags.size > 0 ? `[${[...tags].join(', ')}] ` : '';
    const message = (tagPrefix + text.trim()).trim();
    if (message) submitFeedback({ message });
    track.feedbackSent({ messageLength: text.trim().length });
    toast('Thanks for the feedback!');
    onClose();
  };

  return (
    <div
      className="sheet-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-sheet-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(15,20,48,0.55)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        className="v8-feedback-sheet"
        style={{
          width: '100%', background: 'var(--cream)', color: 'var(--ink)',
          border: '3px solid var(--ink)', borderBottom: 'none',
          padding: '14px 16px 16px', maxHeight: '85%', overflow: 'auto',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        <div
          className="sheet-handle"
          aria-hidden="true"
          style={{ width: 44, height: 4, background: 'var(--ink)', margin: '0 auto 4px', opacity: 0.3 }}
        />
        <div
          style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.26em', color: 'var(--tomato)', textTransform: 'uppercase' }}
        >
          Feedback · tap all that apply
        </div>
        <h2
          className="v8-feedback-title"
          id="feedback-sheet-title"
          style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 28, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, margin: 0 }}
        >
          Share your thoughts
        </h2>

        <div
          className="v8-feedback-tags"
          style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}
        >
          {TAG_OPTIONS.map((t) => {
            const active = tags.has(t.value);
            return (
              <button
                key={t.value}
                className={`v8-feedback-tag${active ? ' is-active' : ''}`}
                onClick={() => toggleTag(t.value)}
                aria-pressed={active}
                style={{
                  padding: '9px 10px', border: '2px solid var(--ink)',
                  background: active ? 'var(--gold)' : 'var(--cream)',
                  color: 'var(--ink)',
                  fontFamily: 'Anton, Impact, sans-serif', fontSize: 13,
                  textTransform: 'uppercase', letterSpacing: '-0.005em', textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 4, border: '2px solid var(--ink)', padding: '10px 12px',
            background: 'rgba(255,255,255,0.5)',
          }}
        >
          <div
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-muted)', textTransform: 'uppercase' }}
          >
            Anything else?
          </div>
          <textarea
            className="v8-feedback-textarea"
            placeholder="Tell us what could be better."
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Additional feedback"
            style={{
              marginTop: 4, width: '100%',
              fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink)',
              background: 'transparent', border: 'none', outline: 'none', resize: 'vertical',
              minHeight: 60,
            }}
          />
        </div>

        <div
          style={{ marginTop: 4, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}
        >
          <button
            className="v8-feedback-cancel"
            onClick={onClose}
            style={{
              padding: '10px 14px', background: 'var(--cream)',
              border: '2px solid var(--ink)',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: '0.22em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Maybe later
          </button>
          <button
            className="v8-feedback-submit"
            onClick={handleSubmit}
            style={{
              padding: '10px 14px', background: 'var(--ink)', color: 'var(--cream)',
              border: '3px solid var(--ink)', boxShadow: '3px 3px 0 var(--tomato)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 16,
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Send feedback
          </button>
        </div>
      </div>
    </div>
  );
}
