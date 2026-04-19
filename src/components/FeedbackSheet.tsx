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
    setTags(prev => {
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
    // Local cache for offline resilience.
    getGameInstance().storage.saveFeedback({
      tags: [...tags],
      text: text.trim(),
      timestamp: Date.now(),
      sessionId: getGameInstance().sessionId,
    });
    // Supabase write — combines selected tags (as a bracketed prefix) with freeform text
    // into the single `message` column that the prod schema expects.
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
    >
      <div className="v8-feedback-sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="v8-feedback-title" id="feedback-sheet-title">
          Share your thoughts
        </h2>
        <p className="v8-feedback-sub">
          Tap all that apply
        </p>

        <div className="v8-feedback-tags">
          {TAG_OPTIONS.map(t => (
            <button
              key={t.value}
              className={`v8-feedback-tag${tags.has(t.value) ? ' is-active' : ''}`}
              onClick={() => toggleTag(t.value)}
              aria-pressed={tags.has(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          className="v8-feedback-textarea"
          placeholder="Anything else you want to tell us?"
          value={text}
          onChange={e => setText(e.target.value)}
          aria-label="Additional feedback"
        />

        <button className="v8-feedback-submit" onClick={handleSubmit}>
          Send feedback
        </button>
        <button className="v8-feedback-cancel" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
