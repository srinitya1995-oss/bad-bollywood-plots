import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import type { DifficultyFilter, RoundLength } from '../core/types';

interface SettingsScreenProps {
  onClose: () => void;
}

const DIFF_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const ROUND_OPTIONS: RoundLength[] = [5, 8, 10, 12];

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const g = getGameInstance();
  const saved = g.getSettings();
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(saved.difficultyFilter ?? 'all');
  const [roundLen, setRoundLen] = useState<RoundLength>(saved.roundLen ?? 10);
  const [sound, setSound] = useState(saved.sound ?? true);

  const handleDone = () => {
    g.setSettings({ difficultyFilter: difficulty, roundLen, sound });
    onClose();
  };

  return (
    <div
      className="sheet-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="v8-settings-panel">
        <div className="v8-settings-mast">
          <span className="v8-settings-mast__title">SETTINGS</span>
          <span className="v8-settings-mast__sub">YOUR PREFERENCES</span>
        </div>

        <div className="v8-settings-body">
          {/* Sound */}
          <div className="v8-settings-row">
            <div className="v8-settings-label">
              <h3>Sound</h3>
              <p>Card flip and win jingles</p>
            </div>
            <button
              className="v8-settings-toggle"
              role="switch"
              aria-checked={sound}
              onClick={() => setSound(!sound)}
            >
              <span className="v8-settings-toggle__dot" />
            </button>
          </div>

          {/* Difficulty */}
          <div className="v8-settings-row v8-settings-row--col">
            <div className="v8-settings-label">
              <h3>Difficulty Filter</h3>
              <p>Which plots make the deck</p>
            </div>
            <div className="v8-settings-seg" role="radiogroup" aria-label="Difficulty filter">
              {DIFF_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`v8-settings-seg__btn${difficulty === opt.value ? ' is-active' : ''}`}
                  role="radio"
                  aria-checked={difficulty === opt.value}
                  onClick={() => setDifficulty(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Round Length */}
          <div className="v8-settings-row v8-settings-row--col">
            <div className="v8-settings-label">
              <h3>Round Length</h3>
              <p>Cards per round</p>
            </div>
            <div className="v8-settings-seg" role="radiogroup" aria-label="Round length">
              {ROUND_OPTIONS.map((len) => (
                <button
                  key={len}
                  className={`v8-settings-seg__btn${roundLen === len ? ' is-active' : ''}`}
                  role="radio"
                  aria-checked={roundLen === len}
                  onClick={() => setRoundLen(len)}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="v8-settings-cta">
          <button className="v8-settings-done" onClick={handleDone}>
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
