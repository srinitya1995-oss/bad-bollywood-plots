# 2026-04-13 — Design Brainstorm Session Prototypes

18 HTML mockup files generated during the visual brainstorming session. Open any file directly in a browser to view. Each one was a swing in the design exploration; status notes capture the user's reaction.

## Validated direction
The **first editorial reset** (`editorial-magazine.html`) is the only design that got an explicit "FUCK I LOVE THIS" from the user. Everything after was iteration, ping-ponging, or rejection.

## Validated rules (saved to long-term memory)
- Editorial cream paper + Anton wordmark + Devanagari masthead (अंक १) + tomato accent — locked direction
- No Devanagari on game cards (only home masthead chrome)
- No "75 cards" / deck count on cinema buttons
- Card metaphors must be desi-fun, not Western magazine restraint
- Show dramatically different options, not subtle variants of the same idea
- Corner-stamp card composition has potential — meta as shape in corner, not as top/bottom rules
- Never push to prod without explicit per-action approval
- Default to design toolchain (`creative-ux-designer`, `refactoring-ui`, `web-typography`, `microinteractions`, `emil-design-eng`, `seedhaplot-visual-qa`) instead of vibes-mode

---

## File-by-file (chronological)

| # | File | What it was | Status / feedback |
|---|------|-------------|-------------------|
| 1 | `cobalt-jewel-variants.html` | 3 dark-bg cobalt variants (C1 indigo, C2 aubergine, C3 midnight) | Rejected — "lame and kiddish", variants too similar |
| 2 | `c3-full-fidelity.html` | C3 Midnight Cinema at full home + game + results fidelity | Rejected — "hate it" |
| 3 | `editorial-magazine.html` | **First editorial reset** — cream paper, Anton wordmark, Devanagari masthead, tomato accent, diagonal cards | **VALIDATED — "FUCK I LOVE THIS"** |
| 4 | `editorial-flavors.html` | 4 editorial flavors (A Tabloid, B Sepia, C Sticker, D Hoarding) | A/B/C had potential. D rejected. |
| 5 | `fragments-lab.html` | Wordmarks, cards, color triples, buttons, Devanagari treatments — deconstructed | Never explicitly reviewed |
| 6 | `card-metaphors.html` | 8 card metaphors: cinema ticket, polaroid, newspaper, library card, telegram, etc | Rejected — "artistically beautiful but not desi" |
| 7 | `home-grammars.html` | G1-G4 home compositions (centered, left-aligned, Swiss grid, asymmetric) | Skipped — user pulled toward card iteration |
| 8 | `desi-card-metaphors.html` | 8 desi metaphors: matrimonial, lottery, auto-rickshaw, Limca, sangeet, hoarding, Bollywood Queen, astrologer | Rejected — "very drab" |
| 9 | `loud-desi-cards.html` | Same metaphors with hot saturated color clashes (pink + emerald + chrome + cobalt) | Rejected — "too loud almost" |
| 10 | `tuned-desi-cards.html` | Same metaphors tuned to 3 colors max | Neutral — "very high quality work" but still over-busy |
| 11 | `simple-cards.html` | 4 cards radically simplified (label / clue / tap) | Rejected — "too simple now" |
| 12 | `simple-cards-front-back.html` | Same 4 with front + back paired | Hindi-on-cards rule established here |
| 13 | `composition-break.html` | 4 NEW compositions breaking the top/bottom-rule pattern (corner stamp, vertical spine, top heavy, medallion) | Corner stamp got mild positive signal |
| 14 | `cards-on-stage.html` | The 4 compositions placed inside their actual game stage with masthead + scoring buttons | Rejected — "still limited in design" |
| 15 | `experimental-cards.html` | 3 truly experimental compositions: comic strip panels, ransom-note collage, phone-SMS lock screen | Never reviewed (user pivoted to home redesign) |
| 16 | `home-redesign.html` | 3 home metaphors: newspaper front page, cinema marquee, sticker wall | Superseded by `home-five.html` |
| 17 | `home-five.html` | 5 home pages: newspaper, marquee, sticker wall, cassette J-card, Bollywood title card | Rejected — "umm hate them all - stop and think?" |
| 18 | `trading-card-systems.html` | 3 finished systems (1950s cigarette card / 80s cricket bubble gum / modern oracle) — each row = home + card front + card back | Rejected — "decent quality but not nice" |

## The pattern (what went wrong)

I produced 18 mockup files in 6 hours of pure vibes-mode without invoking a single design skill or visual-QA agent from the project's CLAUDE.md. Each rejection was qualitatively different (drab → loud → busy → simple → kiddish → not nice) because I was anchoring on metaphors and execution instead of the underlying brand feeling.

The user's "decent quality but not nice" diagnosis at the end was the most actionable: I was making *severe* design (vintage poster, cigarette card, cricket card, oracle deck) when they want **warm** design — the hand-painted Sakhi Saheli portrait + chai gathering side of the mood board, not the magazine cover side.

## Where to resume tomorrow

Pick one of two paths the user surfaced before pausing:
- **Path A:** Best-effort warm-mode HTML (round corners, peach + sage palette, hand-lettered type, generous spacing) — fakes warmth without real artwork
- **Path B:** Generate real hand-painted-style assets via image model first (woman holding card, chai gathering, courtyard scene), then build the brand around those

User has not picked yet.
