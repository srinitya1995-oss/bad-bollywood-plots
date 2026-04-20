interface EndRoundSheetProps {
  open: boolean;
  onKeepPlaying: () => void;
  onEndRound: () => void;
}

export function EndRoundSheet({ open, onKeepPlaying, onEndRound }: EndRoundSheetProps) {
  if (!open) return null;

  return (
    <div
      className="sheet-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="endround-title"
      onClick={(e) => { if (e.target === e.currentTarget) onKeepPlaying(); }}
    >
      <div className="v8-endround-sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="v8-endround-title" id="endround-title">
          END THIS ROUND?
        </h2>
        <p className="v8-endround-sub">
          Final scores will be shown with whoever is leading right now.
        </p>
        <button className="v8-endround-btn v8-endround-btn--keep" onClick={onKeepPlaying}>
          KEEP PLAYING
        </button>
        <button className="v8-endround-btn v8-endround-btn--end" onClick={onEndRound}>
          END ROUND
        </button>
      </div>
    </div>
  );
}
