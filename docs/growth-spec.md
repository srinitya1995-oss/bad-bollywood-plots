# Growth Spec — Bad Desi Plots

> Last updated: 2026-04-20. Canonical go-to-market and growth reference.
> Companion docs: `product-spec.md`, `design-spec.md`,
> `system-architecture-spec.md`, `engineering-spec.md`,
> `applied-scientist-spec.md`, `content-editorial-spec.md`, `legal-ip-spec.md`.

---

## 1. Premise

A desi party trivia PWA lives or dies on word-of-mouth. No paid acquisition
budget survives in this category because the unit economics are zero (free
product, no monetization). Growth must be earned through the product being
share-worthy and the seed community being active.

Everything in this spec assumes zero paid spend in year one.

## 2. Distribution audit (where the audience already is)

### High-intent desi spaces
- **r/Bollywood** (1M+) — subreddit about Hindi film, high-engagement post format
- **r/Tollywood** / **r/IndianCinema** — regional and pan-Indian film subs
- **r/IndianGaming** — desi game enthusiasts
- **Facebook groups:** "Bollywood Fans," "Old is Gold Bollywood," diaspora community groups
- **Instagram meme pages:** @bollyblindsngossip, @filmy_dairies, @desi_meme_account (hundreds of similar)
- **YouTube channels:** Jaby Koay (reaction), Think School (explainers) — not directly us, but their audience overlaps
- **Twitter/X desi film circles** — #BollywoodTwitter, #TollywoodTwitter hashtags

### Private channels (the real growth lever)
- **WhatsApp family groups** — where desi jokes, news, and content actually travel
- **WhatsApp friend groups** — high-trust, low-noise sharing
- **Discord servers** — college groups, fantasy cricket, filmy discussion servers
- **Slack / Teams at desi-heavy workplaces** — lunch-break share pattern

### Physical spaces
- **Desi college associations (US / UK / Canada / Australia)** — Diwali nights, garba events, IIT/IIM alumni gatherings
- **Desi weddings + sangeets** — pre-ceremony waiting rooms, post-ceremony after-parties
- **South Asian coffee shops / hookah bars / chai spots** — game nights

### Anti-audience spaces (don't waste cycles)
- **Generic gaming subreddits** — the jokes don't translate
- **Hacker News / Product Hunt** — wrong audience, wrong engagement pattern for a party game
- **TikTok** — could work but algorithmic unpredictability + short-form demands a dedicated content owner we don't have

## 3. Viral loops (product-driven)

These must be built into the product, not tacked on. Each has a v2.x ship target.

### Loop 1: Shareable round card (v2.3 target)
After Results screen, a "Share the round" CTA generates an image: "RAHUL bagged 12 pts on BAD DESI PLOTS. Beat that? baddesiplots.com"

- Native Web Share API (`navigator.share`) on mobile → WhatsApp / Instagram / SMS
- Desktop falls back to "copy image + link"
- Generated via `html2canvas` or a server-side OG image endpoint (TBD)

**KPI:** share rate = shares / completed rounds. Target: 15%+ after launch.

### Loop 2: Invite a friend to beat your score (v2.4 target)
"You scored 12. Can Simran? Send her the round →"

- Creates a shareable URL with the same deck seed
- Recipient plays the same 12 cards, compares scores, naturally shares back

**KPI:** sent invites per session, invite acceptance rate.

### Loop 3: Daily card (v2.3 target)
One card per day, globally synced, same everywhere. Group chats share guesses: "day 47 — got it, did u?"

- Becomes a ritual hook (Wordle-shaped)
- Tied to streak tracking ("14-day streak on BDP")
- Score format: `Bad Desi Plots · Apr 20 · ★★★☆☆ · baddesiplots.com/daily`

**KPI:** daily returning users, streak length distribution.

### Loop 4: Pass the phone virality (already shipping)
Every party round hits 2-8 people with the URL. The "how do I play this?" question makes the reader an evangelist.

**KPI:** median players per session. Target: 3.5+. Already instrumented.

## 4. Seed community (first 100 players)

### Who
- 30 college desi associations (NA + UK)
- 20 Instagram meme page admins
- 15 desi Twitter/X film critics and reviewers
- 15 family WhatsApp group admins in the author's network
- 10 r/Bollywood high-karma posters
- 10 desi podcast hosts / Youtube creators

### Ask
- Play one round at your next gathering
- Post a single photo or short video of your group playing
- Tag @baddesiplots (IG handle TBD) or #BadDesiPlots

### Incentive
- None monetary. Status + early-access badge.
- Named on a `/credits` page as "founding players" (unlisted until launch, then live)
- First dibs on the daily card from day 1

### Recruitment channel
- Direct DM / email from the author, one by one. No bulk mass email.
- Warm intros from friends / family where possible
- Low-stakes ask — "try this, share if you like it"

## 5. Launch plan

### Pre-launch (done — v2.1 shipped 2026-04-20)
- Product is live + stable
- Preview tested by owner on mobile + desktop
- Supabase + PostHog instrumented
- No marketing yet

### Soft launch (T+1 week)
- Share with seed community list (above 100)
- Post on r/Bollywood with an honest framing: "I built a party game where you guess Bollywood movies from terrible plot descriptions. Free, no ads, play at a desi party."
- Ask for feedback, not upvotes
- Fix anything that surfaces within 48h

### Hard launch (T+4 weeks)
- Assuming soft launch feedback is positive
- Product Hunt (maybe — this audience is mixed fit, but free and polished = worth a shot)
- Cross-post to r/Tollywood, r/IndianGaming
- Instagram: commission one desi meme page to post a round video (no payment, mutual promotion)
- Push to personal network: LinkedIn, Twitter, family WhatsApp

### Sustained (T+8 weeks onward)
- Daily card launch (v2.3 ships) — ritual hook
- Monthly "new deck" drops (v2.3 + cards)
- Partner with one desi creator per month for a "watch my family play BDP" video

## 6. Content calendar

Posting cadence once sustained growth is running:

### Instagram / reels (weekly)
- Monday: a single bad plot, swipe for the reveal
- Wednesday: a "can you name this from one line" carousel
- Friday: a 15s screen-capture of a round moment (flip + reveal)

### Twitter / X (daily)
- Bad plot of the day in 280 chars
- Reply to trending film tweets with "we have a card for this"

### Reddit (bi-weekly)
- r/Bollywood cross-post when a new deck or mode ships
- Participate, don't promote — be a member

### WhatsApp / direct (opportunistic)
- Personal share of any new feature to the family + friend groups
- The seed community does the heavy lifting here

## 7. KPIs + dashboards

All tracked in PostHog. See `applied-scientist-spec.md` §4 for definitions.

### Acquisition
- **Weekly new uniques** — target: 500 by week 12
- **Source mix** — organic (direct URL), referral (shared-round URL), social (IG / Reddit referrers)
- **Top sources** — one-month leaderboard of referring domains

### Activation
- **% completing first round** — target: 55%
- **Setup → first card flip** — should be under 60s median

### Retention
- **D7 return** — target: 35%
- **D30 return** — target: 20%
- **Weekly active users / weekly new users** — retention quality ratio

### Virality
- **Invite rate** — shared rounds / completed rounds
- **Viral coefficient (K-factor)** — (invites × acceptance rate) per user. K > 0.5 is healthy; K > 1.0 is exponential.
- **Party mix** — % of rounds with 2+ players (proxy for offline virality)

### Content quality
- **Feedback thumbs-up rate** — target: 80%
- **Card report rate** — target: < 0.5% per card

## 8. Budget

### Year 1
- Product hosting (Netlify): $0 (free tier sufficient)
- Analytics (PostHog): $0 (free tier sufficient, 1M events/month)
- Database (Supabase): $0 (free tier sufficient)
- Domain renewal (baddesiplots.com, Porkbun): ~$11/yr. Legacy badbollywoodplots.com held through 2026 for 301 continuity (~$15).
- Total hard cash year 1: **~$26**; year 2 onward **~$11/yr** if legacy domain is dropped.

### Contingent spend (only if X happens)
- $100 — one-off reel commission if organic growth stalls at week 8
- $500 — reserved for year 2 if we need to boost a single post on Instagram
- **$0** — reserved for Google or Facebook ads. Paid acquisition is not our model.

## 9. Failure modes + pivots

### If D7 retention < 15% at week 8
- **Diagnosis:** party experience good, return dynamic weak
- **Response:** accelerate daily card ship (v2.3 → v2.2.5), add it as the D2+ hook

### If party mix < 40% at week 8
- **Diagnosis:** people are playing solo only, pass-the-phone isn't firing
- **Response:** reframe home screen to emphasize PASS & PLAY as the primary mode; add screenshot of a group playing

### If share rate < 5% after v2.3 ships
- **Diagnosis:** the shareable card isn't compelling
- **Response:** A/B the result card design; surface the winner's quote more; try animated GIF vs static

### If activation (first full round completion) < 40%
- **Diagnosis:** setup friction OR first card feels wrong
- **Response:** audit first-round experience end-to-end; shorten setup; inject an easy Bollywood card as the first card for a new user

### If organic growth is flat at week 12
- **Diagnosis:** not enough seeding
- **Response:** double down on seed community (re-engage, ask for one more share); pivot one post to a college-targeted angle ("try this at your next dorm party")

### If growth ambiguously succeeds but feedback is critical
- **Diagnosis:** wrong product for the audience, or wrong framing
- **Response:** step back, interview 10 users, decide whether to iterate or accept a niche ceiling

## 10. Non-goals

- **SEO.** We don't index. The URL is passed around, not searched for.
- **Email capture.** We don't collect emails. No newsletter. The unfinished-trip feel would kill the casual vibe.
- **Gamification UX (badges, streaks, progress bars)** — we ship streaks already; more feels like a mobile game, and that's not the brand.
- **Influencer partnerships at scale** — we're not a creator economy product. Creator partnerships are reciprocal, not transactional.
- **Paid ads** — period. See §8 budget.
- **App store launch** — PWA only. App-store discovery isn't our channel, and the distribution tax (certification, store listing, screenshots, 30% if we ever monetized) isn't worth it.

## 11. Metrics-to-decision mapping

When a metric triggers, who decides? In a solo-author project, the author. But explicit triggers prevent paralysis:

| Metric triggers | Action |
|---|---|
| D7 < 15% for 2 consecutive weeks | Stop adding features; dig into retention |
| Activation < 40% for 1 week | Emergency: audit onboarding |
| Card report rate > 1% on any card | Pull card from deck, investigate |
| Negative feedback > 25% | Pause roadmap; do user interviews |
| WhatsApp / Reddit mentions / DMs showing joy | Keep shipping the same direction |
| Quiet for 1 week post-launch | Don't overreact; seed community is slow. Re-engage at week 3. |

## 12. Competitive defense

If a competitor appears (well-funded "Bollywood trivia" app):

- **Content moat** — our card voice + fact-verified deck is hand-crafted. A well-funded competitor will use LLM-generated cards; their voice will be flat.
- **Community moat** — if seeded right, our loyal early players become our defenders. They'll tell the difference.
- **Product moat** — PWA-first + offline-first + zero-friction onboarding is architecturally faster than their native app experience for the "start a round at a party" use case.
- **Speed moat** — we can ship daily. They can't (their ship cycle is gated by app store review).

Don't chase features a competitor ships. Stay on the party-game-with-soul axis.

## 13. Open growth questions

- Is a landing-page conversion optimization worth the effort, or is the product itself the landing page?
- Should the home screen ever show "X people played today" as social proof, or does that cheapen the casual party brand?
- When / whether to introduce a premium tier. Default answer: never. But if infra scales past free tier, consider one-time "founder supporter" paid credit ($5).
- Is there a B2B angle? (Trivia nights at desi-owned cafés in the US?) Probably a v3 question.
