export function BgLayer() {
  return (
    <div
      className="v8-bg"
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: -1,
        background: 'var(--bg)',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(229,39,107,0.10), transparent 60%)',
      }}
    />
  );
}
