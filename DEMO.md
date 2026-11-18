# Kolo Elektro (Scale by Noon demo)

- Niche: Electrician   (Scale by Noon site industry id: not on the site yet; closest is hvac / plumbing trades)
- Market / city: RS – Novi Sad (dinars, 230 V). English previews of US leads switch to dollars and 120 V.
- Languages: sr + en (`/` Serbian, `/en` English; Serbian is rendered on the server from `src/i18n/sr.ts`)
- Live URL: not deployed yet (owner decides after review)
- Repo: local only
- Folder: DBS Media Portfolio/Demo Websites/electrician
- Stack: Next.js 16.3.6, React 19.2.8, Tailwind v4, three.js 0.170, GSAP, Lenis
- Palette: #0C0D0C night · #151614 graphite · #A3A59C ash · #EFEDE6 bone · #FFB224 spark (the one loud colour) · #8F5400 spark on light. Brown, blue and green-yellow appear only on wires.
- Fonts: Geologica (display), Instrument Sans (body), JetBrains Mono (labels), Caveat (the handwriting on the directory and report); all with latin-ext
- Routes: `/`, `/en`, `/for/<token>` (CRM previews), and the same three with `/v2` on the end (the homepage without 3D), 404, robots, sitemap, manifest, OG image

## Signature features
- Live 3D distribution board in the hero, with a swaying pendant, real moving shadows, a pointer headlamp and a clickable main breaker
- A flat wired by the scroll, from bare walls to every room lit
- A symptom picker that reshapes a live oscilloscope trace
- An old electricity meter as the price estimator

## Two versions of the homepage (2026-11-18)
- `/`, `/en`, `/for/<token>`: the live 3D board. `/v2`, `/en/v2`, `/for/<token>/v2`: the same page (`HomeContent hero="v2"`, `Hero variant="v2"`) with no three.js at all, for a slow laptop or a lead who doesn't want 3D. Only the hero differs; `/v2` is noindex with its canonical on `/`.
- The /v2 hero (`src/components/hero/HeroLamp.tsx`, SVG + CSS, styles under "hero /v2" in globals.css): a wall with its chase still open, three conductors running up from a light switch through a junction box, and a filament bulb on its cord. On first paint the switch flips (0.25 s), the current runs up the wall and down the cord, and the bulb strikes on at 1.3 s with the headline's filament; then a pulse every 4.5 s and a slow sway. The switch and the bulb toggle the light; the pointer leans the lamp; on a big screen the scroll pans the bulb to the middle and moves in, with a 230 V · 50 Hz readout. From 900 px up; phones get exactly the stills of `/`.
- Measured 2026-11-18 on the production build: /v2, /en/v2 and /for/<token>/v2 at 1440 px load 0 bytes of three.js; the hero moves at 0.25 s; no frame over 8 ms in the intro; with 4x CPU the scroll scene has no long tasks. Phones (375 px, 4x CPU, slow 4G): JS 190 KB, LCP ~1.2 s, CLS 0, TBT 88-102 ms. `node scripts/v2-check.mjs <outDir>` repeats the desktop check with a stand-in CRM.

## Personalised previews
- Shared kit from the other demos: `src/lib/biz-core.ts`, `biz.ts`, `preview.ts`, `src/components/preview/*`, `src/app/for/[token]`
- Layout tested with long names, no phone, no hours, no rating and an owner tagline
- On previews, neighbourhood names, job locations and the Novi Sad board give way to the lead's area and a Google map

## Notes
- Fictional business: Strujna 12, 21000 Novi Sad, +381 21 000 0000, zdravo@koloelektro.com. A web search found no electrician called Kolo in Novi Sad.
- Reviews are samples and labelled as such.
- Desktop 3D start: three.js loads when the browser is idle after load, on the canvas's own WebGL 2 context (no real graphics chip keeps the still and never downloads three.js). The scene builds in small steps, compiles every shader asynchronously (the shadow and environment-map shaders too) and draws one hidden frame before the canvas fades in over the still. Its first 2 s on screen are timed: under ~45 fps, a frame over 100 ms or over 2 ms of main-thread work a frame fades back to the still for the rest of the visit (sessionStorage `kolo-3d`). It draws only while visible (on screen, tab shown, not under the end fade), pixel ratio capped at 1.5.
- Measured 2026-11-09 on the production build, headless Chrome on the RTX 5070: the board fades in ~0.93 s after navigation with no long task after load and no frame over 13 ms in its first 2 s. With 4x CPU slowdown it fades in at ~3.4 s, hands back to the lit still ~2 s later and a reload in the same visit downloads no three.js.
- Phone pass (2026-11-09), production build at 375 px, 4x CPU, slow 4G, both languages: JS 187 KB, fonts 2 files / 47 KB, three.js 0 bytes, LCP ~1.1-1.25 s, CLS 0, TBT (after first paint) 92-107 ms. All long tasks together are ~230-275 ms: the first layout while the HTML parses (170-235 ms, before first paint; text layout starting cold for header, hero and the services peek) and ~140 ms evaluating the Next/React framework (~135 KB of the 187 KB). About 18 phone screens; reviews end inside the first four.
- Phones and tablets never load three.js, GSAP or Lenis (`src/lib/motion.ts` loads GSAP only behind the big-screen check). They load two font files from `public/fonts` (`scripts/phone-fonts.py`): Geologica 500 and Instrument Sans 400-600, Latin + Latin Extended-A; labels use the system monospace and the handwriting is Geologica, slanted. The section order below 1024 px is the emergency-trade one (CSS `order` in globals.css), fuse numbers follow (`Fuse.tsx`). The header is solid on phones; on a big screen it is transparent over the board until the page scrolls.
- Phones and tablets never load three.js: only a big screen with a mouse (`(min-width: 1024px) and (hover: hover) and (pointer: fine)`, no reduced motion, no Save-Data) imports panelScene. Phones get dark and lit stills rendered from the desktop scene (`node scripts/capture-stills.mjs`), crossfade once to lit, and the main switch flips them.
- On phones every section below the hero (and the footer) skips layout until near the screen, holding its measured height from `src/app/held.css`, per language. Area, contact and footer hold heights only on `/` and `/en`; previews lay them out normally. After changing section content: build, `node scripts/held-heights.mjs`, build again, `node scripts/held-check.mjs`.

## Portfolio copy
EN title: Kolo Elektro — electrician, Novi Sad
EN one-liner (≤ 120 chars): An electrician's site with a live 3D fuse board: close the main switch and the lights come on.
EN summary (2–3 sentences): A concept site for an electrician in Novi Sad, built around one idea: closing the circuit. Visitors watch a real-time 3D board power up, wire a whole flat by scrolling, diagnose a fault on a live oscilloscope and read a price off an old electricity meter.
SR title: Kolo Elektro — električar, Novi Sad
SR one-liner: Sajt za električara sa razvodnom tablom u 3D: uključite glavnu sklopku i svetla se pale.
SR summary: Koncept sajt za električara iz Novog Sada, napravljen oko jedne ideje: zatvaranja strujnog kola. Posetioci gledaju kako se tabla u realnom vremenu uključuje, skrolom provode instalaciju kroz ceo stan, prepoznaju kvar na živom osciloskopu i čitaju cenu sa starog brojila.
