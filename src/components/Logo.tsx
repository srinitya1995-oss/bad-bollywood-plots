interface LogoProps {
  size?: number;
  onDark?: boolean;
}

export function Logo({ size = 28, onDark = true }: LogoProps) {
  const bg = onDark ? 'var(--cream)' : 'var(--ink)';
  const fg = onDark ? 'var(--ink)' : 'var(--cream)';
  const accent = 'var(--tomato)';
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      style={{ display: 'block' }}
      aria-label="Bad Desi Plots logomark"
      role="img"
    >
      <rect x="1.5" y="1.5" width="45" height="45" fill={bg} stroke={fg} strokeWidth="2.5" />
      <rect x="5" y="5" width="38" height="38" fill="none" stroke={accent} strokeWidth="1" />
      <text
        x="24"
        y="38"
        textAnchor="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="40"
        fill={accent}
        letterSpacing="-1"
        style={{ fontWeight: 700 }}
        transform="translate(1.5 1.5)"
        opacity="0.85"
      >
        B
      </text>
      <text
        x="24"
        y="38"
        textAnchor="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="40"
        fill={fg}
        letterSpacing="-1"
        style={{ fontWeight: 700 }}
      >
        B
      </text>
    </svg>
  );
}
