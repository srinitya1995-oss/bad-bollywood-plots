interface HowToScreenProps {
  onClose: () => void;
}

const RULES = [
  {
    num: 1,
    title: 'Read the bad plot',
    desc: 'Tap the card to reveal a terribly summarized movie. Read it out loud to the group.',
  },
  {
    num: 2,
    title: 'Guess the movie',
    desc: 'Everyone else guesses which movie it is. First correct answer wins the points.',
  },
  {
    num: 3,
    title: 'Award the guesser',
    desc: 'Tap the guesser\'s name to give them points. Easy = 1, Medium = 2, Hard = 3.',
  },
  {
    num: 4,
    title: 'Pass the phone',
    desc: 'Hand the phone to the next reader. They flip, you guess. Keep going until the round ends.',
  },
];

export function HowToScreen({ onClose }: HowToScreenProps) {
  return (
    <div
      className="sheet-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="v8-howto-panel">
        <div className="v8-howto-mast">
          <span className="v8-howto-mast__title">HOW TO PLAY</span>
          <span className="v8-howto-mast__sub">2 MIN READ</span>
        </div>

        <div className="v8-howto-rules">
          {RULES.map((rule) => (
            <div className="v8-howto-rule" key={rule.num}>
              <div className="v8-howto-rule__num">{rule.num}</div>
              <div className="v8-howto-rule__body">
                <h3 className="v8-howto-rule__title">{rule.title}</h3>
                <p className="v8-howto-rule__desc">{rule.desc}</p>
              </div>
            </div>
          ))}

          <div className="v8-howto-scorekey">
            <div className="v8-howto-scorekey__item">
              EASY<span className="v8-howto-scorekey__pts">1 PT</span>
            </div>
            <div className="v8-howto-scorekey__item">
              MEDIUM<span className="v8-howto-scorekey__pts">2 PTS</span>
            </div>
            <div className="v8-howto-scorekey__item">
              HARD<span className="v8-howto-scorekey__pts">3 PTS</span>
            </div>
          </div>
        </div>

        <div className="v8-howto-cta">
          <button className="v8-howto-btn" onClick={onClose}>
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
