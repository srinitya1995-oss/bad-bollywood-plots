import { useEffect, useRef } from 'react';

interface MenuPopoverProps {
  open: boolean;
  onClose: () => void;
  onEndRound: () => void;
  onBackHome: () => void;
  onHowTo?: () => void;
}

export function MenuPopover({ open, onClose, onEndRound, onBackHome, onHowTo }: MenuPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="v8-menu-popover" ref={ref} role="menu" aria-label="Game menu">
      {onHowTo && (
        <button className="v8-menu-item" role="menuitem" onClick={() => { try { window.posthog?.capture('menu_item_click', { item: 'how_to' }); } catch { /* non-critical */ } onClose(); onHowTo(); }}>
          How to Play
        </button>
      )}
      <button className="v8-menu-item v8-menu-item--danger" role="menuitem" onClick={() => { try { window.posthog?.capture('menu_item_click', { item: 'end_round' }); } catch { /* non-critical */ } onClose(); onEndRound(); }}>
        End round
        <span className="v8-menu-item__side">See final scores</span>
      </button>
      <button className="v8-menu-item" role="menuitem" onClick={() => { try { window.posthog?.capture('menu_item_click', { item: 'back_home' }); } catch { /* non-critical */ } onClose(); onBackHome(); }}>
        Back home
        <span className="v8-menu-item__side">Abandon round</span>
      </button>
    </div>
  );
}
