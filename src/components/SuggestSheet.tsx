import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { toast } from './Toast';

interface SuggestSheetProps { onClose: () => void; defaultIndustry?: string; }

export function SuggestSheet({ onClose, defaultIndustry }: SuggestSheetProps) {
  const [movie, setMovie] = useState('');
  const [industry, setIndustry] = useState(defaultIndustry ?? '');

  const handleSubmit = () => {
    if (!movie.trim()) { toast('Please enter a movie name'); return; }
    if (!industry) { toast('Please select Bollywood, Tollywood, or Other'); return; }
    if (movie.trim().length > 200) { toast('Movie name is too long'); return; }
    getGameInstance().storage.saveSuggestion({ movie: movie.trim(), industry, timestamp: Date.now(), sessionId: getGameInstance().sessionId });
    toast("Thanks! We'll check it out.");
    onClose();
  };

  return (
    <div className="sheet-overlay open" role="dialog" aria-modal="true" aria-labelledby="suggest-sheet-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="sheet-title" id="suggest-sheet-title">Suggest a movie</h2>
        <p className="sheet-sub">We'll write a terrible plot description for it</p>
        <input className="form-input" placeholder="Movie name" value={movie} onChange={e => setMovie(e.target.value)} aria-label="Movie name" />
        <select className="form-input" value={industry} onChange={e => setIndustry(e.target.value)} aria-label="Industry">
          <option value="" disabled>Select language</option>
          <option value="Hindi">Hindi</option>
          <option value="Telugu">Telugu</option>
          <option value="Tamil">Tamil</option>
          <option value="Malayalam">Malayalam</option>
          <option value="Other">Other</option>
        </select>
        <p className="form-hint">We read every suggestion. If we add it, you'll be in the credits.</p>
        <button className="btn-primary" onClick={handleSubmit}>Submit suggestion</button>
        <button className="btn-skip" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}
