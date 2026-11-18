"use client";

import { useEffect, useRef } from "react";
import { useBiz } from "@/components/preview/BizContext";
import { marketOf } from "@/lib/biz";
import { BIG_SCREEN, prefersReducedMotion } from "@/lib/motion";
import { useT } from "@/lib/i18n";

/**
 * The /v2 hero, with no 3D: a wall with its chase still open. Three conductors run up from a light
 * switch, through a junction box, out of the frame, and come back down the pendant cord. On first
 * paint the switch flips, the current runs up the wall and down the cord, and the filament strikes
 * on, lighting the wall (CSS only, before any JavaScript). Then a pulse runs the same way every few
 * seconds and the lamp sways a little. The switch and the bulb are real controls, the pointer leans
 * the lamp, and on a big screen the scroll moves in on the bulb (--fly, set by Hero's scroll trigger).
 * Shown from 900 px up; phones keep the stills of `/`. Drawn in a 800 x 1000 box.
 */

// Plaster edges of the chase: a few millimetres of rough, the same on the server and in the browser
const rough = (x: number, from: number, to: number, seed: number) => {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts: string[] = [];
  for (let y = from; y <= to; y += 14) pts.push(`${(x + (rnd() - 0.5) * 3.2).toFixed(1)} ${y}`);
  return pts;
};
/** Fresh plaster where the wall was patched around the chase */
const PLASTER = (() => {
  const left = rough(212, -1000, 662, 3);
  const right = rough(290, -1000, 662, 5).reverse();
  return `M${left.join(" L")} L${right.join(" L")} Z`;
})();
const CHASE = (() => {
  const left = rough(233, -1000, 668, 7);
  const right = rough(267, -1000, 668, 11).reverse();
  return `M${left.join(" L")} L${right.join(" L")} Z`;
})();
/** Plaster dabs that hold the cable in the chase */
const DABS = [-60, 120, 470, 600];

const BULB = { x: 520, y: 600 };
const GLASS = "M500 506 C500 528 434 540 434 604 A86 86 0 1 0 606 604 C606 540 540 528 540 506 Z";

export function HeroLamp({ power, onToggle }: { power: "on" | "off" | undefined; onToggle: () => void }) {
  const biz = useBiz();
  const t = useT();
  const lean = useRef<SVGGElement>(null);
  const us = marketOf(biz) === "us";
  const on = power !== "off";

  // The lamp leans a little toward the pointer: a big screen with a mouse only, motion allowed
  useEffect(() => {
    const g = lean.current;
    const sec = g?.closest("section");
    if (!g || !sec || !window.matchMedia(BIG_SCREEN).matches || prefersReducedMotion()) return;
    let raf = 0;
    let x = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX / window.innerWidth - 0.62;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          g.style.transform = `rotate(${(-x * 1.6).toFixed(3)}deg)`;
        });
    };
    sec.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      sec.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const label = on ? t("Light: on") : t("Light: off");
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="lamp-stage" data-power={power}>
      <div className="lamp-zoom">
        <svg viewBox="0 0 800 1000" className="lamp-svg" role="group" aria-label={t("A light switch, the wiring in the wall and a filament bulb")}>
          <defs>
            <radialGradient id="lp-pool" cx={BULB.x} cy={BULB.y} r="640" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffbe55" stopOpacity="0.5" />
              <stop offset="0.2" stopColor="#ffa92a" stopOpacity="0.24" />
              <stop offset="0.5" stopColor="#c56d10" stopOpacity="0.08" />
              <stop offset="1" stopColor="#c56d10" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lp-falloff" cx={BULB.x} cy={BULB.y} r="760" gradientUnits="userSpaceOnUse">
              <stop offset="0.12" stopColor="#0c0d0c" stopOpacity="0" />
              <stop offset="1" stopColor="#0c0d0c" stopOpacity="0.72" />
            </radialGradient>
            <radialGradient id="lp-halo" cx={BULB.x} cy={BULB.y + 8} r="150" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff1c9" stopOpacity="0.95" />
              <stop offset="0.25" stopColor="#ffc35a" stopOpacity="0.55" />
              <stop offset="0.6" stopColor="#ff9d1a" stopOpacity="0.12" />
              <stop offset="1" stopColor="#ff9d1a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lp-glass-off" cx="0.38" cy="0.36" r="0.75">
              <stop offset="0" stopColor="#3a3a35" stopOpacity="0.55" />
              <stop offset="0.7" stopColor="#191a17" stopOpacity="0.7" />
              <stop offset="1" stopColor="#4a4a44" stopOpacity="0.8" />
            </radialGradient>
            <radialGradient id="lp-glass-on" cx="0.5" cy="0.62" r="0.7">
              <stop offset="0" stopColor="#ffe3a6" stopOpacity="0.95" />
              <stop offset="0.45" stopColor="#ffb547" stopOpacity="0.6" />
              <stop offset="1" stopColor="#c76f12" stopOpacity="0.55" />
            </radialGradient>
            <linearGradient id="lp-brass" x1="0" x2="1">
              <stop offset="0" stopColor="#5a4a2a" />
              <stop offset="0.35" stopColor="#c9a965" />
              <stop offset="0.55" stopColor="#f0d79a" />
              <stop offset="1" stopColor="#4d3f22" />
            </linearGradient>
            <linearGradient id="lp-plate" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4f2ec" />
              <stop offset="1" stopColor="#cfccc1" />
            </linearGradient>
            <linearGradient id="lp-rocker" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fbfaf6" />
              <stop offset="0.5" stopColor="#e6e3da" />
              <stop offset="1" stopColor="#c9c6bb" />
            </linearGradient>
            <filter id="lp-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <filter id="lp-softer" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* The wall, and the light the bulb throws on it (swings with the lamp) */}
          <g aria-hidden>
            <rect x="-1200" y="-1200" width="3200" height="3400" fill="#121311" />
            <g className="lamp-sway">
              <circle className="lamp-light" cx={BULB.x} cy={BULB.y} r="640" fill="url(#lp-pool)" />
            </g>
          </g>

          {/* The open chase: plaster cut back, three conductors, dabs of plaster holding them */}
          <g aria-hidden>
            <path d={PLASTER} fill="#1b1c19" />
            <path d={PLASTER} fill="none" stroke="#fff" strokeOpacity="0.05" strokeWidth="1.5" />
            <path d={CHASE} fill="#080908" />
            <path d={CHASE} fill="none" stroke="#2a2b27" strokeWidth="2" />
            <line x1="236" y1="-1000" x2="236" y2="668" stroke="#000" strokeOpacity="0.6" strokeWidth="4" />
            <path d="M243 -1000 V690" stroke="#7b4a29" strokeWidth="5" strokeLinecap="round" />
            <path d="M250 -1000 V690" stroke="#2a62a6" strokeWidth="5" strokeLinecap="round" />
            <path d="M257 -1000 V690" stroke="#8aa034" strokeWidth="5" strokeLinecap="round" />
            <path d="M257 -1000 V690" stroke="#d8c03a" strokeWidth="5" strokeDasharray="9 9" />
            {/* a faint sheen down each conductor */}
            <path d="M242 -1000 V690 M249 -1000 V690 M256 -1000 V690" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.2" />
            {DABS.map((y) => (
              <g key={y}>
                <ellipse cx="250" cy={y + 3} rx="20" ry="11" fill="#000" opacity="0.35" filter="url(#lp-softer)" />
                <ellipse cx="250" cy={y} rx="18" ry="10" fill="#4b4a44" />
                <ellipse cx="247" cy={y - 2} rx="12" ry="5" fill="#66645c" />
              </g>
            ))}
          </g>

          {/* Junction box, lid off: conductors joined in lever connectors */}
          <g aria-hidden>
            <circle cx="252" cy="338" r="58" fill="#000" opacity="0.4" filter="url(#lp-soft)" />
            <circle cx="250" cy="330" r="54" fill="#2c2d29" />
            <circle cx="250" cy="330" r="46" fill="#0b0c0b" />
            <circle cx="250" cy="330" r="46" fill="none" stroke="#000" strokeOpacity="0.7" strokeWidth="5" />
            <path d="M243 284 C238 305 220 312 222 330 M243 376 C238 360 220 350 222 336" stroke="#7b4a29" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M250 284 V318 M250 376 V342" stroke="#2a62a6" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M257 284 C262 305 280 312 278 330 M257 376 C262 360 280 350 278 336" stroke="#8aa034" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            {[222, 250, 278].map((x) => (
              <g key={x}>
                <rect x={x - 9} y="318" width="18" height="24" rx="3" fill="#cfd2cf" fillOpacity="0.85" />
                <rect x={x - 7} y="320" width="14" height="5" rx="1.5" fill="#f08a1c" />
                <rect x={x - 7} y="327" width="14" height="5" rx="1.5" fill="#f08a1c" />
                <rect x={x - 7} y="334" width="14" height="5" rx="1.5" fill="#f08a1c" />
              </g>
            ))}
            <circle cx="250" cy="282" r="4" fill="#3d3e39" />
            <circle cx="250" cy="378" r="4" fill="#3d3e39" />
          </g>

          {/* Labels, written on the wall like a site drawing */}
          <g className="lamp-notes" aria-hidden>
            <text x="300" y="214" className="lamp-note">
              L · N · PE
            </text>
            <text x="300" y="236" className="lamp-note lamp-note-dim">
              {us ? "NM-B 14/2" : t("NYM-J 3×1.5 mm²")}
            </text>
            <line x1="262" y1="228" x2="292" y2="228" stroke="#a3a59c" strokeOpacity="0.45" strokeWidth="1" />
          </g>

          {/* The current: once on first paint, then every few seconds while the light is on */}
          <g aria-hidden>
            <path className="lamp-pulse lamp-pulse-up" d="M243 704 V376 C238 360 220 350 222 336 V330 C220 312 238 305 243 284 V-80" pathLength={1} />
          </g>

          {/* The switch, a real control: its plate throws a soft shadow away from the bulb */}
          <g
            className="lamp-switch"
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={label}
            onClick={onToggle}
            onKeyDown={key}
          >
            <rect x="188" y="686" width="108" height="108" rx="13" fill="#000" opacity="0.55" filter="url(#lp-soft)" />
            <rect x="196" y="678" width="108" height="108" rx="13" fill="url(#lp-plate)" />
            <rect x="196.5" y="678.5" width="107" height="107" rx="12.5" fill="none" stroke="#fff" strokeOpacity="0.6" />
            <rect x="221" y="700" width="58" height="64" rx="7" fill="#b9b6ab" />
            <g className="lamp-rocker">
              <rect x="223" y="702" width="54" height="60" rx="6" fill="url(#lp-rocker)" />
              <rect className="lamp-rocker-shade" x="223" y="732" width="54" height="30" rx="6" fill="#8f8c82" />
            </g>
            <rect className="lamp-switch-ring" x="190" y="672" width="120" height="120" rx="17" fill="none" />
          </g>

          {/* The lamp: cord, brass cap, glass, filament; it sways, leans to the pointer and toggles too */}
          <g ref={lean} className="lamp-lean">
            <g className="lamp-sway">
              <g className="lamp-bulb" onClick={onToggle}>
                <path d={`M${BULB.x} -1000 V470`} stroke="#050505" strokeWidth="7" />
                <path d={`M${BULB.x - 1.5} -1000 V470`} stroke="#fff" strokeOpacity="0.1" strokeWidth="1.5" />
                <path className="lamp-pulse lamp-pulse-down" d={`M${BULB.x} -80 V500`} pathLength={1} />
                <rect x="508" y="452" width="24" height="22" rx="3" fill="#1b1b19" />
                <rect x="496" y="472" width="48" height="38" rx="4" fill="url(#lp-brass)" />
                {[480, 488, 496, 504].map((y) => (
                  <rect key={y} x="496" y={y} width="48" height="2" fill="#2b2310" opacity="0.55" />
                ))}
                {/* the glass, dark, then lit */}
                <path d={GLASS} fill="url(#lp-glass-off)" />
                <path className="lamp-light" d={GLASS} fill="url(#lp-glass-on)" />
                {/* the filament on its two supports */}
                <path d="M512 508 L506 592 M528 508 L534 592" stroke="#6b6658" strokeWidth="1.6" fill="none" />
                <path d="M506 592 C 480 660, 560 660, 534 592" stroke="#4f4a3f" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle className="lamp-light" cx={BULB.x} cy={BULB.y + 8} r="150" fill="url(#lp-halo)" />
                <path className="lamp-light" d="M506 592 C 480 660, 560 660, 534 592" stroke="#fff6dc" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* reflections on the glass */}
                <path d="M462 566 C470 540 492 530 508 530" stroke="#fff" strokeOpacity="0.28" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M590 640 C584 664 570 678 552 686" stroke="#fff" strokeOpacity="0.1" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* the readout comes up as the scroll moves in */}
                <g className="lamp-readout">
                  <line x1={BULB.x} y1="706" x2={BULB.x} y2="736" stroke="#a3a59c" strokeOpacity="0.6" strokeWidth="1" />
                  <text x={BULB.x} y="760" textAnchor="middle" className="lamp-note">
                    {us ? "120 V" : "230 V"} · {us ? "60" : "50"} Hz
                  </text>
                  <text x={BULB.x} y="782" textAnchor="middle" className="lamp-note lamp-note-dim">
                    {t("measured, signed")}
                  </text>
                </g>
              </g>
            </g>
          </g>

          {/* Everything away from the bulb falls into the dark; with the light off the whole wall does */}
          <g aria-hidden pointerEvents="none">
            <rect x="-1200" y="-1200" width="3200" height="3400" fill="url(#lp-falloff)" />
            <rect className="lamp-dark" x="-1200" y="-1200" width="3200" height="3400" fill="#0c0d0c" fillOpacity="0.6" />
          </g>
        </svg>
      </div>
    </div>
  );
}
