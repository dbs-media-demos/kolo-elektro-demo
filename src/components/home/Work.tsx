"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";
import { Breaker } from "@/components/ui/Breaker";
import { Reveal } from "@/components/ui/Reveal";
import { jobs, type Job } from "@/content/offer";
import { ScrollTrigger, gsap, prefersReducedMotion } from "@/lib/gsap";
import { useT } from "@/lib/i18n";

/** Finished jobs arrive dark and strike on like old tubes as you reach them. Each has its own switch. */
export function Work() {
  const biz = useBiz();
  const t = useT();
  const list = jobs[biz.lang];
  return (
    <section id="radovi" aria-labelledby="work-title" className="sec-night relative overflow-hidden px-[var(--gutter)] pb-24 pt-8 md:pb-36">
      <Reveal>
        <p className="fuse">
          <b>F6</b> {t("Work")}
        </p>
        <h2 id="work-title" className="t-display t-lg mt-5 max-w-3xl">
          {t("Judge us by the first night")} <span className="quiet">{t("the lights come on.")}</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-y-14 md:mt-20 md:grid-cols-12 md:gap-x-8 md:gap-y-24">
        <Shot job={list[0]} showPlace={!biz.preview} className="md:col-span-8" ratio="aspect-[4/3] md:aspect-[16/10]" sizes="(min-width: 768px) 66vw, 100vw" parallax={-5} />
        <Shot job={list[1]} showPlace={!biz.preview} className="md:col-span-4 md:mt-40" ratio="aspect-[4/5]" sizes="(min-width: 768px) 33vw, 100vw" parallax={7} />
        <Shot job={list[2]} showPlace={!biz.preview} className="md:col-span-6 md:col-start-4" ratio="aspect-[5/6] md:aspect-[4/3]" sizes="(min-width: 768px) 50vw, 100vw" parallax={-4} />
      </div>
    </section>
  );
}

function Shot({ job, showPlace, className, ratio, sizes, parallax }: { job: Job; showPlace: boolean; className?: string; ratio: string; sizes: string; parallax: number }) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);
  const [strike, setStrike] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (s) => {
        if (img.current) gsap.set(img.current, { yPercent: (s.progress - 0.5) * parallax });
      },
    });
    let io: IntersectionObserver | undefined;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.75) {
      setOn(false);
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io?.disconnect();
          setStrike(true);
          setOn(true);
        },
        { rootMargin: "0px 0px -30% 0px" },
      );
      io.observe(el);
    }
    return () => {
      st.kill();
      io?.disconnect();
    };
  }, [parallax]);

  const flip = () => {
    setStrike(!on && !prefersReducedMotion());
    setOn(!on);
  };

  return (
    <figure className={className}>
      <div ref={ref} className={clsx("lit rounded-xl shadow-[0_50px_90px_-50px_rgba(255,178,36,0.35),0_30px_60px_-30px_#000]", ratio)} data-on={on} data-strike={strike}>
        <div ref={img} className="absolute inset-[-6%_0]">
          <Image src={job.photo} alt={job.alt} fill sizes={sizes} quality={75} className="object-cover" />
        </div>
        <span className="lit-dark" key={String(on)} />
        <button
          type="button"
          onClick={flip}
          aria-pressed={on}
          aria-label={on ? t("Turn the lights off") : t("Turn the lights on")}
          className="absolute bottom-3 right-3 flex h-14 w-11 items-center justify-center rounded-lg bg-night/50 backdrop-blur-md transition-transform hover:-translate-y-0.5"
        >
          <Breaker on={on} size={0.8} />
        </button>
      </div>
      <figcaption className="mt-4 grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-x-6">
        <p className="t-sm font-display font-medium">{job.title}</p>
        {showPlace && <p className="t-label quiet text-[0.66rem] sm:text-right">{job.place}</p>}
        <p className="quiet max-w-md text-[0.95rem] leading-snug sm:col-span-2">{job.note}</p>
      </figcaption>
    </figure>
  );
}
