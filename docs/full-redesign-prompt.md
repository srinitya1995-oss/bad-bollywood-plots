# Bad Plots — Full Website Redesign

Paste this into Claude Code terminal as one prompt.

---

## THE PROMPT

```
You are redesigning the entire Bad Plots website — every screen, every interaction, every pixel. Not a tweak. A ground-up visual redesign.

Your primary design reference is inspiration/01b2f5327d44d84d7a4b07eaeacb0487.jpg — the desi living room gathering illustration. Study it deeply before doing anything.

## PHASE 0: EXTRACT THE TRUTH FROM THE IMAGE

Before writing any code, do this work and show me the output:

### A. PALETTE EXTRACTION
Look at inspiration/01b2f5327d44d84d7a4b07eaeacb0487.jpg pixel by pixel. Extract the REAL colors — not what you think they are, what they ACTUALLY are:
- The dominant turmeric/marigold yellow (the kurtas, the chai, the brass)
- The terracotta pink (the walls, the sarees)
- The sage green (the plants, the teal kurta)
- The warm cream (the floor, the rug, the thali)
- The muted coral/salmon (some kurtas)
- The darkest value (the hair — it's dark brown, NOT black)
- The lightest value (the window light — it's warm white, NOT cold white)

Write out exact hex values. This becomes the new palette. Throw away the old #BC392B / #1B6B45 palette.

### B. STYLE ANALYSIS
Describe the illustration style in detail:
- Outline weight and color (thin, slightly darker than fill, never black)
- Fill style (flat but with subtle texture, like watercolor on textured paper)
- How depth works (overlapping objects, NOT shadows or gradients)
- How density works (every inch has something, but organized into zones)
- Color temperature mapping (warm center, cool edges)

### C. RUN THE IMAGE CURATION PROTOCOL
Go through EVERY image in ./inspiration/ folder. For each one:
- What is it?
- What's its role? (composition ref / fragment source / color ref / texture / hero / don't use)
- If using: where, what crop, what opacity, WHY?
- Write the full placement blueprint before any code

## PHASE 1: THINK LIKE THREE PEOPLE

For every screen, think as three people:

**THE CUSTOMER** — "I'm at a party, someone pulls out their phone, we're about to play. What do I see? What makes me excited? What confuses me? What takes too long?"

**THE DESIGNER** — "Does this feel like the living room illustration? Is every element placed with intention? Does the eye flow naturally? Is there breathing room AND density?"

**THE PRODUCT OWNER** — "Does the home screen convert to game starts? Is the game loop tight? Do people want to share their score? Will they come back tomorrow?"

Write out your thinking for each screen from all three perspectives BEFORE designing it.

## PHASE 2: THE SCREENS

### SCREEN 1: HOME

The home screen should feel like you just walked into the room in that illustration. Not a landing page. Not a poster. A ROOM you want to sit down in.

**Layout concept:** The warm cream/tan surface IS the page. The title sits naturally in the space, like a board game box on the floor. The category buttons (Bollywood/Tollywood) are like game pieces or cards laid out on the rug. The ornamental frame is the room's borders — the plants, the shelves, the cushions — translated into decorative elements.

**What to rethink:**
- The title treatment: "BAD Plots" should feel hand-lettered, warm, like it belongs in this room — not a movie poster shouting at you
- The category buttons: keep the card shape and the red/green identity BUT use the NEW extracted palette (the reds and greens from the illustration, not the old high-contrast ones)
- The Party/Solo toggle: should feel like two cushions you choose between, not a clinical toggle switch
- The footer: "Suggest a movie · Feedback · @Srinitya" should feel like a note scribbled on the bottom of a board game box

**Decoration from inspiration images:**
- Use the Image Curation Protocol. Place fragments with PURPOSE.
- The ornamental frame from the Ludo board (inspiration/90c874f213e35acb5ca36e7ba6529a0f.jpg) — but adapted to this warmer palette
- Subtle chai glass, playing card, or snack accents — BUT each one has a documented reason for its position
- NO random scatter. If you can't say WHY an element is where it is, delete it.

### SCREEN 2: PLAYER SETUP (bottom sheet)

"Who's playing?" sheet. Currently it's a plain white sheet.

**Rethink:** This is the moment everyone's gathering around. Make the sheet feel like a handwritten guest list or a score card from a carrom board. The "Add player" button should feel inviting, like scooting over to make room. Player names could have small color tokens next to them — like the colored game pieces in Ludo.

### SCREEN 3: THE GAME SCREEN

This is where players spend 90% of their time. The card flip is the core mechanic — KEEP IT, but make it feel like flipping an actual playing card on that warm table surface.

**The card:**
- KEEP the flip animation — it works
- KEEP the glow (Bollywood red glow, Tollywood green glow) — but shift to the softer extracted palette colors
- The card front: the plot description. Should feel like reading from a hand-painted card, not a UI component. Think: the font, the spacing, the border treatment. Like a tarot card or a beautifully printed game card.
- The card back: the movie answer + "Did you know" fact. The reveal should feel satisfying — like turning over a card and seeing the art on the other side
- Card border/frame: use an ornamental border inspired by the Ludo board edges, not a plain CSS border-radius

**Around the card:**
- Progress bar → rethink as a visual metaphor. Instead of a progress bar, what about chai glasses filling up? Or cards in a dealt hand? Or a film reel unwinding? Something that belongs in this visual world.
- "Got it" / "Missed" buttons → these need to feel like game actions, not form submits. Big, satisfying, with color feedback. "Got it" in the warm marigold/gold. "Missed" in a soft muted tone (not harsh red for wrong).
- The game header (exit, progress, score) → should feel like the top edge of a game board, not a navigation bar

**Lives (endless mode):**
- Currently three dots. Rethink as three chai glasses (full → empty as you lose lives), or three playing cards face-up that flip face-down when lost, or three diyas that go out.

### SCREEN 4: RESULTS — COMPLETELY RETHINK THIS

The results screen is where you need the most creative rethinking. Currently it's: "Game Over" title, three stat numbers, a verdict quote, leaderboard, replay button. Functional but forgettable.

**Think like the customer:** I just finished playing with friends. What do I FEEL? I want to celebrate or groan. I want to compare. I want to screenshot and share.

**Think like the designer:** This should be the most visually memorable screen. It's what people screenshot. It should look like something you'd post on Instagram.

**Think like the product owner:** This screen drives replay ("Play again") and virality ("Share score"). Both need to be irresistible.

**Rethink ideas:**
- Instead of three stat boxes, show the score as a REPORT CARD or FILM CERTIFICATE — like those parody certificates people make. "This certifies that [Player Name] correctly identified 8 out of 12 Bollywood films from their worst descriptions."
- The verdict could be a FILM RATING — like a review card. "★★★★☆ — Not bad, but you confused DDLJ with K3G. We're judging you."
- For multiplayer: instead of a plain leaderboard table, show players as characters sitting in the room, sized by their score. Winner is in the center (where the guitar player is in the illustration). Or show them as a podium, but designed like stacked cushions.
- The share button should generate something that LOOKS beautiful — a shareable card with the ornamental border, the score, a witty one-liner. Something people actually want to post.
- "Play again" should feel like someone refilling your chai cup — warm, inviting, "one more round?"

### SCREEN 5: FEEDBACK SHEET

Currently a generic form. Make it feel like writing a note to the game creators — handwritten paper energy. The tag buttons (Love it, Needs work, etc.) could be styled like stamps or stickers you slap on.

### SCREEN 6: SUGGEST A MOVIE SHEET

"We'll write a terrible plot description for it" — this is charming. The form should feel like filling out a postcard or a voting slip. The submit button could say "Drop in the suggestion box" instead of just "Submit."

## PHASE 3: INTERACTION DESIGN

### Page transitions
Screens shouldn't just toggle visibility. They should feel like turning pages of a book, or flipping over a game board. A warm crossfade with a slight scale shift.

### The card flip
Keep the 3D flip. But add:
- A subtle paper sound effect indication (CSS animation that mimics the snap of a card)
- The card should have a very slight wobble when it lands (like it was tossed on a table)
- The glow on hover should pulse gently, like candlelight

### Touch/click feedback
Every button press should have a PHYSICAL feel — a slight scale-down (0.96) then spring back. Like pressing a real button. Use cubic-bezier(0.34, 1.56, 0.64, 1) for the bounce-back.

### Loading states
If cards are loading, show a shuffling animation — cards flipping and rearranging, not a spinner.

## PHASE 4: BUILD

Now build it. Update index.html and style.css (and app.js if needed for new interactions).

**Rules:**
- Use the extracted palette from Phase 0, not the old colors
- Every decorative image placement must have a WHY in a comment
- Keep all existing functionality — the game logic, analytics, PWA, accessibility
- Mobile-first: design for phone, then adapt up
- The ornamental frame/border should be visible and proud, not ghosted
- Background texture: add a subtle paper grain (CSS noise or a real texture image at very low opacity)
- All clip-paths should use organic shapes (circles, arches, diamonds) not rectangles
- Test: take a screenshot and compare to the living room illustration. Same warmth? Same density? Same feeling of "I want to be in this room"?

Save the redesigned files. Show me the palette extraction, the three-perspectives analysis, and the placement blueprint before showing me the code.
```
