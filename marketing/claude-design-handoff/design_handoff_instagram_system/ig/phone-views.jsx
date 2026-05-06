/* IG Phone-shaped views: profile + feed
   Wraps the existing IG components in proper iPhone chrome
   (status bar, sticky header, bottom nav) so the user sees how
   posts actually appear on the platform.

   The phone is a 390x844 viewport (iPhone 14). All children
   render at native IG widths (390px) — the post media is
   the existing 1080x1350 templates scaled to fit.
*/

const PHONE_W = 390;
const PHONE_H = 844;

/* ── iOS status bar ── */
function IOSStatusBar({ dark = true }){
  const fg = dark ? '#fff' : '#000';
  return (
    <div style={{
      height:44, paddingTop:8,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'8px 28px 0',
      fontFamily:'-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      color:fg, fontSize:15, fontWeight:600, letterSpacing:'-0.01em',
    }}>
      <span>9:41</span>
      <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:13 }}>
        <span>●●●●</span>
        <span style={{ fontSize:12 }}>􀙇</span>
        <span style={{
          width:24, height:11, border:`1.4px solid ${fg}`, borderRadius:3,
          position:'relative', display:'inline-block' }}>
          <span style={{ position:'absolute', inset:1.5,
            background:fg, borderRadius:1, width:'70%' }}/>
          <span style={{ position:'absolute', right:-3, top:3,
            width:1.5, height:5, background:fg, borderRadius:1 }}/>
        </span>
      </div>
    </div>
  );
}

/* ── IG top header (logo + icons) ── */
function IGFeedHeader(){
  return (
    <div style={{
      height:44, padding:'0 12px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      borderBottom:'0.5px solid #1f1f1f',
      fontFamily:'system-ui, -apple-system, sans-serif', color:'#fff',
    }}>
      <div style={{
        fontFamily:'"Snell Roundhand","Brush Script MT", cursive',
        fontSize:28, fontWeight:700, fontStyle:'italic',
        marginLeft:4, letterSpacing:'-0.01em',
      }}>Instagram</div>
      <div style={{ display:'flex', gap:18, fontSize:22 }}>
        <span>♡</span>
        <span style={{ position:'relative' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
            <path d="M21.04 12.13c.07-.42.07-.86 0-1.28-.62-3.7-3.78-6.55-7.6-6.85-.45-.04-.9-.04-1.35 0-3.82.3-6.98 3.15-7.6 6.85-.07.42-.07.86 0 1.28.62 3.7 3.78 6.55 7.6 6.85.45.04.9.04 1.35 0 .76-.06 1.5-.22 2.2-.46l3.36 1.43-.84-3.46c1.5-1.18 2.5-2.86 2.88-4.36z"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ── IG bottom nav ── */
function IGBottomNav({ active = 'home' }){
  const items = [
    { k:'home', glyph:'⌂' },
    { k:'search', glyph:'⚲' },
    { k:'reels', glyph:'▷' },
    { k:'shop', glyph:'⊞' },
    { k:'profile', glyph:'●' },
  ];
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0,
      height:62,
      paddingBottom:14,
      display:'flex', alignItems:'center', justifyContent:'space-around',
      background:'#000', borderTop:'0.5px solid #1f1f1f',
      color:'#fff',
    }}>
      {items.map(it => (
        <span key={it.k} style={{
          fontSize: it.k === 'profile' ? 16 : 24,
          opacity: it.k === active ? 1 : 0.85,
          width: it.k === 'profile' ? 26 : 'auto',
          height: it.k === 'profile' ? 26 : 'auto',
          borderRadius: it.k === 'profile' ? '50%' : 0,
          background: it.k === 'profile'
            ? 'linear-gradient(45deg,#f09433,#dc2743,#bc1888)' : 'transparent',
          display:'grid', placeItems:'center',
          color: it.k === 'profile' ? '#fff' : '#fff',
          fontFamily: it.k === 'profile' ? 'Anton, sans-serif' : 'inherit',
        }}>{it.k === 'profile' ? 'B' : it.glyph}</span>
      ))}
    </div>
  );
}

/* ── Phone shell (390x844 with rounded corners + notch) ── */
function PhoneShell({ children, label }){
  return (
    <div style={{
      width:PHONE_W + 16, padding:8,
      background:'#0a0a0a', borderRadius:54,
      boxShadow:'0 30px 80px rgba(0,0,0,0.45), 0 0 0 1.5px #1f1f1f, inset 0 0 0 1.5px #2a2a2a',
      position:'relative',
    }}>
      <div style={{
        width:PHONE_W, height:PHONE_H,
        background:'#000', borderRadius:46, overflow:'hidden',
        position:'relative', color:'#fff',
      }}>
        {/* Dynamic island */}
        <div style={{
          position:'absolute', top:11, left:'50%', transform:'translateX(-50%)',
          width:120, height:35, background:'#000', borderRadius:20, zIndex:10,
        }}/>
        {children}
      </div>
    </div>
  );
}

/* ── A single IG post inside the phone feed ── */
function IGPostInPhone({ caption, likes, when, postType, children, music }){
  return (
    <div style={{ background:'#000', color:'#fff',
      fontFamily:'system-ui, -apple-system, sans-serif',
      borderBottom:'0.5px solid #1f1f1f', paddingBottom:8 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:'50%',
            background:'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
            display:'grid', placeItems:'center', padding:2,
          }}>
            <div style={{
              width:30, height:30, borderRadius:'50%', background:'#000',
              display:'grid', placeItems:'center', padding:2,
            }}>
              <div style={{ width:26, height:26, background:'#0F1430',
                display:'grid', placeItems:'center',
                fontFamily:'Anton, sans-serif', fontSize:15, color:'#F3E9D2',
                border:'1px solid #F3E9D2' }}>B</div>
            </div>
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:13 }}>baddesiplots
              <span style={{ marginLeft:4, color:'#0095f6' }}>✓</span>
            </div>
            {music ? (
              <div style={{ fontSize:11, color:'#a8a8a8' }}>♫ {music}</div>
            ) : (
              <div style={{ fontSize:11, color:'#a8a8a8' }}>baddesiplots.com</div>
            )}
          </div>
        </div>
        <span style={{ fontSize:18, color:'#fff' }}>⋯</span>
      </div>
      {/* Post media: native IG width is 390 (square) or 390x488 (4:5 portrait).
          We render 1080x1350 children scaled to fit width 390. */}
      <div style={{ width:PHONE_W, height: postType === 'square' ? PHONE_W : 488,
        overflow:'hidden', position:'relative', background:'#0F1430' }}>
        <div style={{
          transform: `scale(${PHONE_W / 1080})`,
          transformOrigin:'top left',
        }}>
          {children}
        </div>
        {postType === 'carousel' && (
          <div style={{ position:'absolute', top:10, right:10,
            background:'rgba(0,0,0,0.5)', borderRadius:12,
            padding:'3px 8px', fontSize:11, fontWeight:600,
            display:'flex', alignItems:'center', gap:4 }}>
            <span>1/6</span>
          </div>
        )}
      </div>
      {/* Action bar */}
      <div style={{ display:'flex', justifyContent:'space-between',
        padding:'8px 12px 4px' }}>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7"><path d="M12 21s-7-4.5-9.5-9.5C1 8 3 5 6 5c2 0 3 1 4 2.5 1-1.5 2-2.5 4-2.5 3 0 5 3 3.5 6.5C19 16.5 12 21 12 21z" strokeLinejoin="round"/></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7"><path d="M21 12c0 4.5-4 8-9 8-1.5 0-3-.3-4.3-.9L3 21l1.4-4C3.5 15.6 3 13.8 3 12c0-4.5 4-8 9-8s9 3.5 9 8z"/></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"><path d="M22 3L11 14M22 3l-7 18-4-7-7-4 18-7z"/></svg>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {postType === 'carousel' && (
            <div style={{ display:'flex', gap:3, marginRight:6 }}>
              {[0,1,2,3,4,5].map(i => (
                <span key={i} style={{ width:5, height:5, borderRadius:'50%',
                  background: i === 0 ? '#0095f6' : '#5a5a5a' }}/>
              ))}
            </div>
          )}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7"><path d="M19 21l-7-5-7 5V4h14z"/></svg>
        </div>
      </div>
      {/* Likes + caption */}
      <div style={{ padding:'2px 12px 0', fontSize:13 }}>
        <div style={{ fontWeight:600 }}>{likes} likes</div>
        <div style={{ marginTop:3, lineHeight:1.35 }}>
          <span style={{ fontWeight:600 }}>baddesiplots</span>{' '}
          <span style={{ color:'#fafafa' }}>{caption}</span>
        </div>
        <div style={{ marginTop:5, color:'#a8a8a8', fontSize:11 }}>
          View all 247 comments
        </div>
        <div style={{ marginTop:3, color:'#a8a8a8', fontSize:10, textTransform:'uppercase',
          letterSpacing:'0.05em' }}>{when}</div>
      </div>
    </div>
  );
}

/* ── PHONE FEED VIEW: scrollable feed of multiple posts ── */
function IGPhoneFeed({ cards }){
  const ddlj  = cards.find(c => c.id === 'bw01');
  const rrr   = cards.find(c => c.id === 'tw_rrr');
  const baahu = cards.find(c => c.id === 'tw_bb');
  const lagaan= cards.find(c => c.id === 'bw05');
  const idiots= cards.find(c => c.id === 'bw_3i');

  return (
    <PhoneShell>
      <IOSStatusBar/>
      <IGFeedHeader/>
      {/* Stories rail */}
      <div style={{ display:'flex', gap:12, overflowX:'auto', padding:'10px 12px',
        borderBottom:'0.5px solid #1f1f1f', background:'#000' }}>
        {[
          {l:'Your story', isYou:true},
          {l:'baddesiplots', g:'tomato', live:true},
          {l:'jadooka', g:'gold'},
          {l:'masala.morgue', g:'emerald'},
          {l:'tortilla_cinema', g:'mauve'},
          {l:'bollyleaks', g:'tomato'},
        ].map((s, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column',
            alignItems:'center', gap:4, minWidth:64 }}>
            <div style={{
              width:62, height:62, borderRadius:'50%',
              background: s.isYou ? '#1f1f1f' :
                'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              padding:s.isYou ? 0 : 2.5,
              position:'relative',
            }}>
              <div style={{
                width:'100%', height:'100%', borderRadius:'50%',
                background:'#000', padding:s.isYou ? 0 : 2,
                display:'grid', placeItems:'center', position:'relative',
              }}>
                <div style={{ width:'100%', height:'100%', borderRadius:'50%',
                  background: s.g ? `var(--${s.g})` : '#1f1f1f',
                  display:'grid', placeItems:'center',
                  fontFamily: i===0 ? 'system-ui' : 'Anton, sans-serif',
                  color:'#fff', fontSize: i===0 ? 24 : 18 }}>
                  {i === 0 ? '+' : (s.l[0] || '').toUpperCase()}
                </div>
              </div>
              {s.live && (
                <div style={{ position:'absolute', bottom:-2, left:'50%',
                  transform:'translateX(-50%)',
                  background:'#dc2743', color:'#fff', fontSize:9, fontWeight:700,
                  padding:'1px 6px', borderRadius:4, letterSpacing:'0.06em' }}>LIVE</div>
              )}
            </div>
            <span style={{ fontSize:10, color:'#fff', maxWidth:64,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.l}</span>
          </div>
        ))}
      </div>
      {/* Scrollable feed */}
      <div style={{
        height: PHONE_H - 44 - 44 - 92 - 62, // statusBar - header - stories - bottomNav
        overflowY:'auto', overflowX:'hidden',
        background:'#000', position:'relative',
      }}>
        <IGPostInPhone
          caption="a plot, technically. they have all the words. they have most of the events. you'd swear you've seen this. you have. name it."
          likes="14,221" when="2 hours ago" postType="portrait">
          <window.TemplateA card={ddlj}/>
        </IGPostInPhone>
        <IGPostInPhone
          caption="five-second cinema. swipe for the rest. honour system on the score."
          likes="22,704" when="5 hours ago" postType="carousel">
          <window.TemplateB cards={[ddlj, rrr, baahu, lagaan, idiots, cards[6]]}/>
        </IGPostInPhone>
        <IGPostInPhone
          caption="both descriptions are factually accurate. only one is worse. comment A or B."
          likes="9,114" when="yesterday" postType="portrait">
          <window.TemplateD bwCard={lagaan} twCard={baahu}/>
        </IGPostInPhone>
        <IGPostInPhone
          caption="and the answer was always RRR. yes, even Karthik knew. yes, Karthik had it on his Letterboxd four years ago. for the record —"
          likes="31,408" when="2 days ago" postType="portrait">
          <window.TemplateC card={rrr}/>
        </IGPostInPhone>
        <IGPostInPhone
          caption="a sentence is enough."
          likes="6,802" when="3 days ago" postType="portrait">
          <window.TemplateE/>
        </IGPostInPhone>
        <div style={{ height:32 }}/>
      </div>
      <IGBottomNav active="home"/>
    </PhoneShell>
  );
}

/* ── PHONE PROFILE VIEW: full IG profile screen ── */
function IGPhoneProfile({ bio, gridTiles }){
  return (
    <PhoneShell>
      <IOSStatusBar/>
      {/* Profile top bar */}
      <div style={{ height:44, padding:'0 12px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:'0.5px solid #1f1f1f', color:'#fff',
        fontFamily:'system-ui, -apple-system, sans-serif' }}>
        <span style={{ fontSize:13 }}>🔒</span>
        <div style={{ display:'flex', alignItems:'center', gap:6,
          fontSize:16, fontWeight:600 }}>
          baddesiplots <span style={{ fontSize:11, color:'#a8a8a8' }}>▾</span>
        </div>
        <div style={{ display:'flex', gap:14, fontSize:18 }}>
          <span>+</span><span>☰</span>
        </div>
      </div>
      {/* Scrollable profile body */}
      <div style={{
        height: PHONE_H - 44 - 44 - 62,
        overflowY:'auto', overflowX:'hidden',
        background:'#000', color:'#fff',
        fontFamily:'system-ui, -apple-system, sans-serif',
      }}>
        {/* Profile pic + counts */}
        <div style={{ padding:'14px 14px 0', display:'flex',
          alignItems:'center', gap:24 }}>
          <div style={{ width:84, height:84, borderRadius:'50%',
            background:'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            padding:3 }}>
            <div style={{ width:78, height:78, borderRadius:'50%', background:'#000',
              padding:3 }}>
              <div style={{
                width:72, height:72, borderRadius:'50%', overflow:'hidden',
                background:'#0F1430', position:'relative',
                display:'grid', placeItems:'center',
              }}>
                <div style={{ position:'absolute', inset:5,
                  border:'1px solid #E5276B' }}/>
                <span style={{
                  fontFamily:'Anton, sans-serif', fontSize:54,
                  color:'#F3E9D2', lineHeight:1,
                  textShadow:'2px 2px 0 #E5276B' }}>B</span>
              </div>
            </div>
          </div>
          <div style={{ flex:1, display:'flex',
            justifyContent:'space-around', textAlign:'center' }}>
            <div><div style={{ fontWeight:700, fontSize:17 }}>164</div>
              <div style={{ fontSize:12 }}>posts</div></div>
            <div><div style={{ fontWeight:700, fontSize:17 }}>27.3k</div>
              <div style={{ fontSize:12 }}>followers</div></div>
            <div><div style={{ fontWeight:700, fontSize:17 }}>3</div>
              <div style={{ fontSize:12 }}>following</div></div>
          </div>
        </div>
        {/* Name + bio */}
        <div style={{ padding:'10px 14px 12px', fontSize:13, lineHeight:1.4 }}>
          <div style={{ fontWeight:600 }}>Bad Desi Plots</div>
          <div style={{ color:'#a8a8a8', fontSize:11, marginBottom:5 }}>Game · Anonymous</div>
          <div style={{ whiteSpace:'pre-line' }}>{bio}</div>
          <div style={{ color:'#e0f1ff', marginTop:5 }}>🔗 baddesiplots.com/play</div>
        </div>
        {/* Buttons */}
        <div style={{ padding:'0 14px 14px', display:'flex', gap:6 }}>
          <button style={{ flex:1, background:'#262626', color:'#fff', border:'none',
            padding:'7px 10px', borderRadius:8, fontWeight:600, fontSize:13 }}>
            Following ▾
          </button>
          <button style={{ flex:1, background:'#262626', color:'#fff', border:'none',
            padding:'7px 10px', borderRadius:8, fontWeight:600, fontSize:13 }}>
            Message
          </button>
          <button style={{ background:'#262626', color:'#fff', border:'none',
            padding:'7px 10px', borderRadius:8, fontWeight:600, fontSize:13,
            minWidth:38 }}>+</button>
        </div>
        {/* Highlights — single-letter Anton glyphs on tinted swatches */}
        <div style={{ display:'flex', gap:14, padding:'4px 14px 14px', overflowX:'auto' }}>
          {[
            {l:'Plays',   tint:'#1d2348', glyph:'P'},
            {l:'Reveals', tint:'#3b1d2e', glyph:'R'},
            {l:'Cards',   tint:'#1d3329', glyph:'C'},
            {l:'How To',  tint:'#2b223e', glyph:'?'},
            {l:'Subs',    tint:'#3a2912', glyph:'S'},
            {l:'Behind',  tint:'#0F1430', glyph:'B'},
          ].map((h) => (
            <div key={h.l} style={{ display:'flex', flexDirection:'column',
              alignItems:'center', gap:5, minWidth:62 }}>
              <div style={{
                width:62, height:62, borderRadius:'50%',
                background: h.tint,
                border:'1px solid rgba(243,233,210,0.45)',
                display:'grid', placeItems:'center', position:'relative' }}>
                <span style={{ fontFamily:'Anton, sans-serif', fontSize:30,
                  color:'#F3E9D2', letterSpacing:'-0.01em',
                  lineHeight:1 }}>{h.glyph}</span>
              </div>
              <span style={{ fontSize:11, color:'#fff' }}>{h.l}</span>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div style={{ display:'flex', borderTop:'0.5px solid #1f1f1f',
          fontSize:18 }}>
          {[
            <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6"><rect x="3" y="3" width="6" height="6"/><rect x="11" y="3" width="6" height="6"/><rect x="3" y="11" width="6" height="6"/><rect x="11" y="11" width="6" height="6"/></svg>,
            <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="1.6"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
            <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>,
          ].map((g, i) => (
            <div key={i} style={{ flex:1, textAlign:'center', padding:'10px 0',
              borderTop: i===0 ? '1.5px solid #fff' : 'none',
              display:'grid', placeItems:'center' }}>{g}</div>
          ))}
        </div>
        {/* Grid */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:1.5,
          background:'#000',
        }}>
          {gridTiles.map((t, i) => (
            <div key={i} style={{
              aspectRatio:'1 / 1', overflow:'hidden', position:'relative',
              background: t.bg || '#0F1430',
            }}>
              {t.render && (
                <div style={{
                  width:1080, height:1350,
                  // tile is ~129px wide; scale 1080->129; center vertically
                  transform:`scale(${(PHONE_W/3 - 1) / 1080}) translateY(-${(1350-1080)/2}px)`,
                  transformOrigin:'top left',
                }}>
                  {t.render}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ height:24 }}/>
      </div>
      <IGBottomNav active="profile"/>
    </PhoneShell>
  );
}

Object.assign(window, { IGPhoneFeed, IGPhoneProfile, PhoneShell });
