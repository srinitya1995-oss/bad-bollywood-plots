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
      props: { cardId, reason: selected, details: details.trim() },
      sessionId: g.sessionId,
      timestamp: Date.now(),
    });
    submitReport({ cardId, reason: selected });
    track.reportSent({ cardId, reason: selected });
    toast('Thanks, we will take a look.');
    setSelected(null); setDetails('');
    onClose();
  };

  return (
    <div
      className="sheet-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(15,20,48,0.55)', display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        className="v8-report-sheet"
        style={{
          width: '100%', background: 'var(--cream)', color: 'var(--ink)',
          border: '3px solid var(--ink)', borderBottom: 'none',
          padding: '14px 16px 16px', maxHeight: '85%', overflow: 'auto',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        <div
          className="sheet-handle"
          aria-hidden="true"
          style={{ width: 44, height: 4, background: 'var(--ink)', margin: '0 auto 4px', opacity: 0.3 }}
        />
        <div
          style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.26em', color: 'var(--tomato)', textTransform: 'uppercase' }}
        >
          What is wrong with this card?
        </div>
        <h2
          className="v8-report-title"
          id="report-title"
          style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 28, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, margin: 0 }}
        >
          REPORT THIS PLOT
        </h2>

        <div
          className="v8-report-tags"
          style={{ marginTop: 4, display: 'grid', gap: 6 }}
        >
          {REPORT_REASONS.map(({ label, code }) => {
            const active = selected === code;
            return (
              <button
                key={label}
                className={`v8-report-tag${active ? ' is-active' : ''}`}
                onClick={() => setSelected(active ? null : code)}
                aria-pressed={active}
                style={{
                  padding: '9px 12px', border: '2px solid var(--ink)',
                  background: active ? 'var(--ink)' : 'var(--cream)',
                  color: active ? 'var(--cream)' : 'var(--ink)',
                  fontFamily: 'Anton, Impact, sans-serif', fontSize: 15,
                  textTransform: 'uppercase', letterSpacing: '-0.005em', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                {label}
                {active ? <span style={{ color: 'var(--tomato)' }}>✓</span> : null}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 4, border: '2px solid var(--ink)', padding: '10px 12px',
            background: 'rgba(255,255,255,0.5)', minHeight: 60,
          }}
        >
          <div
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-muted)', textTransform: 'uppercase' }}
          >
            Any additional details?
          </div>
          <textarea
            className="v8-report-textarea"
            placeholder="Tell us more (optional)."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={500}
            aria-label="Report details"
            style={{
              marginTop: 4, width: '100%',
              fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink)',
              background: 'transparent', border: 'none', outline: 'none', resize: 'vertical',
              minHeight: 40,
            }}
          />
        </div>

        <div style={{ marginTop: 4, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
          <button
            className="v8-report-cancel"
            onClick={onClose}
            style={{
              padding: '10px 14px', background: 'var(--cream)',
              border: '2px solid var(--ink)',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: '0.22em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            className="v8-report-submit"
            onClick={handleSubmit}
            style={{
              padding: '10px 14px', background: 'var(--tomato)', color: 'var(--cream)',
              border: '3px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 16,
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
