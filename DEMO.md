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
- Checked in headless Chromium with software WebGL, so real-device frame rates have not been measured.

## Portfolio copy
EN title: Kolo Elektro — electrician, Novi Sad
EN one-liner (≤ 120 chars): An electrician's site with a live 3D fuse board: close the main switch and the lights come on.
EN summary (2–3 sentences): A concept site for an electrician in Novi Sad, built around one idea: closing the circuit. Visitors watch a real-time 3D board power up, wire a whole flat by scrolling, diagnose a fault on a live oscilloscope and read a price off an old electricity meter.
SR title: Kolo Elektro — električar, Novi Sad
SR one-liner: Sajt za električara sa razvodnom tablom u 3D: uključite glavnu sklopku i svetla se pale.
SR summary: Koncept sajt za električara iz Novog Sada, napravljen oko jedne ideje: zatvaranja strujnog kola. Posetioci gledaju kako se tabla u realnom vremenu uključuje, skrolom provode instalaciju kroz ceo stan, prepoznaju kvar na živom osciloskopu i čitaju cenu sa starog brojila.
