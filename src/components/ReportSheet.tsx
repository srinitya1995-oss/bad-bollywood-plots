import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { track } from '../analytics/posthog';
import { toast } from './Toast';

interface ReportSheetProps {
  open: boolean;
  cardId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Wrong answer shown',
  'Plot is inaccurate',
  'Card is offensive',
  'Too easy',
  'Too hard',
  'Duplicate card',
  'Other',
] as const;

export function ReportSheet({ open, cardId, onClose }: ReportSheetProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (!selected) {
      toast('Please select a reason');
      return;
    }
    const g = getGameInstance();
    g.storage.logEvent({
      event: 'card:report',
      props: {
        cardId,
        reason: selected,
        details: details.trim(),
      },
      sessionId: g.sessionId,
      timestamp: Date.now(),
    });
    track.reportSent({ cardId, reason: selected });
    toast('Thanks, we will take a look.');
    setSelected(null);
    setDetails('');
    onClose();
  };

  return (
    <div
      className="sheet-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="v8-report-sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="v8-report-title" id="report-title">
          REPORT THIS PLOT
        </h2>
        <p className="v8-report-sub">What is wrong with this card?</p>

        <div className="v8-report-tags">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              className={`v8-report-tag${selected === reason ? ' is-active' : ''}`}
              onClick={() => setSelected(selected === reason ? null : reason)}
              aria-pressed={selected === reason}
            >
              {reason}
            </button>
          ))}
        </div>

        <textarea
          className="v8-report-textarea"
          placeholder="Any additional details?"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={500}
          aria-label="Report details"
        />

        <button className="v8-report-submit" onClick={handleSubmit}>
          Submit Report
        </button>
        <button className="v8-report-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
