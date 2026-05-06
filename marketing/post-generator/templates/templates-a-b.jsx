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
