export function BgLayer() {
  return (
    <>
      <div className="v8-bg" aria-hidden="true">
        <img src="/bg/backdrop.jpg" alt="" />
      </div>
      <div className="v8-wash" aria-hidden="true" />
      <div className="v8-bulb-glow" aria-hidden="true" />
    </>
  );
}
