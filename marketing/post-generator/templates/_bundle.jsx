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
/* Templates A & B — Bad Desi Plots tabloid system v3
   A: The Card (single post)
   B: The Carousel (issue spread, 6 slides) */

/* lazy getter to dodge script-load-order bugs */
const Wab = () => ({
  TC: window.TC, FONT: window.FONT,
  LogoLockup: window.LogoLockup, HalftoneBlock: window.HalftoneBlock,
  MisRegText: window.MisRegText, Masthead: window.Masthead,
  SectionBanner: window.SectionBanner, Folio: window.Folio,
  PostFrame: window.PostFrame, paperGrain: window.paperGrain,
});

/* Helper — accent color per industry */
const accentFor = (ind) => ind === 'BW' ? window.TC.pink : window.TC.emerald;
const accentDeepFor = (ind) => ind === 'BW' ? window.TC.pinkDeep : window.TC.emeraldDeep;
const indLabelFor = (ind) => ind === 'BW' ? 'BOLLYWOOD' : 'TOLLYWOOD';

/* ═════════════════════════════════════════════════════
   TEMPLATE A — THE CARD (workhorse single post)

   Layout: tabloid magazine page.
   - Magazine masthead (issue, date, section, price, handle)
   - Big bleed banner: section name in pink ("BAD DESCRIPTION №023")
   - Bleed bar with industry tag + era + difficulty (mustard or emerald)
   - Editorial body: Crimson italic, the plot, no quote marks
   - Hairline footer: "NAME THE FILM" + "DROP A GUESS BELOW"
   ═════════════════════════════════════════════════════ */
function TemplateA({ card, showCta=true, hideWatermark=false }){
  const { TC, FONT, MisRegText, Masthead, SectionBanner, Folio, PostFrame, paperGrain } = Wab();
  const accent = accentFor(card.ind);
  const accentDeep = accentDeepFor(card.ind);
  const ind = indLabelFor(card.ind);
  const cardNum = card.id.replace(/[^0-9]/g, '').padStart(3, '0') || '001';

  return (
    <PostFrame>
      {/* outer page padding */}
      <div style={{ position:'absolute', inset:0,
        padding:'48px 56px 48px',
        display:'flex', flexDirection:'column' }}>

        {/* MASTHEAD */}
        <Masthead section="THE PLOT FILES" issue="03" date="17 APR" price="₹0"
          accent={accent}/>

        {/* HERO BANNER — section title block */}
        <div style={{ marginTop:28, position:'relative' }}>
          <SectionBanner bg={accent} sub="EXCLUSIVE">
            BAD DESCRIPTION №{cardNum}
          </SectionBanner>
          {/* Industry/era/diff strip */}
          <div style={{ marginTop:0, background:TC.ink, color:TC.paper,
            padding:'14px 28px',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:FONT.display, fontWeight:700, fontSize:34,
              letterSpacing:'0.02em', textTransform:'uppercase' }}>
              {ind}
              <span style={{ color:TC.mustard, padding:'0 14px' }}>·</span>
              {card.era}
            </span>
            <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:24,
              letterSpacing:'0.08em', color:TC.mustard,
              textTransform:'uppercase' }}>
              DIFFICULTY · {card.diff}
            </span>
          </div>
        </div>

        {/* BODY — editorial pull quote area */}
        <div style={{ flex:1, marginTop:0, position:'relative',
          background:TC.bone, borderLeft:`3px solid ${TC.ink}`,
          borderRight:`3px solid ${TC.ink}`,
          ...paperGrain,
          backgroundColor:TC.bone,
          padding:'70px 80px',
          display:'flex', flexDirection:'column', justifyContent:'center' }}>

          {/* Drop cap kicker */}
          <div style={{ fontFamily:FONT.mono, fontWeight:600, fontSize:24,
            color:accent, letterSpacing:'0.18em', textTransform:'uppercase',
            marginBottom:24 }}>
            ▌ THE PLOT, AS DESCRIBED
          </div>

          {/* The plot */}
          <div style={{
            fontFamily:FONT.serif, fontStyle:'italic', fontWeight:400,
            fontSize: card.c.length > 160 ? 64 : card.c.length > 110 ? 72 : 80,
            lineHeight:1.12, color:TC.ink,
            textWrap:'pretty', letterSpacing:'-0.005em',
          }}>
            {card.c}
          </div>

          {/* Editor's mark — small */}
          <div style={{ marginTop:36,
            display:'flex', justifyContent:'space-between', alignItems:'baseline',
            paddingTop:20, borderTop:`1px solid rgba(14,19,38,0.3)`,
            fontFamily:FONT.mono, fontWeight:500, fontSize:22,
            letterSpacing:'0.08em', color:'rgba(14,19,38,0.6)',
            textTransform:'uppercase' }}>
            <span>FILED BY · ANONYMOUS</span>
            <span>VERIFIED · NO</span>
            <span>RUNTIME · {card.r || '—'}</span>
          </div>
        </div>

        {/* FOOTER STRIP — call-to-action */}
        <div style={{ background:TC.ink, color:TC.paper,
          padding:'22px 28px',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:FONT.display, fontWeight:700, fontSize:54,
            letterSpacing:'-0.005em', lineHeight:1, textTransform:'uppercase' }}>
            NAME THE FILM.
          </span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:18,
            fontFamily:FONT.mono, fontWeight:500, fontSize:24,
            color:accent, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            ↓ COMMENTS · REVEAL 24H
          </span>
        </div>

        {/* Page footer / folio */}
        {!hideWatermark && (
          <div style={{ marginTop:18,
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:22,
              letterSpacing:'0.08em', color:'rgba(14,19,38,0.55)',
              textTransform:'uppercase' }}>
              BADDESIPLOTS.COM · CARD №{cardNum}
            </span>
            <Folio n="P.01" tone="paper"/>
          </div>
        )}
      </div>
    </PostFrame>
  );
}

/* ═════════════════════════════════════════════════════
   TEMPLATE B — THE CAROUSEL (issue spread, 6 slides)

   1. COVER — newsstand cover with massive headline + cover lines
   2-5. Plot pages — magazine inside spreads, page numbers
   6. OUTRO — "How'd you do?" tally page, score chart
   ═════════════════════════════════════════════════════ */
function CarouselSlide({ index, total, children, bg, tone='paper' }){
  const { TC, PostFrame } = Wab();
  if (!bg) bg = TC.paper;
  return (
    <PostFrame bg={bg} tone={tone}>
      {children}
      {/* slide indicator dots */}
      <div style={{ position:'absolute', top:30, right:48,
        display:'flex', gap:6, alignItems:'center',
        background:tone==='ink'?'rgba(14,19,38,0.35)':'rgba(244,236,214,0.5)',
        padding:'6px 10px', borderRadius:0 }}>
        {Array.from({length: total}).map((_, i) => (
          <span key={i} style={{
            width:14, height:3,
            background: i === index
              ? (tone==='ink'?TC.paper:TC.ink)
              : (tone==='ink'?'rgba(244,236,214,0.3)':'rgba(14,19,38,0.25)'),
          }}/>
        ))}
      </div>
    </PostFrame>
  );
}

function TemplateB({ cards, weekNo='03' }){
  const { TC, FONT, MisRegText, Masthead, SectionBanner, Folio, PostFrame, paperGrain } = Wab();
  const carouselCards = cards.slice(0, 4);

  return (
    <div style={{ display:'flex', gap:32 }}>

      {/* ═════════════ SLIDE 1 — COVER ═════════════ */}
      <CarouselSlide index={0} total={6} bg={TC.paper} tone="paper">
        <div style={{ position:'absolute', inset:0,
          padding:'48px 56px 56px',
          display:'flex', flexDirection:'column' }}>

          {/* Top masthead with logo */}
          <div style={{ display:'flex', alignItems:'baseline',
            justifyContent:'space-between',
            borderTop:`4px solid ${TC.ink}`, borderBottom:`2px solid ${TC.ink}`,
            padding:'20px 0' }}>
            <span style={{ fontFamily:FONT.display, fontWeight:700, fontSize:64,
              color:TC.ink, letterSpacing:'-0.015em', lineHeight:1,
              textTransform:'uppercase' }}>BAD DESI PLOTS</span>
            <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:22,
              color:TC.ink, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              ISSUE №{weekNo} · WK 17–24 APR · ₹0
            </span>
          </div>

          {/* Tagline strip */}
          <div style={{ background:TC.ink, color:TC.paper, padding:'10px 18px',
            display:'flex', justifyContent:'space-between',
            fontFamily:FONT.mono, fontWeight:500, fontSize:22,
            letterSpacing:'0.1em', textTransform:'uppercase' }}>
            <span>DESCRIBED BADLY · ON PURPOSE</span>
            <span style={{ color:TC.mustard }}>4 PLOTS · 4 GUESSES · 1 EGO</span>
          </div>

          {/* THE COVER HEADLINE — multi-line tabloid scream */}
          <div style={{ flex:1, position:'relative',
            display:'flex', flexDirection:'column', justifyContent:'center',
            paddingTop:30 }}>

            {/* Top kicker */}
            <div style={{ fontFamily:FONT.mono, fontWeight:600, fontSize:28,
              color:TC.pink, letterSpacing:'0.16em', textTransform:'uppercase',
              marginBottom:18 }}>
              ▶ THIS WEEK'S CHALLENGE — NO HINTS, NO MERCY
            </div>

            {/* Misregistered headline */}
            <div style={{ fontFamily:FONT.display, fontWeight:700,
              fontSize:280, lineHeight:0.84,
              letterSpacing:'-0.035em', textTransform:'uppercase',
              color:TC.ink }}>
              <MisRegText color={TC.ink} offsetColor={TC.pink} offset={{x:8, y:8}}>
                HOW MANY
              </MisRegText>
              <br/>
              CAN YOU
              <br/>
              <span style={{ color:TC.pink }}>GUESS?</span>
            </div>

            {/* Cover lines — like a real magazine */}
            <div style={{ marginTop:40,
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:20,
              borderTop:`2px solid ${TC.ink}`, paddingTop:24 }}>
              {[
                ['INSIDE', 'four plots, ranked by cruelty'],
                ['ALSO', 'a Tollywood entry that broke us'],
                ['PLUS', 'one (1) movie nobody could guess'],
                ['SCORE', 'tally yourself — we trust you'],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', gap:14, alignItems:'baseline' }}>
                  <span style={{ fontFamily:FONT.mono, fontWeight:600, fontSize:22,
                    color:TC.pink, letterSpacing:'0.12em',
                    textTransform:'uppercase', minWidth:70 }}>{k}</span>
                  <span style={{ fontFamily:FONT.serif, fontStyle:'italic',
                    fontWeight:400, fontSize:32, color:TC.ink,
                    lineHeight:1.2 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom strip */}
          <div style={{ background:TC.pink, color:TC.paper,
            padding:'18px 24px',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            fontFamily:FONT.display, fontWeight:700, fontSize:36,
            letterSpacing:'0.01em', textTransform:'uppercase' }}>
            <span>SWIPE TO PLAY →</span>
            <span style={{ fontFamily:FONT.mono, fontSize:24,
              letterSpacing:'0.08em', color:TC.mustard }}>
              @BADDESIPLOTS · BADDESIPLOTS.COM
            </span>
          </div>
        </div>
      </CarouselSlide>

      {/* ═════════════ SLIDES 2-5 — PLOT PAGES ═════════════ */}
      {carouselCards.map((card, i) => {
        const accent = accentFor(card.ind);
        const ind = indLabelFor(card.ind);
        const pageNum = String(i+2).padStart(2, '0');
        const slideIdx = i + 1;

        return (
          <CarouselSlide key={card.id} index={slideIdx} total={6}
            bg={TC.paper} tone="paper">
            <div style={{ position:'absolute', inset:0,
              padding:'48px 56px 48px',
              display:'flex', flexDirection:'column' }}>

              {/* Running head */}
              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                borderBottom:`2px solid ${TC.ink}`, paddingBottom:14,
                fontFamily:FONT.mono, fontWeight:500, fontSize:22,
                letterSpacing:'0.1em', color:TC.ink, textTransform:'uppercase' }}>
                <span>BAD DESI PLOTS · ISSUE №{weekNo}</span>
                <span style={{ color:accent }}>● {ind}</span>
                <span>P.{pageNum}</span>
              </div>

              {/* Page label kicker */}
              <div style={{ marginTop:30, display:'flex',
                alignItems:'baseline', gap:24 }}>
                <span style={{ fontFamily:FONT.display, fontWeight:700,
                  fontSize:120, color:accent, letterSpacing:'-0.02em',
                  lineHeight:0.85 }}>
                  {String(i+1).padStart(2, '0')}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:FONT.mono, fontWeight:600, fontSize:22,
                    color:TC.ink, letterSpacing:'0.14em',
                    textTransform:'uppercase', marginBottom:6 }}>
                    PLOT {String(i+1).padStart(2,'0')} OF 04
                  </div>
                  <div style={{ fontFamily:FONT.display, fontWeight:700, fontSize:48,
                    color:TC.ink, letterSpacing:'-0.005em', lineHeight:1,
                    textTransform:'uppercase' }}>
                    {ind} · {card.era}
                  </div>
                </div>
                <div style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:22,
                  color:TC.ink, letterSpacing:'0.1em', textTransform:'uppercase',
                  textAlign:'right', borderLeft:`1px solid ${TC.ink}`,
                  paddingLeft:18, alignSelf:'stretch',
                  display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <span>DIFFICULTY</span>
                  <span style={{ fontFamily:FONT.display, fontWeight:700,
                    fontSize:38, color:accent, letterSpacing:'-0.005em',
                    lineHeight:1 }}>{card.diff?.toUpperCase()}</span>
                </div>
              </div>

              {/* THE PLOT — main editorial body */}
              <div style={{ flex:1, marginTop:40, position:'relative',
                paddingTop:36,
                borderTop:`6px solid ${TC.ink}` }}>

                {/* Drop cap */}
                <span style={{
                  float:'left', fontFamily:FONT.display, fontWeight:700,
                  fontSize:200, lineHeight:0.78,
                  color:accent, marginRight:24, marginTop:-6,
                  letterSpacing:'-0.02em' }}>"</span>

                <div style={{
                  fontFamily:FONT.serif, fontStyle:'italic', fontWeight:400,
                  fontSize: card.c.length > 160 ? 70 : card.c.length > 110 ? 80 : 90,
                  lineHeight:1.1, color:TC.ink,
                  textWrap:'pretty', letterSpacing:'-0.005em',
                }}>
                  {card.c}
                </div>
              </div>

              {/* Footer — call & swipe */}
              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                background:TC.ink, color:TC.paper, padding:'22px 28px' }}>
                <span style={{ fontFamily:FONT.display, fontWeight:700,
                  fontSize:48, letterSpacing:'-0.005em', lineHeight:1,
                  textTransform:'uppercase' }}>
                  NAME THE FILM.
                </span>
                <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:24,
                  color:accent, letterSpacing:'0.12em',
                  textTransform:'uppercase' }}>
                  SWIPE →
                </span>
              </div>
            </div>
          </CarouselSlide>
        );
      })}

      {/* ═════════════ SLIDE 6 — OUTRO TALLY ═════════════ */}
      <CarouselSlide index={5} total={6} bg={TC.ink} tone="ink">
        <div style={{ position:'absolute', inset:0,
          padding:'48px 56px 56px', color:TC.paper,
          display:'flex', flexDirection:'column' }}>

          {/* Header strip */}
          <div style={{
            borderTop:`4px solid ${TC.paper}`, borderBottom:`2px solid ${TC.paper}`,
            padding:'18px 0',
            display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={{ fontFamily:FONT.display, fontWeight:700, fontSize:48,
              color:TC.paper, letterSpacing:'-0.005em',
              textTransform:'uppercase' }}>FINAL TALLY</span>
            <span style={{ fontFamily:FONT.mono, fontWeight:500, fontSize:22,
              color:TC.mustard, letterSpacing:'0.1em',
              textTransform:'uppercase' }}>
              HONOR SYSTEM · NO SCREENSHOTS
            </span>
          </div>

          {/* The big question */}
          <div style={{ marginTop:48 }}>
            <div style={{ fontFamily:FONT.mono, fontWeight:600, fontSize:28,
              color:TC.pink, letterSpacing:'0.14em', textTransform:'uppercase',
              marginBottom:20 }}>
              ▶ SCORE YOURSELF, BE HONEST
            </div>
            <div style={{ fontFamily:FONT.display, fontWeight:700, fontSize:280,
              lineHeight:0.84, letterSpacing:'-0.035em',
              textTransform:'uppercase', color:TC.paper }}>
              <MisRegText color={TC.paper} offsetColor={TC.mustard} offset={{x:8, y:8}}>
                HOW'D
              </MisRegText>
              <br/>
              YOU&nbsp;<span style={{ color:TC.pink }}>DO?</span>
            </div>
          </div>

          {/* Tally chart — score bands */}
          <div style={{ marginTop:48, flex:1,
            display:'flex', flexDirection:'column', gap:0 }}>
            {[
              ['0/4', 'YOU\'VE NEVER SEEN A FILM', 'rgba(244,236,214,0.4)'],
              ['1/4', 'CASUAL VIEWER, RESPECT', 'rgba(244,236,214,0.55)'],
              ['2/4', 'KNOWS THE CLASSICS', 'rgba(244,236,214,0.7)'],
              ['3/4', 'DIFFERENT BREED', TC.mustard],
              ['4/4', 'YOU ARE THE FILM', TC.pink],
            ].map(([score, label, c], i) => (
              <div key={score} style={{
                display:'flex', alignItems:'center', gap:24,
                padding:'16px 0',
                borderTop: i === 0 ? `1px solid rgba(244,236,214,0.25)` : 'none',
                borderBottom:`1px solid rgba(244,236,214,0.25)` }}>
                <span style={{ fontFamily:FONT.display, fontWeight:700,
                  fontSize:80, color:c, letterSpacing:'-0.01em',
                  lineHeight:1, minWidth:160 }}>{score}</span>
                <span style={{ flex:1, fontFamily:FONT.serif,
                  fontStyle:'italic', fontWeight:400, fontSize:42,
                  color:TC.paper, letterSpacing:'-0.005em' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div style={{ marginTop:24,
            background:TC.pink, color:TC.paper, padding:'20px 28px',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:FONT.display, fontWeight:700, fontSize:42,
              letterSpacing:'0.005em', lineHeight:1,
              textTransform:'uppercase' }}>
              PLAY THE DECK · BADDESIPLOTS.COM
            </span>
            <span style={{ fontFamily:FONT.mono, fontWeight:600, fontSize:24,
              color:TC.mustard, letterSpacing:'0.1em',
              textTransform:'uppercase' }}>
              350 CARDS · IN BROWSER
            </span>
          </div>
        </div>
      </CarouselSlide>
    </div>
  );
}

Object.assign(window, { TemplateA, TemplateB, accentFor, indLabelFor });
/* Templates C, D, E — Bad Desi Plots tabloid system v3
   C: Reveal pair (front "ANSWERED" + back poster splash)
   D: Vote (BW vs TW ballot)
   E: Quote (full-bleed pull quote, palette cleanser) */

/* lazy getter — reads from window at render time, not module-load time */
const W = () => ({
  TC2: window.TC, FONT2: window.FONT,
  LL2: window.LogoLockup, MR2: window.MisRegText,
  MH2: window.Masthead, SB2: window.SectionBanner,
  FO2: window.Folio, PF2: window.PostFrame,
  PG2: window.paperGrain,
  AF2: window.accentFor, IL2: window.indLabelFor,
});

/* ═════════════════════════════════════════════════════
   TEMPLATE C — REVEAL PAIR

   FRONT: yesterday's plot, with "ANSWERED" stamp covering it
   BACK: poster splash — title slam in misregister, deep navy bg
   ═════════════════════════════════════════════════════ */
function TemplateC({ card }){
  const { TC2, FONT2, MR2, MH2, SB2, FO2, PF2, PG2, AF2, IL2 } = W();
  const accent = AF2(card.ind);
  const ind = IL2(card.ind);
  const cardNum = card.id.replace(/[^0-9]/g, '').padStart(3, '0') || '001';

  return (
    <div style={{ display:'flex', gap:32 }}>

      {/* ─────── FRONT: Answered ─────── */}
      <PF2>
        <div style={{ position:'absolute', inset:0,
          padding:'48px 56px',
          display:'flex', flexDirection:'column' }}>

          <MH2 section="THE REVEAL" issue="03" date="17 APR" price="₹0" accent={accent}/>

          {/* Yesterday's plot — faded behind */}
          <div style={{ marginTop:36, flex:1, position:'relative',
            background:TC2.bone, padding:'56px 64px',
            borderLeft:`3px solid ${TC2.ink}`, borderRight:`3px solid ${TC2.ink}`,
            ...PG2, backgroundColor:TC2.bone,
            display:'flex', flexDirection:'column', justifyContent:'center' }}>

            <div style={{ fontFamily:FONT2.mono, fontWeight:600, fontSize:24,
              color:'rgba(14,19,38,0.45)', letterSpacing:'0.16em',
              textTransform:'uppercase', marginBottom:28 }}>
              ▌ YESTERDAY'S PLOT · CARD №{cardNum}
            </div>

            <div style={{
              fontFamily:FONT2.serif, fontStyle:'italic', fontWeight:400,
              fontSize: card.c.length > 160 ? 60 : card.c.length > 110 ? 70 : 78,
              lineHeight:1.14, color:'rgba(14,19,38,0.45)',
              textWrap:'pretty', letterSpacing:'-0.005em',
              filter:'blur(0.5px)',
            }}>
              {card.c}
            </div>
          </div>

          {/* THE BIG ANSWERED STAMP — angled, bold, cuts across */}
          <div style={{
            position:'absolute', top:600, left:'50%',
            transform:'translateX(-50%) rotate(-5deg)',
            background:TC2.pink, color:TC2.paper,
            padding:'20px 56px',
            border:`6px solid ${TC2.ink}`,
            boxShadow:`12px 12px 0 ${TC2.ink}`,
          }}>
            <div style={{ fontFamily:FONT2.display, fontWeight:700, fontSize:140,
              letterSpacing:'-0.01em', lineHeight:0.86,
              textTransform:'uppercase' }}>
              ANSWERED
            </div>
            <div style={{ fontFamily:FONT2.mono, fontWeight:600, fontSize:26,
              color:TC2.mustard, letterSpacing:'0.14em',
              textTransform:'uppercase', textAlign:'center', marginTop:6 }}>
              SWIPE FOR THE TRUTH ↓
            </div>
          </div>

          {/* Footer */}
          <div style={{ background:TC2.ink, color:TC2.paper, padding:'22px 28px',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:FONT2.display, fontWeight:700, fontSize:48,
              letterSpacing:'-0.005em', textTransform:'uppercase' }}>
              GUESSES IN, BRACE YOURSELF
            </span>
            <span style={{ fontFamily:FONT2.mono, fontWeight:500, fontSize:24,
              color:accent, letterSpacing:'0.12em',
              textTransform:'uppercase' }}>
              SWIPE →
            </span>
          </div>
        </div>
      </PF2>

      {/* ─────── BACK: The Splash ─────── */}
      <PF2 bg={TC2.navy} tone="ink">
        <div style={{ position:'absolute', inset:0,
          padding:'48px 56px', color:TC2.paper,
          display:'flex', flexDirection:'column' }}>

          {/* Reverse masthead */}
          <MH2 section="THE TRUTH" issue="03" date="17 APR" price="₹0"
            accent={TC2.mustard} tone="ink"/>

          {/* "IT WAS ALWAYS — " kicker */}
          <div style={{ marginTop:50, fontFamily:FONT2.mono, fontWeight:600,
            fontSize:30, color:TC2.mustard, letterSpacing:'0.18em',
            textTransform:'uppercase' }}>
            ▶ IT WAS ALWAYS —
          </div>

          {/* TITLE SLAM */}
          <div style={{ flex:1, display:'flex', alignItems:'center',
            justifyContent:'center', textAlign:'center' }}>
            <div style={{
              fontFamily:FONT2.display, fontWeight:700,
              fontSize: card.n.length > 22 ? 200 : card.n.length > 16 ? 240 : 280,
              lineHeight:0.84, letterSpacing:'-0.03em',
              textTransform:'uppercase',
              color:TC2.paper,
              position:'relative',
            }}>
              <span style={{ position:'absolute', top:10, left:12,
                color:accent, opacity:1, pointerEvents:'none',
                whiteSpace:'pre-line', display:'inline-block' }}>
                {card.n.replace(/ /g, '\n')}
              </span>
              <span style={{ position:'relative', whiteSpace:'pre-line',
                display:'inline-block' }}>
                {card.n.replace(/ /g, '\n')}
              </span>
            </div>
          </div>

          {/* Tag row */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'stretch',
            borderTop:`2px solid ${TC2.paper}`,
            borderBottom:`2px solid ${TC2.paper}`,
            padding:'24px 0' }}>
            {[
              ['YEAR', card.y],
              ['INDUSTRY', ind],
              ['ERA', card.era],
              ['DIFFICULTY', card.diff?.toUpperCase()],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ flex:1, paddingLeft: i === 0 ? 0 : 24,
                paddingRight: i === arr.length-1 ? 0 : 24,
                borderRight: i === arr.length-1 ? 'none'
                  : `1px solid rgba(244,236,214,0.4)` }}>
                <div style={{ fontFamily:FONT2.mono, fontWeight:600, fontSize:22,
                  color:'rgba(244,236,214,0.6)', letterSpacing:'0.12em',
                  textTransform:'uppercase', marginBottom:6 }}>
                  {k}
                </div>
                <div style={{ fontFamily:FONT2.display, fontWeight:700, fontSize:48,
                  color:TC2.paper, letterSpacing:'-0.005em', lineHeight:1,
                  textTransform:'uppercase' }}>
                  {v}
                </div>
              </div>
            ))}
          </div>

          {/* "For the record" footnote */}
          <div style={{ marginTop:28, background:TC2.paper, color:TC2.ink,
            padding:'24px 32px',
            ...PG2, backgroundColor:TC2.paper }}>
            <div style={{ fontFamily:FONT2.mono, fontWeight:600, fontSize:24,
              color:accent, letterSpacing:'0.16em',
              textTransform:'uppercase', marginBottom:10 }}>
              ▌ FOR THE RECORD
            </div>
            <div style={{ fontFamily:FONT2.serif, fontStyle:'italic',
              fontWeight:400, fontSize:36, lineHeight:1.3, color:TC2.ink,
              textWrap:'pretty', letterSpacing:'-0.005em' }}>
              {card.f}
            </div>
          </div>
        </div>
      </PF2>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   TEMPLATE D — VOTE (BW vs TW ballot)
   Single page, two columns, big VS lockup at top.
   ═════════════════════════════════════════════════════ */
function TemplateD({ bwCard, twCard }){
  const { TC2, FONT2, MR2, MH2, SB2, FO2, PF2, PG2, AF2, IL2 } = W();
  const SmallCard = ({ card, side }) => {
    const accent = AF2(card.ind);
    const cardNum = card.id.replace(/[^0-9]/g, '').padStart(3, '0') || '001';
    return (
      <div style={{
        flex:1, position:'relative',
        background:TC2.paper, color:TC2.ink,
        border:`3px solid ${TC2.ink}`,
        display:'flex', flexDirection:'column' }}>

        {/* Top tab — side letter */}
        <div style={{ background:accent, color:TC2.paper, padding:'12px 22px',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:FONT2.display, fontWeight:700, fontSize:54,
            letterSpacing:'-0.005em', lineHeight:1,
            textTransform:'uppercase' }}>
            {side === 'left' ? 'A' : 'B'}
          </span>
          <span style={{ fontFamily:FONT2.mono, fontWeight:600, fontSize:22,
            color:TC2.paper, letterSpacing:'0.12em',
            textTransform:'uppercase' }}>
            {IL2(card.ind)} · {card.era}
          </span>
        </div>

        {/* Body */}
        <div style={{ flex:1, padding:'32px 30px',
          display:'flex', alignItems:'center', justifyContent:'center',
          ...PG2, backgroundColor:TC2.paper }}>
          <div style={{ fontFamily:FONT2.serif, fontStyle:'italic',
            fontWeight:400,
            fontSize: card.c.length > 130 ? 40 : card.c.length > 90 ? 46 : 52,
            lineHeight:1.18, textAlign:'center', textWrap:'pretty',
            color:TC2.ink, letterSpacing:'-0.005em' }}>
            {card.c}
          </div>
        </div>

        {/* Footer — diff */}
        <div style={{ padding:'14px 22px', background:TC2.ink, color:TC2.paper,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          fontFamily:FONT2.mono, fontWeight:600, fontSize:24,
          letterSpacing:'0.1em', textTransform:'uppercase' }}>
          <span>CARD №{cardNum}</span>
          <span style={{ color:TC2.mustard }}>
            DIFFICULTY · {card.diff?.toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <PF2>
      <div style={{ position:'absolute', inset:0,
        padding:'48px 56px',
        display:'flex', flexDirection:'column' }}>

        <MH2 section="THE BALLOT" issue="03" date="17 APR" price="₹0" accent={TC2.pink}/>

        {/* Banner */}
        <div style={{ marginTop:28 }}>
          <SB2 bg={TC2.mustard} color={TC2.ink} sub="VOTE NOW" accent={TC2.pink}>
            WHICH PLOT IS WORSE?
          </SB2>
        </div>

        {/* The VS lockup — saturated tabloid */}
        <div style={{ marginTop:28, padding:'40px 0',
          background:TC2.ink, color:TC2.paper,
          display:'flex', alignItems:'center', justifyContent:'center', gap:36 }}>
          <span style={{ fontFamily:FONT2.display, fontWeight:700, fontSize:200,
            letterSpacing:'-0.025em', lineHeight:0.86, textTransform:'uppercase',
            position:'relative' }}>
            <span style={{ position:'absolute', top:6, left:8,
              color:TC2.pink }}>BW</span>
            <span style={{ position:'relative', color:TC2.paper }}>BW</span>
          </span>
          <span style={{ fontFamily:FONT2.display, fontWeight:700, fontSize:80,
            color:TC2.mustard, letterSpacing:'-0.01em',
            textTransform:'uppercase' }}>
            VS
          </span>
          <span style={{ fontFamily:FONT2.display, fontWeight:700, fontSize:200,
            letterSpacing:'-0.025em', lineHeight:0.86, textTransform:'uppercase',
            position:'relative' }}>
            <span style={{ position:'absolute', top:6, left:8,
              color:TC2.emerald }}>TW</span>
            <span style={{ position:'relative', color:TC2.paper }}>TW</span>
          </span>
        </div>

        {/* Cards */}
        <div style={{ flex:1, marginTop:24,
          display:'flex', gap:24 }}>
          <SmallCard card={bwCard} side="left"/>
          <SmallCard card={twCard} side="right"/>
        </div>

        {/* Vote bar */}
        <div style={{ marginTop:24,
          background:TC2.ink, color:TC2.paper,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'22px 28px' }}>
          <span style={{ fontFamily:FONT2.display, fontWeight:700, fontSize:46,
            letterSpacing:'-0.005em', textTransform:'uppercase' }}>
            COMMENT &nbsp;
            <span style={{ color:TC2.pink }}>A</span>
            &nbsp;OR&nbsp;
            <span style={{ color:TC2.emerald }}>B</span>
          </span>
          <span style={{ fontFamily:FONT2.mono, fontWeight:600, fontSize:24,
            color:TC2.mustard, letterSpacing:'0.1em',
            textTransform:'uppercase' }}>
            TALLY · TOMORROW NOON
          </span>
        </div>
      </div>
    </PF2>
  );
}

/* ═════════════════════════════════════════════════════
   TEMPLATE E — QUOTE (palette cleanser)
   Cream paper, single quote in Playfair. The quietest beat.
   ═════════════════════════════════════════════════════ */
function TemplateE({ quote = "the movie that ruined your last family road trip.",
  attribution = "FROM THE DECK · CARD №047" }){
  const { TC2, FONT2, MR2, MH2, SB2, FO2, PF2, PG2, AF2, IL2 } = W();
  return (
    <PF2 bg={TC2.paper}>
      <div style={{ position:'absolute', inset:0,
        padding:'48px 56px',
        display:'flex', flexDirection:'column' }}>

        <MH2 section="MARGINALIA" issue="03" date="17 APR" price="₹0" accent={TC2.pink}/>

        {/* Pull-quote area */}
        <div style={{ flex:1, position:'relative',
          display:'flex', flexDirection:'column', justifyContent:'center',
          padding:'40px 0' }}>

          {/* Big quote mark */}
          <div style={{ fontFamily:FONT2.drama, fontStyle:'italic',
            fontWeight:900, fontSize:340, color:TC2.pink,
            lineHeight:0.6, letterSpacing:'-0.03em',
            marginBottom:-20 }}>
            "
          </div>

          {/* The quote */}
          <div style={{
            fontFamily:FONT2.drama, fontStyle:'italic', fontWeight:700,
            fontSize:108, lineHeight:1.04, color:TC2.ink,
            textWrap:'balance', letterSpacing:'-0.015em',
            paddingLeft:40,
          }}>
            {quote}
          </div>

          {/* Attribution */}
          <div style={{ marginTop:48, paddingLeft:40,
            display:'flex', alignItems:'center', gap:18,
            fontFamily:FONT2.mono, fontWeight:600, fontSize:26,
            letterSpacing:'0.14em', color:TC2.ink,
            textTransform:'uppercase' }}>
            <span style={{ width:60, height:2, background:TC2.pink,
              display:'block' }}/>
            <span>{attribution}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`2px solid ${TC2.ink}`, paddingTop:18,
          display:'flex', justifyContent:'space-between', alignItems:'baseline',
          fontFamily:FONT2.mono, fontWeight:500, fontSize:22,
          letterSpacing:'0.1em', color:TC2.ink, textTransform:'uppercase' }}>
          <span>BAD DESI PLOTS · @BADDESIPLOTS</span>
          <span style={{ color:TC2.pink }}>BADDESIPLOTS.COM</span>
          <span>P.06</span>
        </div>
      </div>
    </PF2>
  );
}

Object.assign(window, { TemplateC, TemplateD, TemplateE });
