import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { track } from '../analytics/posthog';
import { submitReport, type ReportReason } from '../storage/feedback';
import { toast } from './Toast';

interface ReportSheetProps {
  open: boolean;
  cardId: string;
  onClose: () => void;
}

// Pair each display label with the enum code the `reports` table requires.
// Codes must be unique — if two labels map to the same code the highlight gets shared.
const REPORT_REASONS: ReadonlyArray<{ label: string; code: ReportReason }> = [
  { label: 'Wrong or inaccurate', code: 'wrong' },
  { label: 'Typo', code: 'typo' },
  { label: 'Spoiler', code: 'spoiler' },
  { label: 'Offensive', code: 'offensive' },
  { label: 'Too easy', code: 'too-easy' },
  { label: 'Too hard', code: 'too-hard' },
  { label: 'Other', code: 'other' },
] as const;

export function ReportSheet({ open, cardId, onClose }: ReportSheetProps) {
  const [selected, setSelected] = useState<ReportReason | null>(null);
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
    // Persist to the `reports` Supabase table via the correct schema.
    submitReport({ cardId, reason: selected });
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
          {REPORT_REASONS.map(({ label, code }) => (
            <button
              key={label}
              className={`v8-report-tag${selected === code ? ' is-active' : ''}`}
              onClick={() => setSelected(selected === code ? null : code)}
              aria-pressed={selected === code}
            >
              {label}
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
