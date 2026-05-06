/* IG profile mock + 3-week grid + in-feed single post chrome
   Uses templates from post-templates.jsx (window.TemplateA etc) */

/* ── IG single-post chrome (renders a 1080x1350 post inside IG feed UI) ── */
function IGFeedPost({ children, caption, likes='14,221', when='2 hours ago' }){
  return (
    <div style={{
      width:540, background:'#000', color:'#fff',
      fontFamily:'system-ui, -apple-system, sans-serif',
      border:'1px solid #262626',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:'50%',
            background:'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
            display:'grid', placeItems:'center',
          }}>
            <div style={{
              width:32, height:32, borderRadius:'50%', background:'#000',
              display:'grid', placeItems:'center', padding:2,
            }}>
              <div style={{ width:28, height:28, background:'var(--ink)',
                display:'grid', placeItems:'center',
                fontFamily:'Anton, sans-serif', fontSize:16, color:'var(--cream)',
                border:'1.5px solid var(--cream)' }}>B</div>
            </div>
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>baddesiplots</div>
            <div style={{ fontSize:11, color:'#a8a8a8' }}>baddesiplots.com</div>
          </div>
        </div>
        <span style={{ fontSize:18, color:'#fff' }}>⋯</span>
      </div>
      {/* Post media */}
      <div style={{ width:540, height:675, overflow:'hidden', position:'relative',
        background:'#0F1430' }}>
        <div style={{ transform:'scale(0.5)', transformOrigin:'top left' }}>
          {children}
        </div>
      </div>
      {/* Action bar */}
      <div style={{ display:'flex', justifyContent:'space-between',
        padding:'10px 14px' }}>
        <div style={{ display:'flex', gap:14, fontSize:22 }}>
          <span>♡</span><span>💬</span><span>↗</span>
        </div>
        <span style={{ fontSize:22 }}>🔖</span>
      </div>
      <div style={{ padding:'0 14px 12px', fontSize:13 }}>
        <div style={{ fontWeight:600, marginBottom:6 }}>{likes} likes</div>
        <div style={{ lineHeight:1.4 }}>
          <span style={{ fontWeight:600 }}>baddesiplots</span>{' '}
          <span style={{ color:'#fafafa' }}>{caption}</span>
        </div>
        <div style={{ marginTop:6, color:'#a8a8a8', fontSize:11, textTransform:'uppercase',
          letterSpacing:'0.05em' }}>{when}</div>
      </div>
    </div>
  );
}

/* ── IG profile mock (header + bio + highlights + grid) ── */
function IGProfile({ bio, gridTiles }){
  return (
    <div style={{ width:540, background:'#000', color:'#fff',
      fontFamily:'system-ui, -apple-system, sans-serif',
      border:'1px solid #262626' }}>
      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'10px 14px', borderBottom:'1px solid #262626' }}>
        <span style={{ fontSize:13, color:'#a8a8a8' }}>← </span>
        <span style={{ fontSize:15, fontWeight:600 }}>baddesiplots</span>
        <span style={{ fontSize:18 }}>⋯</span>
      </div>

      {/* Profile header */}
      <div style={{ padding:'18px 14px 0', display:'flex', gap:24, alignItems:'flex-start' }}>
        <div style={{ width:90, height:90, borderRadius:'50%',
          background:'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
          padding:3 }}>
          <div style={{ width:84, height:84, borderRadius:'50%', background:'#000',
            padding:3 }}>
            <div style={{
              width:78, height:78, borderRadius:'50%', overflow:'hidden',
              background:'var(--ink)', position:'relative',
              display:'grid', placeItems:'center',
            }}>
              <div style={{ position:'absolute', inset:5, border:'1px solid var(--tomato)' }}/>
              <span style={{
                fontFamily:'Anton, sans-serif', fontSize:62,
                color:'var(--cream)', lineHeight:1,
                textShadow:'2px 2px 0 var(--tomato)' }}>B</span>
            </div>
          </div>
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ flex:1, background:'#0095f6', color:'#fff', border:'none',
              padding:'7px 10px', borderRadius:8, fontWeight:600, fontSize:13 }}>
              Follow
            </button>
            <button style={{ flex:1, background:'#262626', color:'#fff', border:'none',
              padding:'7px 10px', borderRadius:8, fontWeight:600, fontSize:13 }}>
              Message
            </button>
            <button style={{ background:'#262626', color:'#fff', border:'none',
              padding:'7px 10px', borderRadius:8, fontSize:13 }}>▼</button>
          </div>
        </div>
      </div>

      <div style={{ padding:'8px 14px 0', display:'flex', gap:30, fontSize:13 }}>
        <span><b>164</b> posts</span>
        <span><b>27.3k</b> followers</span>
        <span><b>3</b> following</span>
      </div>

      {/* Bio */}
      <div style={{ padding:'10px 14px 14px', fontSize:13, lineHeight:1.4 }}>
        <div style={{ fontWeight:600 }}>Bad Desi Plots</div>
        <div style={{ color:'#a8a8a8', fontSize:11, marginBottom:4 }}>Game · Anonymous</div>
        <div style={{ whiteSpace:'pre-line' }}>{bio}</div>
        <div style={{ color:'#e0f1ff', marginTop:4 }}>🔗 baddesiplots.com/play</div>
      </div>

      {/* Highlights */}
      <div style={{ display:'flex', gap:14, padding:'8px 14px 16px', overflowX:'auto' }}>
        {[
          {l:'Plays', t:'tomato'},
          {l:'Reveals', t:'gold'},
          {l:'Cards', t:'emerald'},
          {l:'How To', t:'mauve'},
          {l:'Subs', t:'tomato'},
          {l:'Behind', t:'gold'},
        ].map((h, i) => {
          const colorVar = `var(--${h.t})`;
          const glyphs = ['▶','★','□','?','✉','◐'];
          return (
            <div key={h.l} style={{ display:'flex', flexDirection:'column',
              alignItems:'center', gap:6, minWidth:62 }}>
              <div style={{
                width:62, height:62, borderRadius:'50%',
                background:'var(--ink)', border:`2px solid var(--cream)`,
                display:'grid', placeItems:'center', position:'relative' }}>
                <div style={{ position:'absolute', inset:4, border:`1px solid ${colorVar}` }}/>
                <span style={{ fontFamily:'Anton, sans-serif', fontSize:22,
                  color:'var(--cream)' }}>{glyphs[i]}</span>
              </div>
              <span style={{ fontSize:11 }}>{h.l}</span>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderTop:'1px solid #262626' }}>
        {['⊞','▷','◉'].map((g, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', padding:'8px 0',
            borderTop: i===0 ? '1px solid #fff' : 'none',
            color: i===0 ? '#fff' : '#a8a8a8', fontSize:18 }}>{g}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:2,
        background:'#000',
      }}>
        {gridTiles.map((t, i) => (
          <div key={i} style={{
            aspectRatio:'1 / 1', overflow:'hidden', position:'relative',
            background: t.bg || 'var(--bg)',
          }}>
            {t.render && (
              <div style={{
                width:1080, height:1350,
                transform:`scale(${178/1080}) translateY(-${(1350-1080)/2}px)`,
                transformOrigin:'top left',
              }}>
                {t.render}
              </div>
            )}
            {t.label && (
              <div style={{ position:'absolute', top:6, right:6,
                fontSize:9, color:'#fff', background:'rgba(0,0,0,0.6)',
                padding:'2px 5px', borderRadius:3,
                fontFamily:'Bebas Neue, sans-serif', letterSpacing:'0.18em' }}>
                {t.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 3-week grid mock (27 tiles, alternation rule applied) ──
   Pattern per week (9 tiles):
     Mon: BW Card  · Tue: TW Card  · Wed: Carousel cover (BW)
     Thu: TW Card  · Fri: Reveal   · Sat: Quote
     Sun: TW Card  · pin: BW Card  · pin: Reel-cover-style card
*/
function ThreeWeekGrid({ cards }){
  const tile = (kind, card, label) => ({ kind, card, label });
  // Build 27 tiles. Alternate so no 3 in a row same color.
  // Week 1
  const w1 = [
    tile('A', cards[0], 'BW'),     // DDLJ
    tile('A', cards[5], 'TW'),     // RRR
    tile('B', cards[2], 'CAR'),    // 3 Idiots cover
    tile('A', cards[6], 'TW'),     // Okkadu
    tile('C', cards[0], 'REV'),    // DDLJ reveal
    tile('E', null, 'META'),
    tile('A', cards[3], 'BW'),     // Andhadhun
    tile('D', null, 'VOTE'),
    tile('A', cards[9], 'TW'),     // Baahubali
  ];
  const w2 = [
    tile('A', cards[1], 'BW'),     // Lagaan
    tile('A', cards[7], 'TW'),     // Magadheera
    tile('E', null, 'META'),
    tile('A', cards[4], 'BW'),     // Sholay
    tile('B', cards[5], 'CAR'),    // RRR cover
    tile('A', cards[8], 'TW'),     // Maro
    tile('C', cards[5], 'REV'),    // RRR reveal
    tile('A', cards[2], 'BW'),     // 3 Idiots
    tile('D', null, 'VOTE'),
  ];
  const w3 = [
    tile('A', cards[6], 'TW'),
    tile('A', cards[3], 'BW'),
    tile('B', cards[9], 'CAR'),
    tile('E', null, 'META'),
    tile('A', cards[1], 'BW'),
    tile('A', cards[7], 'TW'),
    tile('C', cards[3], 'REV'),
    tile('A', cards[8], 'TW'),
    tile('A', cards[4], 'BW'),
  ];
  const all = [...w1, ...w2, ...w3];
  return all.map(t => {
    let render;
    if (t.kind === 'A') render = <window.TemplateA card={t.card} showCta={false} hideWatermark={true}/>;
    else if (t.kind === 'B') render = (
      <div style={{ width:1080, height:1350,
        background:'var(--bg)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:240, left:60, right:60,
          fontFamily:'Anton, sans-serif', fontSize:172, lineHeight:0.85,
          color:'var(--cream)', textTransform:'uppercase', letterSpacing:'-0.025em' }}>
          How many<br/>can <span style={{ color:'var(--tomato)',
            textShadow:'5px 5px 0 var(--ink), 10px 10px 0 var(--gold)' }}>you</span><br/>guess?
        </div>
        <div style={{ position:'absolute', bottom:80, right:60,
          fontFamily:'Bebas Neue, sans-serif', fontSize:36,
          letterSpacing:'0.32em', color:'var(--gold)' }}>SWIPE →</div>
      </div>
    );
    else if (t.kind === 'C') render = (
      <div style={{ width:1080, height:1350, background:'var(--ink)',
        position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:340, left:60, right:60,
          textAlign:'center',
          fontFamily:'Anton, sans-serif', fontSize:160, lineHeight:0.85,
          color:'var(--gold)', textTransform:'uppercase', letterSpacing:'-0.02em',
          textShadow:'6px 6px 0 var(--bg), 14px 14px 0 var(--tomato)' }}>
          {t.card.n}
        </div>
        <div style={{ position:'absolute', top:200, left:0, right:0, textAlign:'center',
          fontFamily:'Bebas Neue, sans-serif', fontSize:36,
          letterSpacing:'0.42em', color:'var(--cream)' }}>
          THE ANSWER
        </div>
      </div>
    );
    else if (t.kind === 'D') render = <window.TemplateD bwCard={cards[0]} twCard={cards[5]}/>;
    else if (t.kind === 'E') render = <window.TemplateE/>;
    return { render, label: t.label };
  });
}

Object.assign(window, { IGFeedPost, IGProfile, ThreeWeekGrid });
