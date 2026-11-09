"use client";

import { useEffect, useRef } from "react";
import { useBiz } from "@/components/preview/BizContext";
import { L } from "@/lib/biz-core";
import { loadGsap, scrollScenes } from "@/lib/motion";
import { useT } from "@/lib/i18n";
import { Fuse } from "@/components/ui/Fuse";

/** Rooms with a lamp at (x, y); a glow fills the clip rect when its circuit closes. */
const ROOMS = [
  { id: "living", label: "Living room", x: 40, y: 40, w: 440, h: 360, lx: 260, ly: 220 },
  { id: "kitchen", label: "Kitchen", x: 480, y: 40, w: 280, h: 260, lx: 620, ly: 170 },
  { id: "bath", label: "Bathroom", x: 560, y: 300, w: 200, h: 220, lx: 660, ly: 410, labelLow: true },
  { id: "bed", label: "Bedroom", x: 40, y: 400, w: 300, h: 320, lx: 190, ly: 560, labelLow: true },
  { id: "room", label: "Study", x: 560, y: 520, w: 200, h: 200, lx: 660, ly: 620 },
] as const;

/** One path per circuit, leaving the board (bottom of the hallway) along the walls. */
const RUNS = [
  "M372 636 V420 H260 V252 M260 420 H96 V330 M260 420 H440 V350",
  "M390 636 V330 H620 V202 M520 330 H520 V260 M620 240 H730",
  "M408 636 V456 H530 V410 H628 M530 456 H600",
  "M360 650 H190 V592 M250 650 V690 M190 650 H72",
  "M420 662 H660 V652 M540 662 V700 M660 662 H730",
];

const SOCKETS: [number, number][] = [[96, 330], [440, 350], [520, 260], [730, 240], [600, 456], [250, 690], [72, 650], [540, 700], [730, 662]];

const WALLS = "M40 40 H760 V720 H40 Z M480 40 V300 M480 300 H760 M40 400 H200 M260 400 H480 M340 400 V720 M560 300 V520 M560 580 V720 M560 520 H760 M480 300 V400 M340 720";

/**
 * The signature: scroll wires a whole flat. Walls draw first, then the conductors run out from the
 * board in brown, blue and green-yellow, the board fills, each breaker closes and its room comes on.
 * The default markup is the finished plan, so no-JS and reduced motion see the end state. The scene
 * is pinned and scrubbed only on a big screen with a mouse; phones and tablets get it stacked: the
 * finished plan, the four days one under another and the totals, with the same words.
 */
export function Plan() {
  const biz = useBiz();
  const t = useT();
  const track = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const metres = useRef<HTMLSpanElement>(null);
  const circuits = useRef<HTMLSpanElement>(null);
  const days = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  const STEPS = [
    { day: t("Day 1"), title: t("We walk it with you."), line: t("Every socket and lamp goes on the plan before a single chase is cut, so nothing gets decided on a ladder.") },
    { day: t("Day 2"), title: t("Copper in the walls."), line: t("Brown, blue and green-yellow. Straight runs, right angles, nothing that will surprise whoever drills here in twenty years.") },
    { day: t("Day 3"), title: t("A board worth opening."), line: t("One protected circuit per room. Combed, labelled and written down in a directory you can read.") },
    { day: t("Day 4"), title: t("First light."), line: t("Circuit by circuit, measured under load. The flat comes on and you get the report in your hand.") },
  ];

  useEffect(() => {
    const el = svg.current;
    const sec = track.current;
    if (!el || !sec || !scrollScenes()) return;
    let alive = true;
    let cleanup = () => {};
    void loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!alive) return;
      const q = gsap.utils.selector(el);
      const steps = gsap.utils.toArray<HTMLElement>(sec.querySelectorAll(".plan-step"));

      const stat = { m: 0, c: 0 };
      let tl!: gsap.core.Timeline;
      const ctx = gsap.context(() => {
        tl = gsap.timeline({ defaults: { ease: "none", duration: 1 }, paused: true });

        gsap.set(q(".p-wall"), { strokeDashoffset: 1 });
        gsap.set(q(".p-label"), { opacity: 0 });
        gsap.set(q(".p-run"), { strokeDashoffset: 1 });
        gsap.set(q(".p-device"), { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
        gsap.set(q(".p-board"), { opacity: 0 });
        gsap.set(q(".p-glow"), { opacity: 0 });
        gsap.set(q(".p-lever"), { y: 9 });
        gsap.set(q(".p-led"), { fill: "#3c3c37" });
        gsap.set(q(".p-lamp"), { fill: "#0c0d0c" });

        // Day 1: the plan
        tl.to(q(".p-wall"), { strokeDashoffset: 0, duration: 16 }, 0);
        tl.to(q(".p-label"), { opacity: 1, duration: 4, stagger: 1 }, 7);
        // Day 2: wires run out from the board, one circuit after another
        tl.to(q(".p-run"), { strokeDashoffset: 0, duration: 12, stagger: 1.1 }, 24);
        tl.to(q(".p-device"), { opacity: 1, scale: 1, duration: 1.4, stagger: 0.45, ease: "back.out(2.5)" }, 30);
        tl.to(stat, { m: 412, duration: 24 }, 24);
        // Day 3: the board
        tl.to(q(".p-board"), { opacity: 1, duration: 4 }, 50);
        // Day 4: each breaker closes, and its room comes on with a stutter
        ROOMS.forEach((_, i) => {
          const at = 62 + i * 6.4;
          tl.to(q(`.p-lever-${i}`), { y: 0, duration: 0.6, ease: "power3.out" }, at);
          tl.set(q(`.p-led-${i}`), { fill: "#ffb224" }, at + 0.3);
          tl.to(q(`.p-glow-${i}`), { keyframes: [{ opacity: 0.8, duration: 0.3 }, { opacity: 0.1, duration: 0.4 }, { opacity: 0.92, duration: 0.3 }, { opacity: 0.45, duration: 0.3 }, { opacity: 1, duration: 1 }] }, at + 0.4);
          tl.set(q(`.p-lamp-${i}`), { fill: "#ffb224" }, at + 0.4);
          tl.to(stat, { c: "+=2.8", duration: 2 }, at);
        });
        tl.to({}, { duration: 8 }, 96);
      }, el);

      const total = tl.duration();
      const cuts = [24 / total, 50 / total, 62 / total];
      let cur = -1;
      const paint = (p: number) => {
        tl.progress(p);
        if (metres.current) metres.current.textContent = String(Math.round(stat.m));
        if (circuits.current) circuits.current.textContent = String(Math.min(14, Math.round(stat.c)));
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        const idx = p < cuts[0] ? 0 : p < cuts[1] ? 1 : p < cuts[2] ? 2 : 3;
        if (idx !== cur) {
          cur = idx;
          steps.forEach((s, i) => gsap.to(s, { opacity: i === idx ? 1 : 0, y: i === idx ? 0 : i < idx ? -16 : 16, duration: 0.5, ease: "power2.out", overwrite: true }));
          if (days.current) days.current.textContent = String(idx + 1);
        }
      };
      paint(0);

      const st = ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6, onUpdate: (s) => paint(s.progress) });
      cleanup = () => {
        st.kill();
        ctx.revert();
        gsap.killTweensOf(steps);
        gsap.set(steps, { clearProps: "all" });
      };
    });
    return () => {
      alive = false;
      cleanup();
    };
  }, []);

  return (
    <section ref={track} aria-labelledby="plan-title" className="plan-track sec-night relative">
      <div className="plan-sticky grid content-center overflow-hidden px-[var(--gutter)] min-[900px]:grid-cols-12 min-[900px]:items-center min-[900px]:gap-10 flat:py-24 flat:md:py-36 pin:sticky pin:top-0 pin:h-[100svh] pin:pb-6 pin:pt-[calc(var(--header-h)+0.25rem)]">
        <div className="max-[899px]:contents min-[900px]:col-span-5">
          <Fuse n={1} phone={7}>{t("New wiring")}</Fuse>
          <h2 id="plan-title" className="plan-h t-display mt-3 min-[900px]:mt-5">
            {L(biz, "A flat, from bare brick to the first light.", "Stan, od gole cigle do prvog svetla.")}
          </h2>

          <div className="plan-steps mt-8 grid max-[899px]:order-2 min-[900px]:mt-10">
            {STEPS.map((s) => (
              <div key={s.day} className="plan-step">
                <p className="t-label text-spark">{s.day}</p>
                <p className="t-sm mt-1.5 font-display font-medium min-[900px]:mt-3">{s.title}</p>
                <p className="quiet mt-1.5 max-w-md text-[0.92rem] leading-snug min-[900px]:mt-3 min-[900px]:text-base min-[900px]:leading-normal">{s.line}</p>
              </div>
            ))}
          </div>

          <dl className="rule mt-6 grid max-w-md grid-cols-3 gap-4 border-t pt-5 max-[899px]:order-3 min-[900px]:mt-10 min-[900px]:pt-6">
            <div>
              <dt className="t-label quiet text-[0.62rem]">{t("Day")}</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                <span ref={days}>4</span>/4
              </dd>
            </div>
            <div>
              <dt className="t-label quiet text-[0.62rem]">{t("Copper")}</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                <span ref={metres}>412</span> m
              </dd>
            </div>
            <div>
              <dt className="t-label quiet text-[0.62rem]">{t("Circuits")}</dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                <span ref={circuits}>14</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto mt-10 w-full max-w-[min(100%,30rem)] max-[899px]:order-1 min-[900px]:col-span-7 min-[900px]:mt-0 min-[900px]:max-w-[min(100%,80svh)]">
          <svg ref={svg} viewBox="0 0 800 760" className="block h-auto w-full" role="img" aria-label={t("Floor plan of a flat: walls, wiring, the board, and every room lit")}>
            <defs>
              {ROOMS.map((r) => (
                <radialGradient key={r.id} id={`g-${r.id}`} gradientUnits="userSpaceOnUse" cx={r.lx} cy={r.ly} r={Math.max(r.w, r.h) * 0.78}>
                  <stop offset="0" stopColor="#ffc873" stopOpacity="0.72" />
                  <stop offset="0.45" stopColor="#ff9f2e" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#ff9f2e" stopOpacity="0.04" />
                </radialGradient>
              ))}
            </defs>

            {ROOMS.map((r, i) => (
              <rect key={r.id} className={`p-glow p-glow-${i} plan-room`} x={r.x} y={r.y} width={r.w} height={r.h} fill={`url(#g-${r.id})`} />
            ))}

            <path className="p-wall" d={WALLS} pathLength={1} strokeDasharray="1" fill="none" stroke="#efede6" strokeWidth="5" strokeLinecap="square" />

            {RUNS.map((d, i) => (
              <g key={i} fill="none" strokeWidth="2.6" strokeLinejoin="round">
                <path className="p-run" d={d} pathLength={1} strokeDasharray="1" stroke="#a9683c" />
                <path className="p-run" d={d} pathLength={1} strokeDasharray="1" stroke="#3f82d0" transform="translate(5 5)" />
                <path className="p-run" d={d} pathLength={1} strokeDasharray="1" stroke="#b6c548" transform="translate(-5 -5)" />
              </g>
            ))}

            {SOCKETS.map(([x, y]) => (
              <g key={`${x}-${y}`} className="p-device" transform={`translate(${x} ${y})`}>
                <path d="M-11 0a11 11 0 0 1 22 0Z" fill="#0c0d0c" stroke="#efede6" strokeWidth="2.4" />
                <path d="M0-11v-7" stroke="#efede6" strokeWidth="2.4" />
              </g>
            ))}

            {ROOMS.map((r, i) => (
              <g key={r.id} className="p-device" transform={`translate(${r.lx} ${r.ly})`}>
                <circle className={`p-lamp p-lamp-${i}`} r="15" fill="#ffb224" stroke="#efede6" strokeWidth="2.4" />
                <path d="M-10.5-10.5 10.5 10.5M10.5-10.5-10.5 10.5" stroke="#efede6" strokeWidth="2.4" />
              </g>
            ))}

            {ROOMS.map((r) => (
              <text key={r.id} className="p-label" x={r.x + 18} y={"labelLow" in r ? r.y + r.h - 16 : r.y + 34} fill="#a3a59c" fontFamily="var(--font-jetbrains)" fontSize="17" letterSpacing="1">
                {t(r.label).toUpperCase()}
              </text>
            ))}

            {/* The board, in the hallway, one breaker per room */}
            <g className="p-board" transform="translate(354 628)">
              <rect width="86" height="48" rx="4" fill="#20221f" stroke="#efede6" strokeWidth="2" />
              {ROOMS.map((_, i) => (
                <g key={i} transform={`translate(${7 + i * 15.2} 8)`}>
                  <rect width="11" height="32" rx="1.5" fill="#efede6" />
                  <rect className={`p-led p-led-${i}`} x="3" y="3" width="5" height="3" fill="#ffb224" />
                  <rect x="3" y="10" width="5" height="17" fill="#c8c5ba" />
                  <rect className={`p-lever p-lever-${i}`} x="3" y="10" width="5" height="8" fill="#17181a" />
                </g>
              ))}
            </g>
          </svg>
          <span aria-hidden className="absolute inset-x-[5%] -bottom-1 hidden h-px origin-left bg-spark pin:block" ref={bar} />
        </div>
      </div>
    </section>
  );
}
