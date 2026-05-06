# Reel Motion Vocabulary Spec — Bad Desi Plots

> Source-of-truth for every Reel cut on @baddesiplots. If a Reel violates a rule here, it doesn't ship.

---

## 1. Timing primitives

All timings derived from the app's card-flip spec (per `CLAUDE.md` §3 — validated by user testing — never change).

| Beat | Duration | Easing | Notes |
|---|---|---|---|
| Card flip | **0.40s** | `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot) | Front → back, 3D Y-axis rotation. Identical to in-app card flip. |
| Text-in (slide + fade) | **0.30s** | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) | Text slides up 18px and fades from 0 → 1 opacity. Body cap text only. |
| Reveal slam (gold name appears) | **0.15s** | `cubic-bezier(0.7, 0, 0.84, 0)` (ease-in-quart) | Title scales 1.18 → 1.0 with a 0.04s overshoot kick. The slam IS the moment. |
| Punch frame (narrator beat) | **2 frames @ 30fps = 0.067s** | linear | Single white-flash frame inverted to bg color. Use sparingly — max 2 per Reel. |
| Caption swap | **0.20s** | linear | Crossfade between caption stack lines. |
| End-card hold | **1.20s** | n/a | The watch-all-5 / link-in-bio frame must hold for at least 1.2s before loop. |
| Loop tail | **0.40s** | linear | Loop seam fades end-card → first frame at 40% opacity to avoid hard cut. |

**Rule of three:** never use more than three motion primitives in a single Reel. Pick a flip, a slide-in, and a slam — that's the ceiling.

---

## 2. Card flip choreography

The defining motion. Three flavors:

### a. The deal-flip (5-card flipper Reels)
- Start: card stack arrives from above with a 0.30s drop + 0.10s settle bounce.
- Flip cadence: card 1 flips at t=0.5s. Subsequent cards every 0.9s.
- Each flip is a full 0.40s overshoot rotation, with a 0.05s hold at 90° (the "freeze" mid-flip) for dramatic effect.
- Exit: after 6th card (the outro card) settles, hold 1.2s, fade to end-card.

### b. The single-card flip (dramatic narration Reels)
- Single card centered, narrator voiceover reads the bad plot.
- On the punchline word (designer marks the timestamp), card flips.
- Movie name slams in 0.10s after card hits 0° (back face up).
- The slam is paired with the signature SFX (see §5).

### c. The split-card flip (reaction split Reels)
- Two cards side-by-side. Left flips at t=0, right flips at t=0.6s.
- Used for "BW or TW?" style content — same timing as Template D static.

---

## 3. Text-in transition system

Used for kinetic captions, hook text, score counters.

```
@keyframes text-in {
  0%   { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
}
/* duration: 0.30s; easing: cubic-bezier(0.16, 1, 0.3, 1); */
```

### Caption stack rules
- DM Sans Bold caps, font-size 56px (Reel composition), letter-spacing +0.02em.
- Color: `--cream` on a `rgba(26,15,10,0.86)` band (paper-tinted bg, never pure black).
- Band has a 1px gold rule top + bottom at 50% opacity.
- Max **6 words per caption** on screen at once. If the line is longer, break it.
- Captions stack from bottom up. New caption pushes old caption out the top.
- Captions live in the upper 40% of the Reel — never in the bottom 20% (IG UI bar).
- Caption duration: 1.4–2.0s. Never less than 1.4s (unreadable) or more than 2.4s (slow).

---

## 4. Punch frames + reveal slam

The two cinematic devices. Use sparingly. They're the orchestral hits.

### Punch frame
- A single 2-frame inverted-color flash, used to punctuate a beat.
- Color: `--cream` (not white) flash on `--bg` for 0.067s.
- Use cases: just before the card flip back face is shown (build tension), or on the answer word in the narrator script.
- **Hard cap: 2 per Reel.** More than that is migraine territory.

### Reveal slam
- The single most important motion in the system.
- The movie name (Playfair 700, gold, ~140px in Reel composition) starts at scale(1.18), opacity 0.
- Animates over 0.10s to scale(1.0), opacity 1, with a 0.04s overshoot to scale(0.98) then back to 1.0.
- Paired with the signature SFX hitting on the slam frame.
- Background gold halo pulses at the same beat: 0.15s glow ramp from 0% → 100% intensity.

---

## 5. Signature SFX — the audio handshake

We pick **one** sonic identity that becomes the punctuation. Every reveal uses this same SFX. Recognizable in 0.4 seconds, even with sound off muscle memory.

### Recommendation: **HARMONIUM STING**

A short (0.6s), single-chord harmonium drop — the kind you hear in a 1970s Bollywood scene change. Low-mid register, slightly detuned, ending on an open chord.

**Why this over the others:**

| Option | Pros | Cons |
|---|---|---|
| **Harmonium sting** | Instantly Indian-cinema. Works on any genre of card (BW/TW). Sits in the mid-range — won't fight with VO or background score. Distinctive but not novelty. | Requires a clean source recording. |
| Drum hit (dhol/tabla) | Punchy, percussive, attention-grabbing. | Genre-locked — feels too "north Indian wedding," not great for TW reveals. Easy to mistake for stock SFX. |
| Shehnai blast | Maximalist, theatrical, very on-brand for haveli energy. | Too celebratory for jokes — every reveal feels like a wedding announcement. Loses meaning fast. |
| Thali clang | Specific, memorable, novelty. | Novelty wears off in 3 weeks. Doesn't survive at low volume. |

**The harmonium does the dramatic-with-restraint thing the card voice does.** It's the audio equivalent of the dry, cinematic, slightly unhinged register.

### Implementation
- File: source a CC-licensed harmonium chord OR commission a 5-chord variant pack.
- Variants: 3 chord pitches (low / mid / high). Use lower for hard difficulty cards, higher for easy. Subtle, but adds richness across a feed of Reels.
- Length: 0.6s including a 0.15s tail.
- Mix: -6 dB under VO. Always under, never on top.

### Backup punctuation (use sparingly)
- A single tabla "tak" hit (0.12s) as a comma between caption beats. Use 2–3 per Reel maximum.

---

## 6. The 5 motion templates

Each Reel template variant gets a one-line motion signature.

| Variant | Signature motion | Duration | Notes |
|---|---|---|---|
| Dramatic narration | Single-card flip + reveal slam on punchline word | 18–22s | Lowest-effort, highest-output. Default Reel. |
| 5-card flipper | Deal-flip into 5 sequential card flips | 35–45s | One Reel, five cards. Best save-bait. |
| Reaction split | Two-up split-card flip + audience reaction overlay | 12–15s | Used for the BW vs TW vote format. |
| Decoder challenge | Card flip in pieces (top quarter, then bottom quarter, then full reveal) | 20–25s | Higher-effort. Reserve for hard-difficulty cards. |
| Family WhatsApp parody | Card flip with overlay chat bubbles sliding in (0.30s text-in each) | 15–18s | Caption-heavy. Bubbles use cream-tinted band per §3. |

---

## 7. What NOT to do

- **No more than 3 motion primitives per Reel.** If the cut needs a fourth, the cut is too busy.
- **No Ken Burns / continuous zoom on cards.** Cards flip. They don't drift. Drift is for Vimeo wedding videographers.
- **No glitch transitions.** Card voice is dry, not chaotic. Glitch reads as TikTok 2019.
- **No emoji in the captions on canvas.** Save emojis for the IG caption text. The visual stays serif.
- **No Bhangra-track default loop.** Pick the harmonium sting. Background music should always be sub-mixed, not a sync.
- **Never place text in bottom 20% (384px on 1920).** That's the IG UI bar. Watermarks sit there expecting to be partially masked — that's fine.
- **No flash duration > 0.07s.** Migraine territory. Keep punch frames tight.

---

## 8. Open questions (Day 4+)

1. **Harmonium source:** commission a custom 5-chord pack vs. license one? (Custom is ~$200, but bulletproof IP-wise.)
2. **Captions burned-in vs IG sticker:** burn-in for permanence + brand voice; IG stickers for accessibility (auto-translated). Recommend burn-in primary, IG-sticker overlay for the Hindi/Telugu transliteration moments.
3. **Loop seam treatment:** plain 40% crossfade vs. a single-frame mehendi medallion wipe. Lean toward plain — the wipe is novelty, novelty fades.

---

*Last updated: 2026-04-29 (Day 2-3). Next review: after 5 Reels are produced and we have actual data.*
