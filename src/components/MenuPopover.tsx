import { useEffect, useRef, useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';

interface MenuPopoverProps {
  open: boolean;
  onClose: () => void;
  onEndRound: () => void;
  onBackHome: () => void;
}

export function MenuPopover({ open, onClose, onEndRound, onBackHome }: MenuPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [soundOn, setSoundOn] = useState(() => getGameInstance().getSettings().sound ?? true);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    getGameInstance().setSettings({ sound: next });
  };

  return (
    <div className="v8-menu-popover" ref={ref} role="menu" aria-label="Game menu">
      <button className="v8-menu-item" role="menuitem" onClick={handleToggleSound}>
        Sound
        <span className="v8-menu-item__side">{soundOn ? 'On' : 'Off'}</span>
      </button>
      <button className="v8-menu-item v8-menu-item--danger" role="menuitem" onClick={() => { onClose(); onEndRound(); }}>
        End round
        <span className="v8-menu-item__side">See final scores</span>
      </button>
      <button className="v8-menu-item" role="menuitem" onClick={() => { onClose(); onBackHome(); }}>
        Back home
        <span className="v8-menu-item__side">Abandon round</span>
      </button>
    </div>
  );
}
