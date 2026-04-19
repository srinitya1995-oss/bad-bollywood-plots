import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { track } from '../analytics/posthog';
import { submitSuggestion, type SuggestIndustry } from '../storage/feedback';
import { toast } from './Toast';

const INDUSTRY_LABEL_TO_CODE: Record<string, SuggestIndustry> = {
  Hindi: 'BW',
  Telugu: 'TW',
  Tamil: 'other',
  Malayalam: 'other',
  Other: 'other',
};

interface SuggestSheetProps { onClose: () => void; defaultIndustry?: string; }

export function SuggestSheet({ onClose, defaultIndustry }: SuggestSheetProps) {
  const [movie, setMovie] = useState('');
  const [industry, setIndustry] = useState(defaultIndustry ?? '');

  const handleSubmit = () => {
    if (!movie.trim()) { toast('Please enter a movie name'); return; }
    if (!industry) { toast('Please select a language'); return; }
    if (movie.trim().length > 200) { toast('Movie name is too long'); return; }
    // Local cache for offline resilience.
    getGameInstance().storage.saveSuggestion({ movie: movie.trim(), industry, timestamp: Date.now(), sessionId: getGameInstance().sessionId });
    // Supabase write with correct column names (`movie_title`) and enum industry code.
    submitSuggestion({ title: movie.trim(), industry: INDUSTRY_LABEL_TO_CODE[industry] ?? 'other' });
    track.suggestSent({ title: movie.trim() });
    toast("Thanks! We'll check it out.");
    onClose();
  };

  return (
    <div className="sheet-overlay open" role="dialog" aria-modal="true" aria-labelledby="suggest-sheet-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="v8-suggest-sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="v8-suggest-title" id="suggest-sheet-title">SUGGEST A MOVIE</h2>
        <p className="v8-suggest-sub">We will write a terrible plot description for it</p>
        <input
          className="v8-suggest-input"
          placeholder="e.g. Sholay, Lagaan, Om Shanti Om..."
          value={movie}
          onChange={e => setMovie(e.target.value)}
          maxLength={200}
          aria-label="Movie name"
        />
        <select
          className="v8-suggest-input"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          aria-label="Language"
        >
          <option value="" disabled>Select language</option>
          <option value="Hindi">Hindi</option>
          <option value="Telugu">Telugu</option>
          <option value="Tamil">Tamil</option>
          <option value="Malayalam">Malayalam</option>
          <option value="Other">Other</option>
        </select>
        <p className="v8-suggest-hint">We read every suggestion. If we add it, you will be in the credits.</p>
        <button className="v8-suggest-submit" onClick={handleSubmit}>Send Suggestion</button>
        <button className="v8-suggest-cancel" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}
