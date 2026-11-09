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
- Routes: `/`, `/en`, `/for/<token>` (CRM previews), 404, robots, sitemap, manifest, OG image

## Signature features
- Live 3D distribution board in the hero, with a swaying pendant, real moving shadows, a pointer headlamp and a clickable main breaker
- A flat wired by the scroll, from bare walls to every room lit
- A symptom picker that reshapes a live oscilloscope trace
- An old electricity meter as the price estimator

## Personalised previews
- Shared kit from the other demos: `src/lib/biz-core.ts`, `biz.ts`, `preview.ts`, `src/components/preview/*`, `src/app/for/[token]`
- Layout tested with long names, no phone, no hours, no rating and an owner tagline
- On previews, neighbourhood names, job locations and the Novi Sad board give way to the lead's area and a Google map

## Notes
- Fictional business: Strujna 12, 21000 Novi Sad, +381 21 000 0000, zdravo@koloelektro.com. A web search found no electrician called Kolo in Novi Sad.
- Reviews are samples and labelled as such.
- Desktop 3D start: three.js loads when the browser is idle after load, on the canvas's own WebGL 2 context (no real graphics chip keeps the still and never downloads three.js). The scene builds in small steps, compiles every shader asynchronously (the shadow and environment-map shaders too) and draws one hidden frame before the canvas fades in over the still. Its first 2 s on screen are timed: under ~45 fps, a frame over 100 ms or over 2 ms of main-thread work a frame fades back to the still for the rest of the visit (sessionStorage `kolo-3d`). It draws only while visible (on screen, tab shown, not under the end fade), pixel ratio capped at 1.5.
- Measured 2026-11-09 on the production build, headless Chrome on the RTX 5070: the board fades in ~0.93 s after navigation with no long task after load and no frame over 13 ms in its first 2 s. With 4x CPU slowdown it fades in at ~3.4 s, hands back to the lit still ~2 s later and a reload in the same visit downloads no three.js.
- Phones and tablets never load three.js: only a big screen with a mouse (`(min-width: 1024px) and (hover: hover) and (pointer: fine)`, no reduced motion, no Save-Data) imports panelScene. Phones get dark and lit stills rendered from the desktop scene (`node scripts/capture-stills.mjs`), crossfade once to lit, and the main switch flips them.
- On phones the sections from Usluge to Pitanja skip layout until near the screen, holding their measured height from `src/app/held.css`. After changing section content: build, `node scripts/held-heights.mjs`, build again.

## Portfolio copy
EN title: Kolo Elektro — electrician, Novi Sad
EN one-liner (≤ 120 chars): An electrician's site with a live 3D fuse board: close the main switch and the lights come on.
EN summary (2–3 sentences): A concept site for an electrician in Novi Sad, built around one idea: closing the circuit. Visitors watch a real-time 3D board power up, wire a whole flat by scrolling, diagnose a fault on a live oscilloscope and read a price off an old electricity meter.
SR title: Kolo Elektro — električar, Novi Sad
SR one-liner: Sajt za električara sa razvodnom tablom u 3D: uključite glavnu sklopku i svetla se pale.
SR summary: Koncept sajt za električara iz Novog Sada, napravljen oko jedne ideje: zatvaranja strujnog kola. Posetioci gledaju kako se tabla u realnom vremenu uključuje, skrolom provode instalaciju kroz ceo stan, prepoznaju kvar na živom osciloskopu i čitaju cenu sa starog brojila.
