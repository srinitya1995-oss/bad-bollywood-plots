# Bad Desi Plots — Card Voice Rubric

Canonical definition of the humor, voice, and tone for every card. Every new card and every audit uses this doc.

**The one-sentence rule:** *specific-wrong beats vague-true.* A good bad plot cites a verifiable fact from the movie, framed in a register that drains the drama.

---

## The 6 humor registers (pick ONE per card)

| # | Register | What it does | Example |
|---|---|---|---|
| 1 | Mundane reduction | Strip epic scale, describe like errands | Lagaan: *"Villagers bet the farm on a sports tournament."* |
| 2 | Scale flip | Describe a world-shaking event as a family squabble | Baahubali: *"Cousin causes family drama over throne."* |
| 3 | Deadpan literal | Describe metaphor-heavy moment too literally | DDLJ: *"Boy chases train. Girl runs for it."* |
| 4 | Wrong emphasis | Make a side character / detail the star | 3 Idiots: *"A parrot delivers a commencement speech."* |
| 5 | Cultural deadpan | Treat desi tropes as novelty | K3G: *"Son comes home for dinner. Dad cries for 3 hours."* |
| 6 | Sardonic anti-climax | Describe climax as trivial | Deewaar: *"Two brothers grow up. Police vs smuggler. Mom has a favorite."* |

Per card, pick ONE register. Mixing = tonal dissonance = fail.

---

## The 5 failure modes (auto-reject)

1. **Vague-generic** — could describe 100 films ("Father is proud. He moves next door.")
2. **Cryptic-too-clever** — requires watching the movie to parse ("The stone cries")
3. **Lazy synonymy** — renamed characters, no wit ("Rahul and Anjali fall in love")
4. **Forced meme** — verbatim iconic dialogue in the clue (gives it away)
5. **Spoiler-without-punchline** — reveals the ending with no comic angle

---

## The specificity anchor rule

Every clue MUST contain at least ONE detail that uniquely locks to this movie. "Detail" means: a specific object, profession, location, relationship, or event that appears in this film and would rarely appear in the same combination in another film in the deck.

- Bad: "Brothers fight" (applies to 50+ films)
- Bad: "Two brothers fight" (still 30+)
- Good: "Two brothers split a gold bar in a dockyard warehouse" (Deewaar)
- Good: "A cousin with a spear challenges a cousin with a sword for the throne of a fictional kingdom" (Baahubali)

If you strip the anchor, the card should no longer identify the film. If stripping it still leaves a unique card, the anchor wasn't pulling its weight — rewrite.

---

## The reduction dial

- **0% reduction** = Wikipedia plot summary. Not funny.
- **50% reduction** = Narrative softened, anchor preserved.
- **60% reduction** = **Sweet spot.** Scale stripped, one anchor detail visible.
- **80% reduction** = Meme-thin. Clever but barely cites the movie.
- **100% reduction** = Only the punchline. Unguessable.

Ship at 60 ±10%.

---

## The aloud test (gate before card ships)

Read the clue to a person who hasn't seen the movie:

| Their reaction | Verdict |
|---|---|
| Guesses correctly within 30s | **Landed** (easy/medium tier) |
| Guesses confidently wrong | **Too generic** — recalibrate anchor |
| Shrugs, no guess | **Too cryptic** — add a harder anchor |
| **Laughs before guessing** | **Sweet spot** |

---

## Structure constraints (per 50-card chunk)

- ≥5 short-sentence cards (≤8 words)
- ≥5 long-sentence cards (15+ words)
- ≥3 question-format cards
- ≥3 list-format cards ("Village. Cricket. Empire.")
- ≤50% single register (don't let "mundane reduction" dominate)

---

## The aunty test (human sample gate)

Imagine the clue at a Diwali table. Stranger-aunty either:
- Smiles and says "oh this one!" → card lands
- Shrugs and eats a samosa → card fails

If you can't see aunty smiling, rewrite.

---

## Forbidden

- Slurs (caste / religion / regional / gender / orientation) — even in "bad plot" framing
- Glorifying violence against women, children, or animals as a punchline
- Verbatim famous dialogue from the movie
- Words from the movie's title in the clue
- Intentionally misgendering or deadnaming real people
- Jokes that punch down (the object of the joke is the character/movie, never a group)

---

## Tag per card

Every card in `cards.json` gets a new field:

```json
{
  "id": "bw-023",
  "voice_register": "mundane_reduction" | "scale_flip" | "deadpan_literal" | "wrong_emphasis" | "cultural_deadpan" | "sardonic_anti_climax",
  "anchor": "string — the unique detail that locks to this film",
  "reduction_pct": 40-80
}
```

The card auditor checks these fields exist and are consistent.

---

## Workflow when this doc changes

1. Update this doc with your rule change
2. Run `seedhaplot-card-auditor` on the full deck
3. Re-score every card against new rules
4. Flag regressions, rewrite
