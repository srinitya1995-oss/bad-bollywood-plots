interface HowToScreenProps {
  onClose: () => void;
}

const RULES = [
  { num: 1, title: 'Read the bad plot', desc: 'Tap the card to reveal a terribly summarized movie. Read it out loud.' },
  { num: 2, title: 'Guess the movie',   desc: 'Everyone else guesses which film it is. First correct answer wins.' },
  { num: 3, title: 'Award the guesser', desc: "Tap the guesser's name to give them points. Easy 1 · Med 2 · Hard 3." },
  { num: 4, title: 'Pass the phone',    desc: 'Hand it to the next reader. Keep going until the round ends.' },
];

const SCORE_KEY = [
  { label: 'EASY',   pts: '1 PT',  color: 'var(--emerald)' },
  { label: 'MEDIUM', pts: '2 PTS', color: 'var(--saffron)' },
  { label: 'HARD',   pts: '3 PTS', color: 'var(--tomato)' },
];

export function HowToScreen({ onClose }: HowToScreenProps) {
  return (
    <div
      className="sheet-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'absolute', inset: 0, zIndex: 60,
        background: 'rgba(15,20,48,0.55)',
      }}
    >
      <div
        className="v8-howto-panel"
        style={{
          position: 'absolute', inset: 0, background: 'var(--cream)', color: 'var(--ink)',
          padding: '16px 18px 20px', overflow: 'auto',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div
          className="v8-howto-mast"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <div>
            <div
              className="v8-howto-mast__sub"
              style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.28em', color: 'var(--tomato)', textTransform: 'uppercase' }}
            >
              2 MIN READ
            </div>
            <div
              className="v8-howto-mast__title"
              id="howto-title"
              style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 42, color: 'var(--ink)', textTransform: 'uppercase', lineHeight: 1, letterSpacing: '-0.015em' }}
            >
              HOW TO PLAY
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close how to play"
            style={{ fontSize: 18, color: 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            ×
          </button>
        </div>

        <div className="v8-howto-rules" style={{ display: 'grid', gap: 8 }}>
          {RULES.map((rule) => (
            <div
              className="v8-howto-rule"
              key={rule.num}
              style={{
                border: '2px solid var(--ink)', background: 'var(--cream)',
                padding: '10px 12px', display: 'grid', gridTemplateColumns: '32px 1fr',
                gap: 10, alignItems: 'start',
              }}
            >
              <div
                className="v8-howto-rule__num"
                style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 32, color: 'var(--tomato)', lineHeight: 0.9, textShadow: '2px 2px 0 var(--ink)' }}
              >
                {rule.num}
              </div>
              <div>
                <h3
                  className="v8-howto-rule__title"
                  style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 18, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.005em', margin: 0 }}
                >
                  {rule.title}
                </h3>
                <p
                  className="v8-howto-rule__desc"
                  style={{ marginTop: 3, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', lineHeight: 1.4 }}
                >
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}

          <div
            className="v8-howto-scorekey"
            style={{
              background: 'var(--ink)', color: 'var(--cream)',
              padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6, textAlign: 'center',
            }}
          >
            {SCORE_KEY.map((k, i) => (
              <div
                className="v8-howto-scorekey__item"
                key={k.label}
                style={{
                  borderRight: i < 2 ? '1px solid rgba(243,233,210,0.25)' : 'none',
                  padding: '2px 0',
                }}
              >
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.22em', color: k.color, textTransform: 'uppercase' }}>
                  {k.label}
                </div>
                <div className="v8-howto-scorekey__pts" style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 22, color: 'var(--cream)' }}>
                  {k.pts}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="v8-howto-cta" style={{ marginTop: 'auto' }}>
          <button
            className="v8-howto-btn"
            onClick={onClose}
            style={{
              width: '100%', padding: 14, background: 'var(--ink)', color: 'var(--cream)',
              border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--tomato)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 20, textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            GOT IT →
          </button>
        </div>
      </div>
    </div>
  );
}
