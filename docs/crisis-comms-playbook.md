# Crisis Comms Playbook — `@baddesiplots`

> What to do when things go wrong on the brand account. Eight scenarios with severity, first-60-min response, 24-hour response, and post-mortem questions. Plus three statement templates and a decision flowchart for apologize vs. stand firm.

---

## Severity definitions

| Tier | Meaning | Response speed |
|---|---|---|
| **P0** | Brand-existential. Legal threat, mass harassment, viral attack. | Action within 30 min, statement within 2 hours |
| **P1** | High-visibility error. Factual mistake on a popular post, offensive content, site outage during traffic spike. | Action within 2 hours, statement within 24 hours |
| **P2** | Recoverable mistake. Minor factual error, dated joke, low-engagement criticism. | Action within 24 hours, no public statement needed |
| **P3** | Background noise. Single hostile commenter, bot ring follow, low-stakes correction. | Action within 72 hours, no public statement |

When unsure, treat as one tier higher than your gut says. Under-reacting is worse than over-reacting in this brand's context.

---

## Scenario 1: Card is factually wrong (wrong year, wrong cast, plot fits a different movie)

**Severity:** P2 if caught in <24h, P1 if it has 1k+ engagements before correction.

### First 60 minutes
1. Verify the correction. Cross-check against IMDB, Letterboxd, and a primary source (the film's Wikipedia page is fine for years/cast). Don't trust a single commenter — they might be wrong.
2. If correction confirmed:
   - **Edit the caption** with a `(corrected: it was 1997 not 1995 — thanks @user)` note. Don't delete the post.
   - Pin the correcting commenter's comment.
   - Update `cards.json` so the in-app card is also correct.
3. If correction is wrong, ignore it. One pinned counter-reply is enough: `"the year is right. checked."`

### 24-hour response
- No public statement needed for a date/cast typo.
- If the plot describes a different movie entirely (rare, but happens), edit the caption, pin the correction, and post a story acknowledging it: `"yesterday's card had a plot leak from another film. it's been fixed. we owe you snacks."`
- Update the card-QA process so this category of error gets a second reviewer.

### Post-mortem questions
- Did our card-QA pipeline miss this? Why?
- Was this from a generated batch? Run a re-check on cards from that batch.
- Did we have a duplicate movie issue (two cards describing the same plot)?

---

## Scenario 2: Card is offensive (unintentionally racist, sexist, casteist, communalist)

**Severity:** P1 always. Escalate to P0 if it goes viral with criticism.

### First 60 minutes
1. **Take down the post immediately.** Don't archive — delete. The post is the problem.
2. Delete the card from `cards.json`, push the change.
3. Read every comment on the post before it's gone — capture screenshots for the post-mortem.
4. **Do not reply to commenters yet.** Don't argue, don't defend, don't explain. Silence for 30 minutes is better than a defensive comment that lives forever.
5. Internal Slack/notes: who wrote/approved the card, what was the failure mode (lazy stereotype? unaware of context? bad joke that landed wrong?).

### 24-hour response
- Post a story (24-hour ephemeral) with the apology template (see below).
- Do NOT post a feed apology unless this has hit press, or 5+ accounts >50k followers have called it out. Feed apologies create a permanent record and often invite more attacks. Stories let the moment pass.
- Reply to the loudest critics individually with a short, non-defensive note: `"you were right. we pulled it. thanks."`
- Update `docs/card-voice-rubric.md` with the specific failure pattern so it doesn't repeat.

### Post-mortem questions
- What was the prompt/source that produced this card?
- Did our voice rubric flag this category?
- Do we need a sensitivity review step for cards touching: religion, caste, region, gender, disability, sexual orientation?
- Should the writer/approver of this card be off the rotation?
- Is there a category of films we should not write cards about until we have better review (recent communal-tension films, films about specific real-world tragedies, films about specific living people)?

---

## Scenario 3: Card uses copyrighted lyrics or quotes a film verbatim

**Severity:** P1.

### First 60 minutes
1. Take down the post. Even if fair use likely covers it, the cleanup is faster than the defense.
2. Edit the card in `cards.json` to remove the verbatim quote/lyric. Replace with paraphrase.
3. Capture a screenshot of the original for `docs/legal-incidents.md`.
4. Re-read `docs/legal-fair-use-posture.md` — verbatim quotes weaken our posture and are explicitly listed as something we don't do.
5. If the original post had >1k engagements, check whether anyone else screenshotted it; that doesn't change our action but informs whether to expect a follow-up takedown.

### 24-hour response
- No public statement.
- Repost the corrected card with the paraphrase. Don't acknowledge the change.
- Audit the rest of `cards.json` for similar verbatim-quote patterns. Run `grep -i 'quote'` or scan the `c` field for direct quotation marks suggesting in-film dialogue.

### Post-mortem questions
- Was this human-written or AI-assisted? AI assistants tend to pull memorable quotes verbatim.
- Do we need a hard rule: any text inside double-quotes in the card body must be original, not from the film?
- Should the QA pipeline include a "is this a real line from the movie?" check?

---

## Scenario 4: Website goes down during a viral moment

**Severity:** P1 (P0 if downtime >30 min during peak).

### First 60 minutes
1. Pin a story to top of profile: `"site is overloaded — give us 30 min. cards loading nominally for everyone soon."` (Card voice: dry, no panic.)
2. Update bio link to a static landing page (Notion, GitHub Pages — pre-built and ready) that says "back in 30 min, here are 5 cards while you wait."
3. Page the engineer (yourself). Check Netlify status, Supabase status, PostHog event stream for the spike.
4. Disable any non-essential features (analytics writes, suggest-form) to reduce load.
5. Reply to first 5 "is the site down?" comments with the same line: `"on it. 30 min."`

### 24-hour response
- Once site is back up, restore bio link.
- Post a story: `"we're back. apologies for the bottleneck. snacks all around."`
- Internal: add capacity headroom monitoring. If a single reel can DDoS us, the architecture isn't ready for the audience we're trying to build.

### Post-mortem questions
- What was the actual bottleneck — Netlify bandwidth, Supabase rate limit, client-side bug?
- Do we need a CDN tier? Cloudflare in front of Netlify?
- What's our redirect-to-static-fallback time budget?
- Did we lose engagement we won't recover (people who tried, failed, won't try again)?

---

## Scenario 5: A 10M+ celebrity reposts and brings traffic crash

**Severity:** P0 by the math. P1 by the cause (the cause is good news).

### First 60 minutes
1. Same as Scenario 4 — site fallback, bio swap, capacity check.
2. **DM the celebrity's account immediately:** `"thank you. we are scrambling to keep up. the site is back in 30 min — happy to send you 10 unposted cards as thanks."` Do this before they delete the repost.
3. Pin a comment on their repost (if you can): `"the site is overloaded — back in 30. thank you @them."`
4. Pin a story acknowledging the moment: `"@celebrity sent you here. we are honored. give us 30 min."`

### 24-hour response
- Post a Template C reveal of the card they shared, tagging them — close the loop publicly.
- Send the unposted cards via DM as promised. This converts a one-time repost into a relationship.
- Add follower count, peak concurrent sessions, link-clicks attributed to the spike to `.project-state.md`. This is the data we'll point to for paid campaigns later.

### Post-mortem questions
- What's our capacity ceiling? Run a load test before the next viral candidate.
- Do we have a "celebrity protocol" — pre-built DM templates, pre-rendered card packs to send?
- Did we capture the moment well, or did 80% of the new visitors land on a broken page and leave forever?

---

## Scenario 6: Someone screenshot-dunks on a stale joke / dated reference

**Severity:** P3 unless their account is >100k or it gets cross-platform pickup; then P2.

### First 60 minutes
1. **Don't reply.** The dunker wants an audience. Replies fuel them.
2. Screenshot their post for record.
3. Read the criticism honestly: is the joke actually stale, or is this a taste disagreement?
4. If stale (the post is 6+ months old, references something now problematic, or punches at a real person): **silently archive the original post.** No statement. No explanation.
5. If it's a taste disagreement (the joke is fine, they just don't like it): do nothing. The dunk will pass.

### 24-hour response
- No statement.
- If the dunk catalyzes a pile-on, switch to Scenario 7 below.

### Post-mortem questions
- Do we have other posts in this same vein that should be archived proactively?
- Was this the algorithm resurfacing an old post, or did the dunker dig?

---

## Scenario 7: A spammy bot ring follows the brand and skews follower count

**Severity:** P3.

### First 60 minutes
1. Verify it's a bot ring: 50+ new follows in <10 min from accounts with <10 posts, no profile photo, generic usernames.
2. Block them in batches via IG's "manage followers" tool. Block the first 5 and IG often suggests "block similar."
3. Do NOT report them as spam unless they comment — IG can flag your account if you mass-report.

### 24-hour response
- No statement. Followers we don't want are not a story.
- Internal: check whether IG Insights now shows engagement-rate decline due to the dilution. If yes, block more aggressively over the next week.

### Post-mortem questions
- Were we listed somewhere (a "follow these accounts" bot list)? Search for our handle on Twitter/Threads to find the source.
- Do we need to make the account temporarily private if a botnet keeps coming back?

---

## Scenario 8: Influencer collab partner posts our card with their own bad caption misrepresenting the brand

**Severity:** P2 (P1 if the misrepresentation is offensive in their voice using our visual).

### First 60 minutes
1. Read their post. Decide: is the caption merely off-brand, or actively damaging?
2. **Off-brand but harmless** (e.g. they added a generic "follow my page!" CTA we didn't ask for): live with it. Free reach.
3. **Actively damaging** (e.g. they paired our card with a casteist joke, or claimed to have made it themselves, or attacked a community): DM them directly: `"hey — could you take down this post? the caption you added is doing damage we can't speak around. happy to send a fresh card pack with our suggested caption."`
4. If they refuse or ignore: comment once on their post: `"we made the card. we did not write the caption."` Pin our own clarifying post on our profile.

### 24-hour response
- If they took it down: warm note thanking them, send them a fresh pack with our suggested copy. Re-engage carefully.
- If they refused: post a story `"a card of ours is circulating with copy we didn't write. please disregard."` Do not name them. Do not feud.

### Post-mortem questions
- Do we provide collab partners a one-pager with brand voice guidelines + 3 caption options to copy?
- Should the unbranded card pack include a watermark that's hard to remove, so misuse is traceable?
- Was this partner properly vetted before we sent the pack?

---

## Statement templates

### Template H1 — Holding statement (P0/P1, when something is happening and we need to buy time)

```
we hear you. we're looking at it. update by [time, in IST and ET].
```

That's the whole thing. No emojis. No long paragraph. The shorter the holding statement, the less ammunition there is in it.

### Template A1 — Apology (when we got it wrong)

```
yesterday's card was wrong — not a typo wrong, the kind of wrong
where it shouldn't have been written. we pulled it. we're updating
how we review cards in [specific category] so this doesn't repeat.
no excuses. thanks for telling us.
```

Rules:
- Never use "we apologize if anyone was offended" (the conditional reads as a non-apology).
- Name the failure category specifically. Vague apologies read as PR.
- State a concrete process change. "We will do better" is not a process change.
- Sign off without a name. Brand voice, not founder voice.

### Template S1 — Standing firm (when we're being unfairly attacked)

```
the post stands. it's parody. parody about the films we love
is the entire point of this account. if the joke didn't land
for you, the next one might. if the format itself doesn't, we're
probably not for you and that's fine.
```

Rules:
- Use this rarely. Maybe twice a year. If it's deployed every week, the attacks were probably right.
- Never name the attacker.
- Never mock the criticism — restate the principle.
- Never argue further. Post once and disengage.

---

## Decision flowchart: apologize vs. stand firm

```
Is the criticism factually correct? (Did we actually get a year wrong, name a wrong actor, describe a different movie?)
├── YES → Correct + thank the corrector. No apology needed for typos. (Scenario 1)
└── NO  → Continue ↓

Is the criticism about offense? (Slur, stereotype, harm to a community?)
├── YES → Did we cause real harm, or did we cross a line we ourselves wrote into the rubric?
│         ├── YES → Apologize (Template A1). Pull the post. Update rubric. (Scenario 2)
│         └── NO  → It's a taste disagreement masquerading as harm. Do nothing publicly. Watch for pile-on signal. If pile-on starts AND criticism has a real point we missed, reconsider. (Scenario 6)
└── NO  → Continue ↓

Is the criticism about the format? ("Bollywood doesn't deserve parody," "this account is mid")
├── YES → Stand firm (Template S1) IF and only if the criticism is becoming the dominant narrative. Otherwise ignore. The format is the entire bet. (Scenario 6)
└── NO  → Continue ↓

Is this a legal threat?
├── YES → See docs/legal-fair-use-posture.md. No public statement. Comply with takedown if from major studio. Don't apologize, don't argue. Pull and reply privately.
└── NO  → It's noise. Ignore.
```

---

## Cardinal rules

1. **Never apologize from a defensive crouch.** Either we did wrong (full apology, concrete fix) or we didn't (silence or stand firm). The middle ground — "sorry if this offended anyone but actually we don't think we did anything wrong" — is the worst possible posture.
2. **The first hour is for not making it worse.** No replies, no defensive comments, no founder-voice DMs. Slow is fast.
3. **The post is not the brand.** We can pull any single post without losing identity. Don't get attached to a card.
4. **Document everything.** `docs/incidents/{date}-{scenario}.md` for any P0/P1. Pattern-detection across incidents is how the second year is calmer than the first.
5. **The brand voice never breaks during a crisis.** Dry, cinematic, slightly unhinged. No hand-wringing, no "we're devastated to learn," no purple prose. The cards don't apologize like a corporation, and neither do we.

---

*This playbook prevents two failure modes: panic-overreaction (deleting half the account, posting a tearful 8-paragraph apology) and complacent under-reaction (ignoring real harm because "the format is parody, anything goes"). When you're not sure, the answer is usually: pull the post, say less, fix the process.*
