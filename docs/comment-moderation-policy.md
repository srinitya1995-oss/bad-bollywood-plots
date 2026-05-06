# Comment Moderation Policy — `@baddesiplots`

> Public-facing rules + internal moderation protocol. The brand voice is dry, cinematic, slightly unhinged. We never apologize, never get defensive, never break character. We delete, pin, or ignore — that's the whole toolkit.

---

## Public-facing community rules (pin to profile / link in bio when ready)

We post terrible plots of great movies. The comments section is part of the show. To keep it watchable:

- **Guess freely.** Wrong answers are encouraged. Confidently wrong answers are art.
- **No spoilers** before the reveal post drops (24-hour window). Saying "it's [movie name]" in the comments of an unrevealed card gets deleted.
- **No slurs, no doxxing, no harassment.** Of any community, including the ones in the films.
- **No commercial promo.** This is not your link-tree.
- **No bot comments.** Generic emoji strings get deleted.

We don't take requests for who to be. We are this. Comments that violate the above get removed without explanation.

---

## Internal moderation matrix

### DELETE (no explanation, no DM, no announcement)
- Slurs (caste, religion, gender, sexuality, region, body) — every flavor
- Doxxing of any account, including obvious dunks ("@username's mom is...")
- Threats of violence, even joke ones ("I'll find you and...")
- Commercial promo, MLM bait, OF/cam links, crypto drops
- Spoilers in comments of un-revealed cards (24-hour window from post → reveal)
- Spoiler-baiting ("everyone here knows it's ___" while obscuring the answer)
- AI-generated spam comments (recognizable patterns: generic praise + irrelevant emoji string + link)
- Hateful content targeting any community in the films (anti-Muslim, anti-Hindu, casteist, anti-South Indian, anti-North Indian, misogynist, homophobic)
- Pile-on comments aimed at a specific other user
- Direct copy of another commenter's comment (bot ring signal)

### HIDE (uses IG's Restrict / Hidden Words; we don't see, others don't see)
- Comments from accounts that have been Restricted before
- Borderline-rude but not slur-level ("this account is mid" — let it sit, don't engage)
- Off-brand engagement-bait ("follow my page!!")

### PIN (1-3 pinned comments per post)
- Best correct guesses (witty phrasing, not just the movie name)
- Best confidently-wrong guesses ("definitely *Sholay*" on a *DDLJ* card)
- Submissions that improve the card ("you should have written: '...'" — pin if better)
- Comments from real desi creators in our target collab list (signals to algo + warms cold-DM relationships)
- Genuinely funny replies that extend the joke

### IGNORE (no action — hardest to learn)
- Trolls trying to provoke a reaction. Engagement is their oxygen.
- "First!" / engagement filler. Doesn't hurt anything. Don't pin, don't delete.
- "Make one for [movie]!" — ignore, but log to a `card-suggestions.md` file. Reply only when you've actually written the card they suggested, then tag them in the reveal.
- "This isn't funny" — single instance. The 5th instance from different accounts means the card actually isn't working; that's a content signal, not a moderation issue.
- Generic emoji reactions. Fine.
- Off-topic banter between two commenters that's not hostile.

### ESCALATE (hide → block, then document)
- Verified troll accounts (history of pile-ons across other desi creators)
- Comments that start a pile-on within 30 minutes (5+ piling on a single user)
- Anyone naming or implying real-world targets (the actual director, an actor, an account with <10k followers)
- Anything that looks like organized brigading (sudden 50+ comments from new accounts in <10 minutes)

Block is reversible; use it. Document the handle and reason in `docs/moderation-log.md` for pattern detection.

---

## Response time targets

- **First-hour comments** on every post: reply or pin within 60 minutes. Algo treats this as session length and surfaces the post wider. This is the single highest-leverage moderation activity.
- **Hours 1-4:** check every 30 min, reply to the best 2-3 only.
- **Hours 4-24:** twice. Pin the eventual winner. Delete violators.
- **Day 2+:** once a day until the post has aged out (~72h).
- **DMs:** reply within 4 hours during waking IST hours; never feel obligated to reply at all on Sunday.
- **Reports of harassment against the brand:** within 1 hour. Document, hide, escalate to block.

---

## Instagram tools setup (do this before launch)

### Hidden Words filter
Go to Settings → Privacy → Hidden Words. Enable:
- "Hide comments" → ON
- "Hide message requests" → ON
- "Advanced comment filtering" → ON

Add to **custom hidden words** (case-insensitive, comma-separated):

```
follow back, f4f, l4l, dm me, check my page, link in my bio, promo,
crypto, nft, signal copy, telegram channel, whatsapp +91, whatsapp +1,
mid, cope, ratio'd, ratio, cringe, this account is, unfollowing,
bhakt, sickular, libtard, urban naxal, anti-national,
[any 5-letter caste slur], [any 4-letter religious slur],
spoilers, the answer is, it's clearly, obviously [movie name]
```

For the slurs, use the actual list — don't write them in this doc but maintain in a private `.moderation-blocklist.txt` (gitignored). Update quarterly.

### Restrict (the under-used IG superpower)
Restrict an account → their comments are visible only to them, requiring our approval to be visible to others. They don't know they're restricted. Use for:
- Repeat low-effort negative commenters (not delete-worthy, not ignore-worthy)
- Accounts you suspect are bots but can't prove
- Anyone who started a pile-on once

Restricted list reviewed monthly. Lift Restrict if their behavior changed.

### Limit Interactions (deploy if a post goes viral)
Settings → Limits → Limit interactions from accounts that don't follow you OR recently followed you. Toggle on **only** during a viral spike to filter brigading. Toggle off after.

---

## Brand voice for replies

Reply **as the cards** — never as a founder, never apologetic, never customer-service-y.

**Rules:**
- Maximum 12 words per reply
- No "thank you so much!"
- No "haha"
- No "yes you got it!"
- No emojis except in specific cases (see below)
- Always lowercase except for movie names and proper nouns
- Italic phrasing OK (IG renders it via Unicode tricks — sparingly)

### Reply bank

| Situation | Reply |
|---|---|
| Correct guess | "yes. obviously." |
| Correct guess (witty phrasing) | "the way you wrote that. correct." |
| Confidently wrong | "no. but commit to the bit." |
| "Where can I play?" | "link in bio. no signup. go." |
| "Is this AI?" | "humans, sadly. caffeine is involved." |
| "Make more!" | "350 more in the bio. go." |
| "Make one for [movie]" | "logged. we'll see." |
| First-time commenter we want to keep | "good first guess. there are more." |
| Returning regular | "you again. correct." |
| Spoiler attempt before reveal | (delete, no reply) |
| Pile-on victim defending themselves | (pin their reply, hide pile-on) |
| Compliment ("this account is amazing") | "tell three people." |
| Hostile but not delete-worthy | (ignore) |

### When to use an emoji
- 🔥 only on BW posts, only when correct
- 🌿 only on TW posts, only when correct
- ✨ for a witty correct guess
- That's it. No 🙏, no ❤️, no 😂, no 🥰. The voice doesn't laugh at its own jokes.

---

## Edge cases

### "This is wrong, [different movie] fits better"
- If they're right (the plot legitimately fits two movies), pin their comment, write it as a future card variant, and reply: `"fair. logging it."`
- If they're wrong, reply once: `"watch [movie] again. with snacks."` Then ignore.
- Never argue twice. The thread will sort it.

### "Made by AI?"
- Answer **once per post** so it's on the record.
- Reply: `"humans write the cards. AI helps with typos. caffeine does the rest."`
- Subsequent identical questions on the same post: ignore. The first reply is now the answer.
- This question becomes more frequent over time. Do not get tired of it. The first reply is for the algo and the lurkers, not the asker.

### "You stole this from [other account]"
- Capture the screenshot. Check the other account.
- If they posted a similar card after we did: reply once, `"posted by us [date]. always welcome to do better."` Pin our reply, ignore further engagement.
- If they posted first: stop the thread, DM us internally, and decide whether to credit, take down, or rewrite. **Do not respond publicly until checked.**

### "This is offensive to [community]"
- See `docs/crisis-comms-playbook.md`. This is not a moderation question, it's a content question. Reply nothing on the comment until we've decided post-mortem.
- If multiple accounts say it, that's a signal. P2 minimum.

### Verified troll account piles on
- Hide their comment immediately
- If they reply 2+ times, block
- If their followers pile on, switch the post to "Limit Interactions" mode for 24h
- Document the troll handle in `moderation-log.md` and pre-block on related accounts

---

## The "do not engage" list

Fifteen phrases / patterns that mean engagement is wasted. If a comment matches any of these, ignore. Do not reply, do not pin, do not delete (unless slur-level).

1. "ratio"
2. "this is mid" (single instance — pattern signal only after 5+)
3. "bhakt" / "sickular" / "libtard" / "urban naxal" — slurs, delete
4. "imagine making a whole account about this"
5. "OP isn't even desi"
6. "this is why diaspora kids are like this"
7. "Bollywood is propaganda anyway"
8. "but [other movie] is better"
9. "why didn't you make one for [obscure regional film]" (passive-aggressive gatekeeping)
10. "the real desis watch [genre]"
11. "you'll never get the [region] movies right"
12. "AI generated trash" (after we've already replied once on the post)
13. "follow me back" / "F4F" / any follow request
14. Any comment that's just a string of emojis with no words
15. "first" / "early"

For #3, delete. For everything else, ignore.

---

## Weekly moderation review (15 min, every Sunday)

1. Open IG → Insights → Comments. Check volume vs. last week.
2. Scan the past week's deleted/hidden comments. Anything that should have been allowed? Anything that slipped through?
3. Update the Hidden Words list if new patterns emerged.
4. Review `moderation-log.md` for repeat offenders. Block any 3+ time offender.
5. Note 1-2 themes from the week's comments — they feed into next week's content. ("Three people guessed Sholay on every card" → make a Sholay-trap card.)

---

*Moderation is content strategy in disguise. Every reply, every pin, every delete is a signal to the algorithm and to the next viewer about what kind of room this is. Run the room.*
