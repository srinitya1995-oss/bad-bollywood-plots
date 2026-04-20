# Pebl — Build Prompt for Claude Code + Superpowers

## WHAT TO INSTALL FIRST

### Skills to add (if you don't already have them):
```bash
# These will help Claude Code build Pebl properly
/plugin install frontend-design     # React component patterns
/plugin install designer-skills     # UI/UX design skills
```

### Agent to use:
Copy the `designer-agent.md` from `docs/` to `~/.claude/agents/creative-designer.md` — this gives you the art director persona for Pebl's UI.

### Superpowers:
If you have Superpowers installed, use it for brainstorming the Spline character design and the UI layout. Run:
```
/superpowers brainstorm
```

---

## THE PROMPT — Paste this into Claude Code

```
Build Pebl — a desktop wellness companion app. An animated 3D orange ball character that lives on your screen, monitors your activity, and guides you through wellness moments.

## WHAT IS PEBL

Pebl is a small, glowing orange ball character with eyes, a smile, and little arms/legs. It floats on your desktop as a transparent overlay. It's not a notification system — it's a companion. It stretches WITH you, breathes WITH you, sips water WITH you.

Think Tamagotchi meets wellness coach. Clippy if Clippy was actually lovable.

## CORE FEATURES

1. **Activity Monitoring** — Track continuous screen time via mouse/keyboard activity. Detect idle periods. Know when someone's been grinding too long.

2. **Smart Break Nudges** — After 45-60 min of continuous work, Pebl gently pulses and suggests a break. Never naggy. Always warm. If dismissed, it goes away gracefully.

3. **Guided Stretches** — Pebl physically demonstrates stretches. 10-15 guided routines with matching animations. The user follows along.

4. **Breathing Meditation** — Pebl expands and contracts rhythmically. 1-min, 3-min, 5-min sessions. Eyes close. Calming.

5. **Water & Snack Reminders** — Pebl sips from a tiny glass. Suggests healthy snacks. Configurable intervals (default: water every 60min, snack every 120min).

6. **Burnout Detection** — When continuous usage exceeds thresholds, Pebl changes color (warmer/redder) and says: "You've been going hard. Let's wind it down."

7. **Calming Content** — Play calming music (Spotify/YouTube deep links), cortisol-lowering videos, positive news (RSS from Good News Network, Positive News).

8. **Celebrations** — Every completed wellness moment gets a happy dance, confetti, warm glow. Streaks matter.

## TECH STACK

- **Electron** desktop app (Mac first)
- **React + TypeScript** for UI
- **Spline 3D** (@splinetool/react-spline) for the animated ball character
- **Tailwind CSS** for UI panels
- **Framer Motion** for UI transitions
- **SQLite** (local, no cloud) for session history, stats, preferences
- **electron-updater** for auto-updates

## PROJECT STRUCTURE

```
pebl/
├── electron/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Preload script for IPC
│   └── tray.ts          # System tray setup
├── src/
│   ├── App.tsx           # Main React app
│   ├── components/
│   │   ├── PeblCharacter.tsx    # Spline 3D ball component
│   │   ├── SpeechBubble.tsx     # Ball's messages
│   │   ├── StretchGuide.tsx     # Guided stretch flow
│   │   ├── MeditationMode.tsx   # Breathing meditation
│   │   ├── WellnessDashboard.tsx # Stats, streaks, history
│   │   ├── Settings.tsx          # User preferences
│   │   └── Onboarding.tsx       # First-run introduction
│   ├── engine/
│   │   ├── activityMonitor.ts   # Screen time tracking
│   │   ├── wellnessEngine.ts    # Break timing & suggestions
│   │   ├── burnoutDetector.ts   # Burnout threshold logic
│   │   └── contentProvider.ts   # Music, news, videos
│   ├── state/
│   │   ├── store.ts             # State management
│   │   └── animations.ts       # Animation state machine
│   ├── data/
│   │   ├── stretches.json       # 15 stretch routines
│   │   ├── meditations.json     # 5 meditation sessions
│   │   └── affirmations.json    # Encouraging messages
│   └── db/
│       └── database.ts          # SQLite wrapper
├── assets/
│   └── pebl-scene.splinecode    # Spline 3D character
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── electron-builder.yml
```

## BUILD PHASES

### Phase 1: The Window (start here)
- Electron app with floating transparent window
- Always-on-top, draggable, click-through when idle
- System tray icon with quit/settings
- Placeholder orange circle where Spline ball will go
- Test: window floats, drags, doesn't block clicks

### Phase 2: The Character
- Embed Spline scene (start with a simple glowing orange sphere if no Spline file yet)
- Animation states: idle (gentle float/bob), pulse (attention), happy, sad, sleepy
- Speech bubble component that appears above the ball
- Ball personality: warm, encouraging, never guilt-trips
- Test: ball renders, animations transition smoothly

### Phase 3: The Brain
- Activity monitor: track mouse/keyboard events
- Session timer: continuous work time tracking
- Idle detection: pause timer when inactive
- Burnout threshold: configurable (default 90 min continuous)
- SQLite database: store sessions, completed wellness moments
- Test: timer accurate, idle detection works, data persists

### Phase 4: The Wellness
- Stretch system: ball demonstrates, text guides user through steps
- Build 10 stretch routines (neck, shoulders, wrists, back, legs)
- Meditation mode: ball breathes in/out, expand/contract animation
- Build 3 meditation durations (1min, 3min, 5min)
- Water/snack reminders at configurable intervals
- Completion celebration: happy dance + streak update
- Test: each routine plays start to finish, stats recorded

### Phase 5: The Content
- Calming music: Spotify/YouTube deep links
- Positive news: RSS feed integration
- Wellness dashboard: daily/weekly stats, streaks, history
- Onboarding flow: introduce Pebl, set preferences
- Settings: reminder intervals, quiet hours, DND mode
- Test: content loads, dashboard accurate, settings persist

### Phase 6: Ship
- Mac DMG packaging + code signing
- Auto-update system
- Landing page (separate project)
- Performance: <150MB RAM idle, <2% CPU idle
- Accessibility: keyboard nav, screen reader support

## DESIGN PRINCIPLES

1. **Never annoying, always warm.** Pebl is a friend, not a nag.
2. **Show, don't tell.** Pebl demonstrates instead of instructing.
3. **Respect focus.** During deep work, Pebl stays tiny and quiet.
4. **Celebrate small wins.** Every wellness moment gets a little party.
5. **Beautiful by default.** Premium feel — warm glow, soft shadows, smooth animations.

## PALETTE

- Pebl Orange: #FF8C42
- Deep Background: #1A0F0A
- Warm White: #FEF7F0
- Accent Teal: #4EC9B0
- Soft Shadow: rgba(255, 140, 66, 0.2)
- Warning Warm: #E85D4A (burnout state)

## START WITH PHASE 1. Show me the Electron setup and floating window before moving to the character.
```

---

## SUPPLY CHAIN — The Boring But Essential Stuff

### 1. Domain
**Buy:** `pebl.app` or `getpebl.com` or `peblwellness.com`
**Where:** [Namecheap](https://namecheap.com) or [Cloudflare Registrar](https://dash.cloudflare.com) (cheapest renewals)
**Cost:** ~$10-15/year
**Do this first** — even before building. Grab the name.

### 2. Landing Page (before the app is ready)
**Use:** [Framer](https://framer.com) — design a one-page "coming soon" with email capture
**Or:** Build a simple HTML page and host on Cloudflare Pages (free)
**What it needs:**
- Hero showing Pebl character concept
- One sentence: "Your desktop wellness companion. Coming soon."
- Email signup (use [Buttondown](https://buttondown.email) — free up to 100 subscribers)
- Link to your socials

### 3. Hosting & Distribution
**For the landing page:** Cloudflare Pages (free) or Vercel (free)
**For the Electron app:** You don't need traditional hosting. You distribute as:
- **Mac:** DMG file → eventually Mac App Store ($99/year Apple Developer)
- **Windows:** EXE/MSI installer → eventually Microsoft Store
- **For now:** GitHub Releases (free) — users download directly
- Auto-updates via `electron-updater` pointing to GitHub Releases

### 4. Analytics
**Landing page:** [PostHog](https://posthog.com) (free tier, 1M events/month) — you already use this for Bad Plots
**In-app (Electron):** PostHog works here too — just initialize in the renderer process. Track:
- App opens per day
- Wellness moments completed
- Which stretches/meditations are most popular
- Average session length before break
- Burnout alerts triggered
- Retention (daily/weekly active)

### 5. Email / Waitlist
**[Buttondown](https://buttondown.email)** — free, simple, no bloat
Or **[Loops](https://loops.so)** if you want nicer templates later

### 6. Social / Marketing
- **Instagram:** @peblwellness (grab the handle NOW)
- **Twitter/X:** @peblapp
- **Product Hunt:** Prep a launch page early, build followers before launch

### 7. Code Signing (for Mac distribution)
- Apple Developer Program: $99/year
- Need this to sign your DMG so Mac users don't get "unidentified developer" warnings
- Can wait until Phase 6, but budget for it

### 8. Total Cost to Launch
```
Domain:              $12/year
Landing page:        $0 (Cloudflare Pages)
Hosting/CDN:         $0 (GitHub Releases for app)
Analytics:           $0 (PostHog free tier)
Email:               $0 (Buttondown free tier)
Apple Developer:     $99/year (when ready to ship)
─────────────────────
Total Year 1:        ~$111
```

That's it. No servers, no cloud, no subscription services eating your money. Pebl is a desktop app with local storage — the whole thing runs on the user's machine.
