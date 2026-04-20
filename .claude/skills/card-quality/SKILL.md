---
name: card-quality
description: Card content validation — new cards, card edits, content audit, pre-ship
---

## Triggers
New cards added, card edits, content audit, pre-ship.

## Pipeline

### 1. STRUCTURAL VALIDATION
- Parse cards.json
- Every card has: id, clue, movie, year, industry (bw/tw), difficulty (easy/medium/hard), funFact
- No duplicate IDs
- No duplicate movies (same movie can't appear twice)
- ID format: {industry}{number} (e.g., bw01, tw42)

### 2. DIFFICULTY DISTRIBUTION
- Per industry: roughly equal easy/medium/hard split
- Flag imbalances > 20%

### 3. CLUE QUALITY (per design spec rules)
- Every clue has at least one detail UNIQUE to this film
- Sentence patterns vary (not all "Short. Sardonic. Punchline.")
- Sardonic tone in ~40% of clues, not 80%
- Hard clues have MORE detail, not less (lesser-known films need more info)
- Flag generic clues that describe 10+ films

### 4. KNOWN BROKEN CARDS
- Cross-reference against broken cards list: bw52, bw72, bw74, bw75, tw54, tw55, tw72, tw75
- If any still exist → P0 blocker

### 5. DEDUP CHECK
- Check sessionDealt logic in deckBuilder.ts
- Check cross-session history (localStorage sp_seen)
- Verify pool-exhaustion reset logic
