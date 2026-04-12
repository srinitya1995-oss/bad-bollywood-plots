import { useState } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import type { Player } from '../core/types';

const PLAYER_COLORS = ['gold', 'red', 'green', 'indigo'];

interface PlayerSetupProps { onClose: () => void; }

export function PlayerSetup({ onClose }: PlayerSetupProps) {
  const actions = useGameActions();
  const [players, setPlayers] = useState<Player[]>([{ name: '', score: 0 }]);

  const addPlayer = () => { if (players.length >= 4) return; setPlayers([...players, { name: '', score: 0 }]); };
  const removePlayer = (idx: number) => { setPlayers(players.filter((_, i) => i !== idx)); };
  const updateName = (idx: number, name: string) => { setPlayers(players.map((p, i) => (i === idx ? { ...p, name } : p))); };

  const handleStart = () => {
    const filled = players.map((p, i) => ({ ...p, name: p.name.trim() || `Player ${i + 1}` }));
    actions.startGame(filled);
    onClose();
  };

  return (
    <div className="sheet-overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="sheet-title">Who's playing?</h2>
        <p className="sheet-sub">Add players or just tap Start for solo</p>
        <div className="player-list">
          {players.map((p, i) => (
            <div key={i} className="player-row" style={{ '--player-color': PLAYER_COLORS[i] } as React.CSSProperties}>
              <span className="player-avatar" aria-hidden="true">P{i + 1}</span>
              <input className="player-input" type="text" placeholder={`Player ${i + 1}`} value={p.name} onChange={(e) => updateName(i, e.target.value)} aria-label={`Player ${i + 1} name`} />
              {players.length > 1 && <button className="player-remove" aria-label={`Remove player ${i + 1}`} onClick={() => removePlayer(i)}>{'\u00d7'}</button>}
            </div>
          ))}
        </div>
        {players.length < 4 && <button className="add-player-btn" onClick={addPlayer}>+ Add player</button>}
        <button className="btn-primary" onClick={handleStart}>Start game</button>
      </div>
    </div>
  );
}
