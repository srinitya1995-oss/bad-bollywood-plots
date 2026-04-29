import { useState, useCallback, useRef } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import { getGameInstance } from '../hooks/gameInstance';
import type { Player } from '../core/types';

type PlayMode = 'party' | 'solo';

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;
const NAME_MAX_LENGTH = 24;

// Fallback names for empty slots — desi-party flavor instead of "Player 1".
const DESI_FALLBACK_NAMES = [
  'Chintu', 'Pinky', 'Bunty', 'Guddu', 'Sonu', 'Monu', 'Rinku', 'Bubbly',
];

function makePlayer(): Player {
  return { name: '', score: 0, id: crypto.randomUUID() };
}

function defaultPlayers(): Player[] {
  return [makePlayer(), makePlayer()];
}

interface PlayerSetupProps {
  onClose: () => void;
}

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
    setPlayers((prev) => {
      if (prev.length >= MAX_PLAYERS) return prev;
      return [...prev, makePlayer()];
    });
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
    if (next === 'solo') {
      setPlayers([makePlayer()]);
    } else {
      setPlayers(defaultPlayers());
    }
  }, []);

  // Drag-and-drop reorder
  const handleDragStart = useCallback((idx: number) => {
    dragIdx.current = idx;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    dragOverIdx.current = idx;
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
    dragIdx.current = null;
    dragOverIdx.current = null;
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
    >
      <div className="v8-setup-panel">
        {/* Panel mast */}
        <div className="v8-setup-mast">
          <span className="v8-setup-mast__title" id="v8-setup-title">
            {mode === 'solo' ? 'SOLO MODE' : "WHO'S PLAYING?"}
          </span>
          <span className="v8-setup-mast__sub">
            {mode === 'solo' ? 'JUST YOU' : `MIN ${MIN_PLAYERS} \u00B7 MAX ${MAX_PLAYERS}`}
          </span>
        </div>

        {/* Close button */}
        <button
          className="v8-setup-close"
          onClick={onClose}
          aria-label="Close setup"
        >
          {'\u00D7'}
        </button>

        {/* Mode toggle */}
        <div className="v8-setup-mode">
          <button
            className={`v8-setup-mode__btn ${mode === 'party' ? 'is-active' : ''}`}
            onClick={() => switchMode('party')}
            aria-pressed={mode === 'party'}
          >
            PASS & PLAY
            <span className="v8-setup-mode__sub">One Phone, Party</span>
          </button>
          <button
            className={`v8-setup-mode__btn ${mode === 'solo' ? 'is-active' : ''}`}
            onClick={() => switchMode('solo')}
            aria-pressed={mode === 'solo'}
          >
            SOLO
            <span className="v8-setup-mode__sub">Just Me, Chill</span>
          </button>
        </div>

        {/* Players label */}
        <div className="v8-setup-label">THE LINE-UP</div>

        {/* Player list */}
        <div className="v8-setup-players" role="list">
          {players.map((p, i) => (
            <div
              key={p.id}
              className="v8-setup-row"
              role="listitem"
              draggable={mode === 'party' && players.length > 1}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={handleDrop}
            >
              {mode === 'party' && players.length > 1 && (
                <span className="v8-setup-grip" aria-hidden="true">{'\u2807'}</span>
              )}
              <span
                className={`v8-setup-num ${i % 2 === 0 ? '' : 'v8-setup-num--alt'}`}
                aria-hidden="true"
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
              />
              {mode === 'party' && players.length > MIN_PLAYERS && (
                <button
                  className="v8-setup-remove"
                  onClick={() => removePlayer(i)}
                  aria-label={`Remove player ${i + 1}`}
                >
                  {'\u00D7'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add player button */}
        {showAddButton && (
          <button
            className="v8-setup-add"
            onClick={addPlayer}
            aria-label="Add another player"
          >
            + ADD PLAYER
          </button>
        )}
      </div>

      {/* Bottom CTA */}
      {hasDuplicates && (
        <div className="v8-setup-warning" role="alert">
          TWO PLAYERS CAN'T SHARE A NAME. MAKE THEM UNIQUE.
        </div>
      )}
      <div className="v8-setup-cta">
        <button className="v8-setup-back" onClick={onClose}>BACK</button>
        <button
          className="v8-setup-start"
          onClick={handleStart}
          disabled={!canStart}
        >
          LET'S GO
        </button>
      </div>
    </div>
  );
}
