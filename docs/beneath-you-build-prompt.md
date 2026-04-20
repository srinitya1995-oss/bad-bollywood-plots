# Beneath You — Build Prompt for Claude Code

## WHAT IS IT

"Beneath You" is an interactive scroll experience — like [neal.fun/deep-sea](https://neal.fun/deep-sea/) but location-aware. You type ANY location on Earth, and it shows you what's beneath that specific spot as you scroll down — through soil, rock, fossils, underground rivers, caves, magma, and all the way to the Earth's core.

**For water locations:** It works like Deep Sea — showing ocean/lake/river creatures, shipwrecks, submarine depths, and then continues into the ocean floor, sediment, and Earth's crust below.

**For land locations:** It shows topsoil, root systems, buried artifacts, subway tunnels (if a city), aquifers, fossils at various depths, bedrock types specific to that region, tectonic plates, and down to the mantle and core.

The magic: **every location tells a different story.** Beneath Manhattan you find subway tunnels and 400-million-year-old schist. Beneath the Sahara you find ancient lake beds. Beneath Tokyo you find earthquake fault lines. Beneath the Mariana Trench you go deeper than anywhere else on Earth.

---

## THE PROMPT — Paste into Claude Code

```
Build "Beneath You" — an interactive scroll website where you enter any location on Earth, and scroll down to discover what's beneath that specific spot.

## THE EXPERIENCE

1. **LANDING:** A beautiful, minimal page. Center of the screen: a search bar with the prompt "Where are you standing?" and a subtle downward arrow animation. Background: a textured ground surface (soil, grass, pavement — changes based on location later).

2. **LOCATION INPUT:** User types a location (city, landmark, coordinates, anything). Use the Google Places API or Mapbox Geocoding to resolve it. Show the location name and coordinates.

3. **THE SCROLL BEGINS:** The page becomes a vertical infinite-scroll journey downward. As you scroll, a depth counter on the side shows how deep you are (in meters and feet). The background color gradually shifts:
   - 0m: Surface color (brown soil / blue water depending on location type)
   - 0-10m: Topsoil, roots, insects, buried objects
   - 10-100m: Deeper soil, foundations, subway tunnels, aquifers
   - 100-1000m: Bedrock, fossils, underground caves, mine shafts
   - 1-10km: Deep crust, temperature rising, specific rock formations
   - 10-100km: Upper mantle, partial melt zone
   - 100-2900km: Lower mantle
   - 2900-5100km: Outer core (liquid iron)
   - 5100-6371km: Inner core (solid iron, hotter than the sun's surface)

4. **CONTENT AT EACH DEPTH:** As you scroll past certain depths, illustrated items appear with short descriptions:
   - Creatures (earthworms, moles, deep cave fish, extremophile bacteria)
   - Human-made things (foundations, pipes, subway lines, mine shafts, bunkers)
   - Geological features (aquifers, fossils, fault lines, cave systems)
   - Temperature and pressure readings
   - Surprising facts ("At this depth, it's hotter than boiling water")

5. **LOCATION-SPECIFIC CONTENT:** This is what makes it special. Based on the location:
   - **New York City:** Show the 7 subway line at 55m, Manhattan schist at 80m
   - **Paris:** Show the Catacombs at 20m, limestone quarries at 35m
   - **Ocean locations:** Show marine life at various depths, then ocean floor, then continue into Earth
   - **Volcanic areas:** Show magma chambers closer to surface
   - **Desert:** Show ancient dried lake beds, sandstone layers
   - For MVP: Create a general template with depth-accurate geological data, plus 5-10 specific location overlays

6. **WATER LOCATIONS:** If the location is over water (ocean, lake, river):
   - Start with the water surface, show marine life as you descend (like neal.fun/deep-sea)
   - Show depth of that specific body of water
   - When you hit the seafloor/lakebed, transition to geological layers
   - Continue the journey through Earth's crust, mantle, core

## INTERACTION DESIGN

- **Scroll-driven:** Everything is controlled by scroll. No clicking through pages.
- **Depth counter:** Fixed on the right side, always visible. Shows current depth in meters.
- **Items appear:** As you scroll past their depth, items slide in from left or right with a subtle fade. Like reading a vertical timeline.
- **Background gradient:** Continuously shifts color to represent depth — brown → dark brown → grey rock → orange-red (hot) → yellow-white (core)
- **Parallax:** Items at different "distances" scroll at slightly different speeds. Nearby items scroll faster, far-away geological features scroll slower.
- **Scale indicator:** Show comparisons ("You are now deeper than the Eiffel Tower is tall", "This is the depth of the deepest mine on Earth")

## VISUAL DESIGN

- **Clean, editorial:** White/cream text on dark backgrounds as you go deeper
- **Illustrated style:** Items should be illustrated, not photographic. Think: scientific illustration meets infographic. Flat, detailed, warm.
- **Typography:** One beautiful serif for facts/headings (like Playfair Display or Libre Baskerville), one clean sans for measurements/data (like Inter or DM Sans)
- **The depth counter:** Monospace font, subtle glow, always readable
- **Color journey:**
  ```
  Surface:    #8B7355 (warm brown earth) or #1B6B8A (ocean blue)
  Shallow:    #5C4A3A (dark soil)
  Deep:       #3A3A3A (grey rock)
  Hot zone:   #8B3A1A (warm orange-red)
  Mantle:     #CC4422 (deep red-orange)
  Outer core: #FF8C42 (molten orange)
  Inner core: #FFD700 (bright golden yellow)
  ```

## TECH STACK

- **Next.js** (React, SSR for SEO)
- **Tailwind CSS** for styling
- **Framer Motion** for scroll-triggered animations
- **Intersection Observer** for triggering content as you scroll
- **Mapbox Geocoding API** or **Google Places API** for location resolution
- **A data layer:** JSON files for each featured location + a generic geological layer template
- **Vercel** for hosting (free tier works)

## DATA ARCHITECTURE

```
data/
├── geological-layers.json     # Universal layers (mantle, core, etc.)
├── generic-land.json          # Default land content at various depths
├── generic-ocean.json         # Default ocean content (marine life by depth)
├── locations/
│   ├── new-york.json          # NYC-specific content
│   ├── paris.json             # Paris-specific content
│   ├── mariana-trench.json    # Deepest ocean point
│   ├── tokyo.json             # Earthquake-prone area
│   ├── sahara.json            # Desert geology
│   ├── iceland.json           # Volcanic activity
│   ├── london.json            # Underground/Tube
│   ├── mumbai.json            # Coastal geology
│   ├── grand-canyon.json      # Exposed geological layers
│   └── yellowstone.json       # Supervolcano
├── creatures.json             # Underground/deep sea creatures
└── facts.json                 # Surprising depth comparisons
```

## PROJECT STRUCTURE

```
beneath-you/
├── app/
│   ├── page.tsx              # Landing page with search
│   ├── explore/[location]/
│   │   └── page.tsx          # The scroll experience
│   └── layout.tsx
├── components/
│   ├── SearchBar.tsx         # Location input
│   ├── DepthCounter.tsx      # Fixed depth display
│   ├── DepthItem.tsx         # Individual item at a depth
│   ├── BackgroundGradient.tsx # Color shift based on depth
│   ├── ScaleComparison.tsx   # "Deeper than the Eiffel Tower"
│   └── LocationHeader.tsx    # Shows resolved location info
├── data/                     # All JSON content files
├── lib/
│   ├── geocoding.ts          # Location resolution
│   ├── depthEngine.ts        # Merge generic + location-specific content
│   └── colorScale.ts         # Background color interpolation
├── public/
│   └── illustrations/        # SVG illustrations for items
└── package.json
```

## BUILD PHASES

### Phase 1: The Scroll Engine
- Next.js project setup
- The vertical scroll with depth counter
- Background color gradient that shifts with scroll depth
- Generic geological layers (surface → crust → mantle → core) with placeholder content
- Items appearing at correct depths via Intersection Observer
- Test: scroll from 0 to 6371km, see depth counter, background shifts

### Phase 2: The Content
- Populate generic-land.json with 40-50 items at accurate depths
- Populate generic-ocean.json with marine life at accurate depths
- Add creatures, human artifacts, geological features, temperature/pressure data
- Add scale comparisons ("You're now deeper than...")
- Surprising facts every 500m or so
- Test: rich content appears throughout the journey

### Phase 3: Location Awareness
- Integrate Mapbox Geocoding API
- Landing page with beautiful search bar
- Detect if location is land or water
- Load location-specific JSON overlays
- Build 5 featured locations: NYC, Paris, Mariana Trench, Mumbai, Yellowstone
- Merge location-specific + generic content at correct depths
- Test: different locations show different content

### Phase 4: Polish
- Illustrated SVG items (commission or source from Noun Project / Undraw)
- Parallax depth effect
- Smooth animations (items sliding in)
- Mobile optimization (touch scroll)
- Social sharing ("I scrolled to Earth's core beneath Mumbai")
- SEO: meta tags, OpenGraph images per location
- Performance: lazy load items, virtualize long scroll

### Phase 5: Ship
- Deploy to Vercel
- Custom domain
- Analytics (PostHog)
- 5 more featured locations
- Submit to Product Hunt, Hacker News, Reddit r/InternetIsBeautiful

## START WITH PHASE 1. Build the scroll engine with the depth counter and background gradient first. Use placeholder content. I want to see the core mechanic working before we add real data.
```

---

## SUPPLY CHAIN

### Domain
Buy: `beneathyou.com` or `beneath.earth` or `whatsbeneath.com`
Where: Namecheap or Cloudflare Registrar (~$10-15/year)

### Hosting
Vercel (free tier) — perfect for Next.js. Auto-deploys from GitHub.

### APIs
- Mapbox Geocoding: Free tier = 100,000 requests/month (more than enough)
- Alternative: OpenCage Geocoding (free tier = 2,500 requests/day)

### Analytics
PostHog (free tier) — track which locations people search, how deep they scroll, where they stop.

### Illustrations
- Noun Project (SVG icons for creatures/objects)
- Undraw (free illustrations)
- Or: commission a small set of custom illustrations on Fiverr ($50-100 for 20 items)

### Total Cost
```
Domain:          $12/year
Hosting:         $0 (Vercel free)
Geocoding API:   $0 (Mapbox free tier)
Analytics:       $0 (PostHog free)
Illustrations:   $0-100 (Noun Project free, or Fiverr commission)
────────────────
Total:           $12-112
```

### Skills/Agents for Claude Code
```bash
# The creative-designer agent you already have works here too
# Additional useful skills:
/plugin install frontend-design    # React/Next.js patterns
/plugin install designer-skills    # Visual design
```
