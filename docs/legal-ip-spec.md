# Legal / IP Spec — Bad Desi Plots

> Last updated: 2026-04-20. Canonical legal, copyright, and compliance posture.
> Companion docs: `product-spec.md`, `design-spec.md`,
> `system-architecture-spec.md`, `engineering-spec.md`,
> `applied-scientist-spec.md`, `growth-spec.md`,
> `content-editorial-spec.md`.

---

## 1. Disclaimer

This document is the project's working legal posture, written by a non-lawyer
for a non-commercial hobby product. It is not legal advice. If the product
scales to meaningful traffic or generates any revenue, consult an IP attorney
with entertainment + trademark expertise in India and the author's jurisdiction
before continuing.

## 2. Product positioning for legal purposes

- **Name:** Bad Desi Plots
- **Type:** Free, ad-free, no-account web app (PWA)
- **Content:** Short (1–3 sentence) hand-written plot descriptions of films, plus film name and release year
- **Business model:** None. No revenue, no ads, no in-app purchases, no data sale
- **Author:** Individual hobbyist
- **Hosting:** Netlify (US)
- **User data:** None stored beyond anonymous analytics events + optionally-submitted feedback text

The product's value proposition is editorial commentary (parody + comic
summarization) on film plots, not reproduction of film content.

## 3. Copyright position

### What we use
- **Film names and release years** — factual metadata, not copyrightable
- **Short prose summaries** — original expression written by the author, commenting on each film
- **Broad factual details** (genre, setting, cast hint) — again, factual, not copyrightable in expression

### What we don't use
- Movie posters or still images
- Trailers, clips, or any audio/video
- Verbatim dialogue or lyrics from the films
- Screenplay excerpts
- Character names beyond generic or already-factual references (e.g., "Rahul" or "Simran" as cultural placeholders)
- Copyrighted artwork of any kind

### Fair use / fair dealing argument
The summaries are **editorial commentary and parody** — specifically, exaggerated comic reductions of film plots for entertainment purposes at a trivia game. Elements that support fair use / fair dealing:

1. **Transformative use** — the clues don't substitute for the films; they comment on them comically
2. **Non-commercial** — no revenue derived
3. **Minimal substantiality** — a 1–3 sentence clue does not replicate the films' creative expression
4. **No market harm** — a trivia game about films does not depress film revenue; if anything, it drives interest

Under Indian Copyright Act Section 52 (fair dealing) and US Copyright Act
Section 107 (fair use), short comic summaries for trivia purposes are
defensible. But defensibility is not the same as guaranteed safe; see §9 for
the takedown posture.

### Authority risk
If a studio decides to contest, even a weak IP claim can force a takedown for a
hobbyist with no legal budget. The only viable response is to comply promptly
(see §9).

## 4. Trademark position

### "Bollywood" and "Tollywood"
- Both are genre descriptors, not trademarks of a single entity
- Used descriptively in card classification + UI copy
- Not used as a trademark for the product itself (the app is "Bad Desi Plots," not "Bollywood Trivia")

### Film titles
- Used as factual identification (the card's answer)
- Not displayed as logos, stylized lockups, or trademark indicators
- No confusion risk because we're not offering a competing film-adjacent service

### Our product name
- **"Bad Desi Plots"** — product branding
- **"Seedha Plot"** — internal / development name
- Neither is currently registered as a trademark
- If growth justifies it, register "Bad Desi Plots" as a word mark in India + US (roughly $200–500 in filing fees)

## 5. Right of publicity (personality rights)

### Real people referenced
Actor names are not displayed on cards. The `f` (fact) field on the card back sometimes mentions an actor in passing ("Rajinikanth's comeback vehicle featured Mohanlal…"), but the references are descriptive and factual.

### Risk surface
- Under Indian personality rights jurisprudence (notably Anil Kapoor v Simply Life India, 2023), unauthorized commercial use of an actor's likeness is actionable
- Our use is non-commercial + descriptive-factual, placing it outside the core prohibition
- Still: never use an actor's name as a headline, punchline, or in a way that implies endorsement

### Guardrails
- Don't put an actor's name in a card's clue (`c` field) without a voice rubric pass
- Don't use actor images or likenesses anywhere in the app
- Don't imply any actor has participated in or endorsed Bad Desi Plots

## 6. User-generated content

### Feedback + suggestions
Users can submit:
- Thumbs up/down + optional free-text feedback (stored in Supabase `feedback`)
- Movie suggestions (stored in Supabase `suggestions`)
- Card reports (stored in Supabase `reports`)

### Moderation posture
- No pre-publication moderation — content is stored, not displayed in-app
- Author reviews submissions weekly
- Any submission containing slurs, threats, PII, or off-topic spam is deleted on review
- Any suggestion or feedback referencing an unreleased or unannounced film is declined

### User agreement
- No formal ToS or privacy policy at v2.1.0 — low audience + no PII + no monetization
- If audience scales past 10K monthly users, publish a minimal privacy policy + ToS (see §10)

### DMCA / takedown process
See §9.

## 7. Data privacy

See also `applied-scientist-spec.md` §10 and `system-architecture-spec.md` §11.

### PII collected
- Optional user-entered feedback text (may contain names, emails if users volunteer them)
- Movie suggestion text (low PII risk)
- Card report reason text (low PII risk)

### PII not collected
- Real names (player names are local-only)
- Email
- Phone
- Location beyond timezone inferred from browser locale
- Cross-site tracking data

### PostHog events
- Anonymous distinct-ID per browser
- No IP stored beyond PostHog's default 30-day retention
- Respects browser Do Not Track (configured in `analytics/posthog.ts`)

### GDPR / UK GDPR posture
- We don't meet the "establishment in the EU" or "targeting EU" thresholds directly, but diaspora users in EU jurisdictions are possible
- Minimal data collection reduces risk
- If EU audience becomes significant (>5% of users based on PostHog geo):
  1. Publish a privacy policy
  2. Add a cookie / analytics consent banner
  3. Implement a data deletion endpoint (delete Supabase rows on user request)
  4. Register as a controller if required

### CCPA posture
- Similar to GDPR; low audience + minimal PII keeps us below thresholds
- If California audience becomes significant, publish a "Do Not Sell My Personal Information" link (we don't sell any) and a minimal privacy policy

### COPPA posture
- Product is not directed at children under 13
- No marketing targets children
- If children use the product, they do so incidentally
- If a known user under 13 sends feedback with PII, delete immediately on review

## 8. Third-party content licenses

### Fonts
- Anton, Bebas Neue, Fraunces, DM Sans — all Google Fonts, SIL OFL licensed
- No attribution obligation beyond the license terms
- Free for commercial use; our use is non-commercial anyway

### Background image
- Photographic chai-cheers background (`public/bg/b0c397fda38eb0c4c5df536cbefa06dc.jpg`) — **owner must confirm the license**. If sourced from Unsplash or Pexels, the license is permissive and usage is fine. If sourced from Google Images without a CC license, replace it.

### Icons + favicons
- PWA icons generated from the "BAD DESI PLOTS" wordmark; original work
- No third-party icon sets used in v2.1

### Wikipedia citations
- Fact-check pipeline reads Wikipedia via public API; no scraping of proprietary content
- Wikipedia content is CC BY-SA; our product doesn't reproduce Wikipedia text, only verifies against it

### Libraries
- All npm dependencies under their respective OSS licenses (MIT, Apache 2.0, BSD)
- License compliance: the PWA bundle doesn't redistribute source; no attribution file needed, but a `THIRD-PARTY-NOTICES.md` can be generated if required

## 9. Takedown playbook

The most likely legal scenario is a studio or rights holder objecting to a card about their film. Response playbook:

### Immediate response (within 24h)
1. Remove the card from `cards.json` (set `"retired": true`)
2. Deploy an updated `cards.json` to prod
3. Respond to the complainant acknowledging receipt

### Investigation (within 7 days)
1. Review the complaint: is it a good-faith concern or an over-reach?
2. Check the card's voice-rubric compliance (any slurs, personality rights issues, verbatim dialogue)
3. If the card was clearly problematic, keep it retired + apologize
4. If the card was defensible, restore it but add a `"sensitivity_note"` field and ensure future voice audits flag the pattern

### Formal DMCA-style response
If the claim escalates to a formal DMCA notice or Indian IT Act Section 79 notice:
1. Respond per the statutory timeline (usually 36h in India)
2. Comply promptly to preserve safe harbor status
3. If the claim is demonstrably meritless (e.g., a studio claiming copyright over factual film metadata), include the fair-dealing / fair-use defense in the response

### Policy escalation
If a pattern emerges (multiple takedown requests from the same industry), pause expansion in that industry and re-audit the existing cards against a tightened rubric.

### Never
- Ignore a takedown request
- Re-upload retired content under a different `id`
- Publicly shame the complainant
- Defame the rights holder or studio in response copy

## 10. Publishing a minimal ToS + privacy policy

Triggered when any of these become true:
- Monthly users > 10,000
- EU / UK users > 5% of total
- California users > 5% of total
- First formal legal inquiry received

### ToS must cover
- Product description (free, no accounts, PWA)
- User conduct rules (no spam, no PII in feedback, no slurs)
- Content ownership (card content is authored by the project; user feedback is licensed to us for use)
- Warranty disclaimer
- Limitation of liability (max the amount paid for the product — which is $0)
- Contact info

### Privacy policy must cover
- Data collected (analytics events, optional feedback)
- Data retention (PostHog 7 years default, Supabase indefinite)
- Third parties (PostHog, Supabase, Netlify, Google Fonts)
- User rights (access, delete — even pre-GDPR, as a good-faith offer)
- How to request deletion (email a TBD address)
- Contact info

Target length: 2 pages for each. Plain language. Not a legal fortress.

## 11. Jurisdictional footprint

### Primary jurisdiction
- Author located in: **TBD** (not yet documented; impacts which law governs)
- Hosting: Netlify (US)
- Databases: Supabase (US); PostHog (US by default)
- Users: India-heavy, US / UK / Canada / Australia secondary

### Governing law
- No user agreement in v2.1, so no contractual choice of law
- Tort claims (defamation, IP infringement) would follow the plaintiff's jurisdiction
- Defensive posture: take down content on good-faith request, don't pick fights

### Takedown-receiving address
- As of v2.1, no posted contact. Add a `legal@badbollywoodplots.com` alias once a legal inquiry arrives
- Until then, GitHub issue on the repo is the de-facto channel

## 12. Risk inventory

Ranked by likelihood × impact.

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Studio takedown for a specific card | Medium | Low-Medium | §9 playbook; retire the card |
| Actor personality rights complaint | Low | Medium | Never use actor name as headline; §5 guardrails |
| Sustained trademark challenge on product name | Low | High | Register "Bad Desi Plots" wordmark if growth warrants |
| GDPR complaint from EU user | Low | Medium | Minimal PII collection; publish privacy policy at growth trigger |
| DMCA takedown (US) | Low | Medium | §9 playbook; maintain good-faith compliance |
| User defames someone in feedback text and we're sued | Very Low | Low | Don't display feedback publicly; delete offensive submissions |
| Competitor copies the product | Medium | Low | Keep shipping; compete on content + voice (see `growth-spec.md` §12) |
| Data breach via Supabase misconfiguration | Low | Medium | Anon-only RLS; no PII stored; audit RLS quarterly |
| Loss of domain (badbollywoodplots.com) | Low | High | Auto-renew enabled; multi-year registration |

## 13. Content sensitivity policy

Beyond strict legal compliance, the editorial voice imposes content boundaries. See also `card-voice-rubric.md` §Forbidden.

### Hard lines (auto-reject)
- Slurs (caste, religion, regional, gender, orientation)
- Jokes glorifying violence against women, children, or animals
- Intentional deadnaming or misgendering of real people
- Mockery of films or communities as groups (punch down)

### Soft lines (case-by-case, owner discretion)
- Jokes about religion that a reasonable Indian audience would find harmless vs offensive
- References to politically sensitive topics (Kashmir, partition, caste politics) — handle only if directly relevant to the film's plot
- Regional stereotypes — acceptable if the film itself leans into them (Welcome, Housefull); off-limits if the film doesn't earn them

### On-ramp
Any new card that touches a soft line flag: author manually reviews, not just the auditor agent.

## 14. Accountability

- **Author:** responsible for all editorial and legal decisions
- **Contributors:** accept that PRs may be declined on legal grounds with explanation
- **Claude Code agents:** generate content within the rubrics; final approval is human
- **Users:** bound by implicit agreement to not submit illegal or harmful content via feedback

## 15. Review cadence

This spec is reviewed quarterly OR on any of these triggers:
- First formal legal inquiry
- Traffic milestone (10K, 50K, 250K monthly users)
- New jurisdiction becomes a meaningful share of audience
- Industry expansion (adding Tamil, Malayalam, etc. adds new rights-holder exposure)
- Any content removal under complaint

Record review date + changes in `.project-state.md` under a `## Legal review` section.

## 16. Open legal questions

- Is the chai-cheers background image license clean? Confirm source and swap if necessary.
- Is it worth registering "Bad Desi Plots" as a trademark now vs waiting for growth to justify the $200–500 spend?
- Should we adopt a Creative Commons license for card clues themselves (CC-BY-NC-SA), making the content reusable for other non-commercial trivia projects?
- If we ever accept voluntary donations (Buy Me a Coffee style), does that shift fair-use analysis from "non-commercial" to "commercial"? (Answer: probably no, but worth an attorney check.)
- Is there a cleaner way to sign card-report submissions such that spam is reduced without adding friction or collecting PII?
