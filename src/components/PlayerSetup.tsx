import { useState, useCallback, useRef } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import { getGameInstance } from '../hooks/gameInstance';
import type { Player } from '../core/types';

type PlayMode = 'party' | 'solo';

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;
const NAME_MAX_LENGTH = 24;

const DESI_FALLBACK_NAMES = [
  'Chintu', 'Pinky', 'Bunty', 'Guddu', 'Sonu', 'Monu', 'Rinku', 'Bubbly',
];

const PLAYER_COLORS = ['var(--tomato)', 'var(--gold)', 'var(--emerald)', 'var(--mauve)'];

function makePlayer(): Player {
  return { name: '', score: 0, id: crypto.randomUUID() };
}

function defaultPlayers(): Player[] {
  return [makePlayer(), makePlayer()];
}

interface PlayerSetupProps { onClose: () => void; }

export function PlayerSetup({ onClose }: PlayerSetupProps) {
  const actions = useGameActions();
  const [mode, setMode] = useState<PlayMode>(() => getGameInstance().getSetupInitialMode());
  const [players, setPlayers] = useState<Player[]>(() =>
    getGameInstance().getSetupInitialMode() === 'solo' ? [makePlayer()] : defaultPlayers(),
  );
  const dragIdx = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);

  const addPlayer = useCallback(() => {
    if (mode === 'solo') return;
    setPlayers((prev) => prev.length >= MAX_PLAYERS ? prev : [...prev, makePlayer()]);
  }, [mode]);

  const removePlayer = useCallback((idx: number) => {
    setPlayers((prev) => {
      if (mode === 'party' && prev.length <= MIN_PLAYERS) return prev;
      if (mode === 'solo') return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }, [mode]);

  const updateName = useCallback((idx: number, name: string) => {
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, name } : p)));
  }, []);

  const switchMode = useCallback((next: PlayMode) => {
    setMode(next);
    try { window.posthog?.capture('setup_mode_switch', { mode: next }); } catch { /* non-critical */ }
    setPlayers(next === 'solo' ? [makePlayer()] : defaultPlayers());
  }, []);

  const handleDragStart = useCallback((idx: number) => { dragIdx.current = idx; }, []);
  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault(); dragOverIdx.current = idx;
  }, []);
  const handleDrop = useCallback(() => {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) return;
    setPlayers((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragIdx.current = null; dragOverIdx.current = null;
  }, []);

  const filledNames = players.map((p, i) => (p.name.trim() || `Player ${i + 1}`).toLowerCase());
  const hasDuplicates = mode === 'party' && new Set(filledNames).size !== filledNames.length;

  const handleStart = useCallback(() => {
    if (hasDuplicates) return;
    const filled = players.map((p, i) => ({
      ...p,
      name: p.name.trim() || DESI_FALLBACK_NAMES[i % DESI_FALLBACK_NAMES.length],
    }));
    actions.startGame(filled);
    onClose();
  }, [players, actions, onClose, hasDuplicates]);

  const canStart = (mode === 'solo' || players.length >= MIN_PLAYERS) && !hasDuplicates;
  const showAddButton = mode === 'party' && players.length < MAX_PLAYERS;

  return (
    <div
      className="v8-setup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="v8-setup-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'absolute', top: 52, left: 0, right: 0, bottom: 0, zIndex: 50,
        background: 'rgba(15,20,48,0.55)',
      }}
    >
      <div
        className="v8-setup-panel"
        style={{
          position: 'absolute', left: 12, right: 12, top: 18, bottom: 12,
          background: 'var(--cream)', color: 'var(--ink)',
          border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)',
          padding: '16px 16px 14px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Mast */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              className="v8-setup-mast__sub"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.26em',
                color: 'var(--tomato)', textTransform: 'uppercase',
              }}
            >
              {mode === 'solo' ? 'JUST YOU' : `PASS & PLAY · MIN ${MIN_PLAYERS} · MAX ${MAX_PLAYERS}`}
            </div>
            <div
              className="v8-setup-mast__title"
              id="v8-setup-title"
              style={{
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 38, color: 'var(--ink)',
                lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.01em', marginTop: 4,
              }}
            >
              {mode === 'solo' ? 'SOLO MODE' : "WHO'S PLAYING?"}
            </div>
          </div>
          <button
            className="v8-setup-close"
            onClick={onClose}
            aria-label="Close setup"
            style={{
              fontSize: 20, color: 'var(--ink)', background: 'none', border: 'none',
              cursor: 'pointer', padding: 4, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Mode toggle */}
        <div
          className="v8-setup-mode"
          style={{
            marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr',
            border: '2px solid var(--ink)',
          }}
        >
          <button
            className={`v8-setup-mode__btn ${mode === 'party' ? 'is-active' : ''}`}
            onClick={() => switchMode('party')}
            aria-pressed={mode === 'party'}
            style={{
              padding: 8, cursor: 'pointer',
              background: mode === 'party' ? 'var(--ink)' : 'var(--cream)',
              color: mode === 'party' ? 'var(--cream)' : 'var(--ink)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 14,
              textTransform: 'uppercase', border: 'none',
            }}
          >
            PASS &amp; PLAY
            <span
              className="v8-setup-mode__sub"
              style={{
                display: 'block', fontFamily: 'Bebas Neue, sans-serif', fontSize: 9,
                letterSpacing: '0.2em', color: mode === 'party' ? 'var(--gold)' : 'var(--ink-muted)',
                marginTop: 2,
              }}
            >
              ONE PHONE · PARTY
            </span>
          </button>
          <button
            className={`v8-setup-mode__btn ${mode === 'solo' ? 'is-active' : ''}`}
            onClick={() => switchMode('solo')}
            aria-pressed={mode === 'solo'}
            style={{
              padding: 8, cursor: 'pointer',
              background: mode === 'solo' ? 'var(--ink)' : 'var(--cream)',
              color: mode === 'solo' ? 'var(--cream)' : 'var(--ink)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 14, textTransform: 'uppercase',
              borderLeft: '2px solid var(--ink)', border: 'none', borderLeftWidth: 2, borderLeftStyle: 'solid', borderLeftColor: 'var(--ink)',
            }}
          >
            SOLO
            <span
              className="v8-setup-mode__sub"
              style={{
                display: 'block', fontFamily: 'Bebas Neue, sans-serif', fontSize: 9,
                letterSpacing: '0.2em', color: mode === 'solo' ? 'var(--tomato)' : 'var(--ink-muted)',
                marginTop: 2,
              }}
            >
              JUST ME · CHILL
            </span>
          </button>
        </div>

        {/* Players label */}
        <div
          className="v8-setup-label"
          style={{
            marginTop: 12, fontFamily: 'Bebas Neue, sans-serif', fontSize: 10,
            letterSpacing: '0.24em', color: 'var(--ink-muted)', textTransform: 'uppercase',
          }}
        >
          THE LINE-UP
        </div>

        {/* Player rows */}
        <div
          className="v8-setup-players"
          role="list"
          style={{ marginTop: 6, display: 'grid', gap: 6, overflowY: 'auto', flex: 1, minHeight: 0 }}
        >
          {players.map((p, i) => (
            <div
              key={p.id}
              className="v8-setup-row"
              role="listitem"
              draggable={mode === 'party' && players.length > 1}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={handleDrop}
              style={{
                display: 'grid',
                gridTemplateColumns: mode === 'party' && players.length > 1
                  ? '18px 28px 1fr 18px'
                  : '28px 1fr 18px',
                gap: 8, alignItems: 'center',
                border: '2px solid var(--ink)', padding: '8px 10px', background: 'var(--cream)',
              }}
            >
              {mode === 'party' && players.length > 1 && (
                <span
                  className="v8-setup-grip"
                  aria-hidden="true"
                  style={{ color: 'var(--ink-muted)', fontSize: 14, cursor: 'grab' }}
                >
                  {'⠇'}
                </span>
              )}
              <span
                className={`v8-setup-num ${i % 2 === 0 ? '' : 'v8-setup-num--alt'}`}
                aria-hidden="true"
                style={{
                  background: PLAYER_COLORS[i % PLAYER_COLORS.length],
                  color: 'var(--cream)', width: 24, height: 24,
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'Anton, Impact, sans-serif', fontSize: 14,
                }}
              >
                {i + 1}
              </span>
              <input
                className="v8-setup-input"
                type="text"
                maxLength={NAME_MAX_LENGTH}
                placeholder={`Player ${i + 1}`}
                value={p.name}
                onChange={(e) => updateName(i, e.target.value)}
                aria-label={`Player ${i + 1} name`}
                style={{
                  fontFamily: 'Anton, Impact, sans-serif', fontSize: 20, color: 'var(--ink)',
                  textTransform: 'uppercase', letterSpacing: '-0.005em',
                  background: 'transparent', border: 'none', outline: 'none', minWidth: 0,
                }}
              />
              {mode === 'party' && players.length > MIN_PLAYERS ? (
                <button
                  className="v8-setup-remove"
                  onClick={() => removePlayer(i)}
                  aria-label={`Remove player ${i + 1}`}
                  style={{
                    color: 'var(--tomato)', fontSize: 14, background: 'none',
                    border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1,
                  }}
                >
                  ×
                </button>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>
          ))}

          {showAddButton && (
            <button
              className="v8-setup-add"
              onClick={addPlayer}
              aria-label="Add another player"
              style={{
                padding: '8px 10px', border: '2px dashed var(--ink)', background: 'transparent',
                color: 'var(--ink-muted)', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14,
              }}
            >
              + ADD PLAYER
            </button>
          )}
        </div>

        {hasDuplicates && (
          <div
            className="v8-setup-warning"
            role="alert"
            style={{
              marginTop: 8, padding: '6px 10px', background: 'rgba(229,39,107,0.12)',
              border: '2px solid var(--tomato)', color: 'var(--tomato)',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            TWO PLAYERS CAN'T SHARE A NAME. MAKE THEM UNIQUE.
          </div>
        )}

        {/* CTA row */}
        <div
          className="v8-setup-cta"
          style={{
            marginTop: 10, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8,
          }}
        >
          <button
            className="v8-setup-back"
            onClick={onClose}
            style={{
              padding: '12px 14px', background: 'var(--cream)', color: 'var(--ink)',
              border: '2px solid var(--ink)',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.22em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            BACK
          </button>
          <button
            className="v8-setup-start"
            onClick={handleStart}
            disabled={!canStart}
            style={{
              padding: '12px 14px',
              background: canStart ? 'var(--ink)' : 'rgba(15,20,48,0.4)',
              color: 'var(--cream)', border: '3px solid var(--ink)',
              boxShadow: canStart ? '4px 4px 0 var(--tomato)' : 'none',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 18,
              textTransform: 'uppercase', letterSpacing: '-0.005em',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: canStart ? 'pointer' : 'not-allowed',
            }}
          >
            {"LET'S GO"}
            <span style={{ color: 'var(--gold)', marginLeft: 'auto' }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
