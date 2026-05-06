/* IG post components for @baddesiplots — v3 (tabloid cinema)
   Aesthetic: 90s/00s Indian movie magazine — Stardust, Filmfare, Cineblitz.
   Tabloid-loud-but-typeset. Magazine grid. Saturated flat color. Tight type.
   Type system:
     - Display: Oswald 700 (condensed bold sans, newsstand voice)
     - Editorial: Crimson Pro italic (warmth + personality, body copy)
     - Workhorse: IBM Plex Sans (labels, captions, page chrome)
     - Pull-quote: Playfair Display Black italic (single-purpose drama)
     - Mono accent: IBM Plex Mono (issue numbers, dates, page folios)

   Source canvas: 1080×1350. Phone scale: ~0.36×.
   Type sizes targeted to read at BOTH 1:1 (poster) and ~390px (feed). */

/* ─────────── Color tokens ─────────── */
const TC = {
  ink:       '#0E1326',  // off-black navy
  paper:     '#F4ECD6',  // warm cream
  paperDeep: '#E8DDB8',  // toned cream for layering
  pink:      '#FF2E63',  // hot tabloid pink
  pinkDeep:  '#C71F4A',  // pink shadow
  navy:      '#0A1A3A',  // deep cover navy
  mustard:   '#E8B82A',  // mustard, not yellow
  emerald:   '#1E8C5E',  // saturated emerald
  emeraldDeep:'#136B45',
  bone:      '#EFE6CC',  // muted paper for sub-blocks
  rule:      '#0E1326',  // hairline rule
};

/* ─────────── Type tokens ─────────── */
const FONT = {
  display: "'Oswald', 'Bebas Neue', Impact, sans-serif",
  serif:   "'Crimson Pro', 'Crimson Text', Georgia, serif",
  sans:    "'IBM Plex Sans', system-ui, sans-serif",
  drama:   "'Playfair Display', 'Crimson Pro', serif",
  mono:    "'IBM Plex Mono', 'SF Mono', monospace",
};

/* ─────────── Logomark ─────────── *
   Tabloid logo: just bold initials in a stacked badge.
   "BDP" — Bad Desi Plots.  No icon, no clapperboard. Type IS the logo. */
function LogoLockup({ size=42, color=TC.ink, accent=TC.pink, vertical=false }){
  const lh = size * 0.85;
  if (vertical) {
    return (
      <span style={{ display:'inline-flex', flexDirection:'column',
        alignItems:'flex-start', lineHeight:0.9 }}>
        <span style={{ fontFamily:FONT.display, fontWeight:700,
          fontSize:size, color, letterSpacing:'-0.01em',
          textTransform:'uppercase', lineHeight:lh+'px' }}>BAD<br/>DESI<br/>PLOTS</span>
      </span>
    );
  }
  return (
    <span style={{ display:'inline-flex', alignItems:'baseline', gap:size*0.18 }}>
      <span style={{ fontFamily:FONT.display, fontWeight:700,
        fontSize:size, color, letterSpacing:'-0.01em',
        textTransform:'uppercase', lineHeight:1 }}>BAD DESI PLOTS</span>
      <span style={{ fontFamily:FONT.mono, fontWeight:500,
        fontSize:size*0.32, color:accent, letterSpacing:'0.05em',
        textTransform:'uppercase', transform:'translateY(-2px)' }}>™</span>
    </span>
  );
}

/* ─────────── Halftone field — used SPARINGLY ───────────
   Single ornamental block, never as a full background. */
function HalftoneBlock({ width=400, height=120, color=TC.pink, density=14, style }){
  const dots = [];
  const cols = Math.floor(width / density);
  const rows = Math.floor(height / density);
  for (let r=0; r<rows; r++){
    for (let c=0; c<cols; c++){
      const t = r/rows;            // 0 top → 1 bottom
      const r2 = (1 - t) * 5 + 0.5; // dots get smaller as t grows
      dots.push(
        <circle key={`${r}-${c}`} cx={c*density + density/2}
          cy={r*density + density/2} r={r2} fill={color}/>
      );
    }
  }
  return (
    <svg width={width} height={height} style={{ display:'block', ...style }}>
      {dots}
    </svg>
  );
}

/* ─────────── Misregistration text ───────────
   CMYK offset — second color shifted 4-6px. Used for ONE word per template max. */
function MisRegText({ children, color=TC.paper, offsetColor=TC.pink,
  offset={x:5, y:5}, style }){
  return (
    <span style={{ position:'relative', display:'inline-block', ...style }}>
      <span style={{ position:'absolute', left:offset.x, top:offset.y,
        color: offsetColor, pointerEvents:'none' }}>{children}</span>
      <span style={{ position:'relative', color }}>{children}</span>
    </span>
  );
}

/* ─────────── Magazine masthead bar ───────────
   Top of every post. Issue No · Date · Section · Price.
   Pure type, pure rules — no ornament. */
function Masthead({ section='THE PLOT FILES', issue='03', date='17 APR',
  price='₹0', tone='ink', accent=TC.pink, color }){
  const c = color || (tone === 'ink' ? TC.paper : TC.ink);
  const cMute = tone === 'ink' ? 'rgba(244,236,214,0.55)' : 'rgba(14,19,38,0.55)';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0,
      borderTop:`2px solid ${c}`, borderBottom:`2px solid ${c}`,
      padding:'14px 0' }}>
      <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:24,
        color:cMute, letterSpacing:'0.04em',
        paddingRight:24, borderRight:`1px solid ${cMute}` }}>
        ISSUE №{issue}
      </span>
      <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:24,
        color:cMute, letterSpacing:'0.04em',
        padding:'0 24px', borderRight:`1px solid ${cMute}` }}>
        {date}
      </span>
      <span style={{ flex:1, fontFamily:FONT.display, fontWeight:700,
        fontSize:32, color:c, letterSpacing:'0.02em', textAlign:'center',
        textTransform:'uppercase' }}>
        {section}
      </span>
      <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:24,
        color:cMute, letterSpacing:'0.04em',
        padding:'0 24px', borderLeft:`1px solid ${cMute}` }}>
        {price}
      </span>
      <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:24,
        color:accent, letterSpacing:'0.04em',
        paddingLeft:24, borderLeft:`1px solid ${cMute}` }}>
        @BADDESIPLOTS
      </span>
    </div>
  );
}

/* ─────────── Section banner ───────────
   The big horizontal "EXCLUSIVE" / "REVEALED" bar. Tabloid headline strip. */
function SectionBanner({ children, bg=TC.pink, color=TC.paper, sub, accent=TC.mustard }){
  return (
    <div style={{ background:bg, color, padding:'18px 28px',
      display:'flex', alignItems:'baseline', justifyContent:'space-between',
      gap:24 }}>
      <span style={{ fontFamily:FONT.display, fontWeight:700,
        fontSize:54, letterSpacing:'-0.005em', lineHeight:1,
        textTransform:'uppercase' }}>{children}</span>
      {sub && (
        <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:22,
          color:accent, letterSpacing:'0.08em', textTransform:'uppercase',
          flexShrink:0 }}>{sub}</span>
      )}
    </div>
  );
}

/* ─────────── Folio (page number) ───────────
   Bottom corner page indicator like a magazine. */
function Folio({ n, total, label, tone='ink' }){
  const c = tone === 'ink' ? TC.paper : TC.ink;
  const cMute = tone === 'ink' ? 'rgba(244,236,214,0.6)' : 'rgba(14,19,38,0.6)';
  return (
    <div style={{ display:'inline-flex', alignItems:'baseline', gap:14,
      fontFamily:FONT.mono, fontWeight:500, fontSize:22,
      letterSpacing:'0.06em', color:cMute, textTransform:'uppercase' }}>
      <span style={{ color:c, fontSize:32, fontWeight:600 }}>{n}</span>
      {total && <span>/ {total}</span>}
      {label && <span style={{ paddingLeft:14,
        borderLeft:`1px solid ${cMute}` }}>{label}</span>}
    </div>
  );
}

/* ─────────── Print textures — paper grain ─────────── */
const paperGrain = {
  backgroundImage: [
    'radial-gradient(rgba(14,19,38,0.05) 0.8px, transparent 0.8px)',
    'radial-gradient(rgba(255,46,99,0.022) 0.6px, transparent 0.6px)',
  ].join(','),
  backgroundSize: '3px 3px, 7px 7px',
  backgroundPosition: '0 0, 1px 2px',
};

/* ─────────── Post frame ─────────── */
function PostFrame({ children, bg=TC.paper, tone='paper', style }){
  return (
    <div style={{
      width:1080, height:1350, position:'relative', overflow:'hidden',
      background: bg, color: tone === 'ink' ? TC.paper : TC.ink,
      fontFamily: FONT.sans,
      ...style,
    }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        ...paperGrain, opacity: tone === 'ink' ? 0.4 : 1 }}/>
      {children}
    </div>
  );
}

Object.assign(window, {
  TC, FONT, LogoLockup, HalftoneBlock, MisRegText,
  Masthead, SectionBanner, Folio, PostFrame, paperGrain,
});
