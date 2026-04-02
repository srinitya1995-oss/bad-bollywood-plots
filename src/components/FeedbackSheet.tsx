import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { toast } from './Toast';

interface FeedbackSheetProps { onClose: () => void; }

export function FeedbackSheet({ onClose }: FeedbackSheetProps) {
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');

  const toggleTag = (tag: string) => { setTags(prev => { const next = new Set(prev); if (next.has(tag)) next.delete(tag); else next.add(tag); return next; }); };

  const handleSubmit = () => {
    if (tags.size === 0 && !text.trim()) { toast('Please select at least one tag or write something'); return; }
    getGameInstance().storage.saveFeedback({ tags: [...tags], text: text.trim(), timestamp: Date.now(), sessionId: '' });
    toast('Thanks for your feedback!');
    onClose();
  };

  const tagOptions = [
    { value: 'love_it', label: 'Love it' }, { value: 'needs_work', label: 'Needs work' },
    { value: 'want_more_cards', label: 'Want more cards' }, { value: 'great_for_parties', label: 'Great for parties' },
    { value: 'ui_issue', label: 'UI issue' }, { value: 'bug', label: 'Found a bug' },
  ];

  return (
    <div className="sheet-overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="sheet-title">Share your feedback</h2>
        <p className="sheet-sub">Tell us what's working and what's not</p>
        <div className="fb-tags">
          {tagOptions.map(t => <button key={t.value} className="fb-tag" aria-pressed={tags.has(t.value)} onClick={() => toggleTag(t.value)}>{t.label}</button>)}
        </div>
        <textarea className="fb-textarea" placeholder="Anything else? (optional)" value={text} onChange={e => setText(e.target.value)} />
        <button className="btn-primary" onClick={handleSubmit}>Submit feedback</button>
        <button className="btn-skip" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
