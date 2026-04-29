import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { track } from '../analytics/posthog';
import type { DifficultyFilter, RoundLength } from '../core/types';

const ENABLE_SOUND_TOGGLE = false;

interface SettingsScreenProps { onClose: () => void; }

const DIFF_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];
const ROUND_OPTIONS: RoundLength[] = [5, 8, 10, 12];

const segCellStyle = (active: boolean, withRightBorder: boolean): React.CSSProperties => ({
  padding: '9px 4px', cursor: 'pointer',
  background: active ? 'var(--ink)' : 'var(--cream)',
  color: active ? 'var(--cream)' : 'var(--ink)',
  fontFamily: 'Anton, Impact, sans-serif', fontSize: 14, textTransform: 'uppercase',
  borderRight: withRightBorder ? '2px solid var(--ink)' : 'none',
  border: 'none',
});

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const g = getGameInstance();
  const saved = g.getSettings();
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(saved.difficultyFilter ?? 'all');
  const [roundLen, setRoundLen] = useState<RoundLength>(saved.roundLen ?? 10);
  const [sound, setSound] = useState<boolean>(saved.sound ?? true);

  const handleDone = () => {
    const prev = g.getSettings();
    g.setSettings({ difficultyFilter: difficulty, roundLen, sound });
    if (prev.difficultyFilter !== difficulty) track.settingsChanged({ key: 'difficultyFilter', value: difficulty });
    if (prev.roundLen !== roundLen) track.settingsChanged({ key: 'roundLen', value: roundLen });
    if (prev.sound !== sound) track.settingsChanged({ key: 'sound', value: sound });
    onClose();
  };

  return (
    <div
      className="sheet-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(15,20,48,0.55)' }}
    >
      <div
        className="v8-settings-panel"
        style={{
          position: 'absolute', inset: 0, background: 'var(--cream)', color: 'var(--ink)',
          padding: '16px 18px 20px', overflow: 'auto',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        <div
          className="v8-settings-mast"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <div>
            <div
              className="v8-settings-mast__sub"
              style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.28em', color: 'var(--tomato)', textTransform: 'uppercase' }}
            >
              Your preferences
            </div>
            <div
              className="v8-settings-mast__title"
              id="settings-title"
              style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 42, color: 'var(--ink)', textTransform: 'uppercase', lineHeight: 1, letterSpacing: '-0.015em' }}
            >
              Settings
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{ fontSize: 18, color: 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            ×
          </button>
        </div>

        {/* Difficulty */}
        <div className="v8-settings-row v8-settings-row--col">
          <div
            className="v8-settings-label"
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.24em', color: 'var(--ink-muted)', textTransform: 'uppercase' }}
          >
            Difficulty filter
          </div>
          <div
            className="v8-settings-seg"
            role="radiogroup"
            aria-label="Difficulty filter"
            style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '2px solid var(--ink)' }}
          >
            {DIFF_OPTIONS.map((opt, i) => (
              <button
                key={opt.value}
                className={`v8-settings-seg__btn${difficulty === opt.value ? ' is-active' : ''}`}
                role="radio"
                aria-checked={difficulty === opt.value}
                onClick={() => setDifficulty(opt.value)}
                style={segCellStyle(difficulty === opt.value, i < DIFF_OPTIONS.length - 1)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Round Length */}
        <div className="v8-settings-row v8-settings-row--col">
          <div
            className="v8-settings-label"
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.24em', color: 'var(--ink-muted)', textTransform: 'uppercase' }}
          >
            Round length · party
          </div>
          <div
            className="v8-settings-seg"
            role="radiogroup"
            aria-label="Round length"
            style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '2px solid var(--ink)' }}
          >
            {ROUND_OPTIONS.map((len, i) => (
              <button
                key={len}
                className={`v8-settings-seg__btn${roundLen === len ? ' is-active' : ''}`}
                role="radio"
                aria-checked={roundLen === len}
                onClick={() => setRoundLen(len)}
                style={{
                  ...segCellStyle(roundLen === len, i < ROUND_OPTIONS.length - 1),
                  background: roundLen === len ? 'var(--tomato)' : 'var(--cream)',
                  color: roundLen === len ? 'var(--cream)' : 'var(--ink)',
                  fontSize: 18,
                }}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        {/* Sound */}
        {ENABLE_SOUND_TOGGLE && (
          <div
            className="v8-settings-row"
            style={{
              border: '2px solid var(--ink)', padding: '10px 12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div className="v8-settings-label">
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.24em', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                Sound
              </div>
              <div
                style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 18, color: 'var(--ink)', textTransform: 'uppercase' }}
              >
                Dhol on flip
              </div>
            </div>
            <button
              className={`v8-settings-switch${sound ? ' is-on' : ''}`}
              role="switch"
              aria-checked={sound}
              aria-label="Toggle sound"
              onClick={() => setSound((s) => !s)}
              style={{
                width: 44, height: 26, background: sound ? 'var(--tomato)' : 'var(--cream)',
                border: '2px solid var(--ink)', position: 'relative', cursor: 'pointer', padding: 0,
              }}
            >
              <span
                className="v8-settings-switch__knob"
                aria-hidden="true"
                style={{
                  position: 'absolute', top: 1, [sound ? 'right' : 'left']: 1, width: 18, height: 18,
                  background: sound ? 'var(--cream)' : 'var(--ink)', border: '1px solid var(--ink)',
                  display: 'block',
                }}
              />
              <span className="sr-only">{sound ? 'On' : 'Off'}</span>
            </button>
          </div>
        )}

        <div className="v8-settings-cta" style={{ marginTop: 'auto' }}>
          <button
            className="v8-settings-done"
            onClick={handleDone}
            style={{
              width: '100%', padding: 14, background: 'var(--ink)', color: 'var(--cream)',
              border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--tomato)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 20, textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
