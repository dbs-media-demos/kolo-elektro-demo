# Kolo Elektro — Scale by Noon concept site

A demo website for a **fictional** electrician in Novi Sad, built by [Scale by Noon](https://www.scalebynoon.com). Serbian (Latin) first, with an English switch. "Strujno kolo" is an electric circuit, and the whole site is about closing it.
Handoff notes: [`DEMO.md`](DEMO.md)

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

- `/` Serbian · `/en` English · `/for/<token>` personalised CRM preview (language comes from the lead)
- `NEXT_PUBLIC_NOINDEX` defaults to noindex (robots meta and robots.txt). Set it to `false` only for a real client site.
- `CRM_API_URL` overrides the CRM the previews read from.

## Sections

1. **Hero**: a real-time 3D distribution board (three.js). The main breaker closes, the rows come up, a pendant lamp strikes on and sways, and its shadows move. The pointer is the electrician's headlamp. Scrolling flies the camera into the board.
2. **F1 New wiring** (signature): scroll wires a whole flat: walls, conductors in brown, blue and green-yellow, the board, then each room comes on.
3. **F2 Services**: eight labelled circuits in a panel directory. Breakers close as they arrive; press one to open it.
4. **F3 Faults**: pick a symptom and a live oscilloscope trace takes its shape, with the urgency and what to do.
5. **F4 Prices**: an old electricity meter. Slide the floor area and the drums roll while the disc speeds up. Fixed price list beside it.
6. **F5 How it goes**: five junction boxes on one cable run that fills with the scroll.
7. **F6 Work**: finished jobs arrive dark and strike on like old tubes, each with its own switch.
8. **F7 Proof**: a test report that fills in reading by reading, then gets stamped.
9. **F8 Reviews**: a festoon string whose bulbs catch one by one (sample reviews, labelled as such).
10. **F9 Questions**: FAQ with a wall rocker per question.
11. **F10 Where we work**: Novi Sad as a circuit board (a real Google map on previews), hours, live open badge.
12. **F11 Contact**: "Close the circuit": sending the form snaps a knife switch shut and lights the lamp. Validates; sends nothing.

## Where things live

- `src/lib/site.ts`: the fictional business · `src/lib/biz-core.ts`, `biz.ts`, `preview.ts`: the business a page shows, and the CRM fetch
- `src/content/offer.ts`: services, faults, prices, jobs, reviews, FAQ, map nodes (per language; prices per market)
- `src/i18n/sr.ts`: Serbian UI strings, keyed by the English text. `copy(window.__untranslated())` on a Serbian page lists gaps
- `src/components/hero/panelScene.ts`: the 3D scene · `Hero.tsx`: loading, fallback, scroll
- `src/components/home/*`: one file per section · `src/components/preview/*`: preview kit shared with the other demos
- `src/assets/hero/*`: fallback stills rendered from the scene itself · `src/assets/photos/SOURCES.md`: photo credits

## Performance and fallbacks

three.js loads on idle, after the page has painted, over a still of the same board. Phones get a lighter scene (half the wires, no duct slots, less dust, lower resolution, 30 fps), and any slow device sheds resolution and then shadows. The scene stops drawing off-screen. Reduced motion, Save-Data or no WebGL get a still of the lit board, no pinning, and every section in its finished state.

## Scripts

- `node scripts/grade.mjs`: re-grades the photos (source set in `../universal-trades`)
- `node scripts/capture-stills.mjs`: re-renders the hero stills after a build, then build again. It opens the build in headless Chromium with no server (`scripts/offline.mjs`), and borrows Playwright from `../universal-trades`.

Forms validate and show success states but **send nothing**. Reviews, staff and business details are fictional.
