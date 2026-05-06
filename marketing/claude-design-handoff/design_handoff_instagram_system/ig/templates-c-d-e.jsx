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
