"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useBiz } from "@/components/preview/BizContext";
import { Breaker } from "@/components/ui/Breaker";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/content/offer";
import { marketOf } from "@/lib/biz";
import { prefersReducedMotion } from "@/lib/gsap";
import { useT } from "@/lib/i18n";
import { Arrow } from "@/components/hero/Hero";

/**
 * The services are the panel directory: eight labelled circuits. Scrolling in, the breakers close
 * one after another with a clack; press one and its circuit opens with the detail and a photo.
 */
export function Services() {
  const biz = useBiz();
  const t = useT();
  const list = services[biz.lang];
  const market = marketOf(biz);
  const [open, setOpen] = useState(0);
  const [closed, setClosed] = useState(list.length);
  // Until someone presses one, every circuit is live; after that, the open circuit is the live one
  const [touched, setTouched] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) return;
    setClosed(0);
    let id = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let n = 0;
        id = window.setInterval(() => {
          n++;
          setClosed(n);
          if (n >= list.length) window.clearInterval(id);
        }, 130);
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [list.length]);

  return (
    <section id="usluge" aria-labelledby="services-title" className="sec-bone relative px-[var(--gutter)] py-24 md:py-36">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <p className="fuse">
            <b>F2</b> {t("Services")}
          </p>
          <h2 id="services-title" className="t-display t-lg mt-5">
            {t("Eight circuits.")} <span className="quiet">{t("One number to call.")}</span>
          </h2>
          <p className="t-lead mt-6 max-w-sm">{t("From one loose socket to a whole building's board. The same people, the same standard of work.")}</p>
          <p className="t-hand mt-8 -rotate-1 text-2xl text-[#1c2a55]">{t("press a breaker to see what's on it")}</p>
        </Reveal>

        <Reveal className="lg:col-span-8">
          <div ref={panel} className="tabla p-2 sm:p-3">
            <ul>
              {list.map((s, i) => {
                const isOpen = open === i;
                return (
                  <li key={s.name} className="circuit border-b border-black/10 last:border-b-0" data-open={isOpen}>
                    <h3>
                      <button
                        type="button"
                        onClick={() => {
                          setTouched(true);
                          setOpen(isOpen ? -1 : i);
                        }}
                        aria-expanded={isOpen}
                        aria-controls={`circuit-${i}`}
                        className="flex min-h-[4.5rem] w-full items-center gap-3 px-2 py-3 text-left sm:gap-5 sm:px-4"
                      >
                        <span className="w-6 shrink-0 font-mono text-xs text-black/50 sm:w-7">F{i + 1}</span>
                        <Breaker on={touched ? isOpen : closed > i} />
                        <span className="min-w-0 flex-1">
                          <span className="circuit-name t-sm block font-display font-medium">{s.name}</span>
                          <span className="t-hand mt-0.5 block text-lg leading-none text-[#1c2a55]/80">{s.note}</span>
                        </span>
                        <span className="hidden shrink-0 font-mono text-sm text-black/60 sm:block">{s.from[market]}</span>
                      </button>
                    </h3>
                    <div id={`circuit-${i}`} className="circuit-body" inert={!isOpen}>
                      <div>
                        <div className="grid gap-5 px-2 pb-6 sm:grid-cols-[1fr_13rem] sm:px-4 sm:pl-[5.75rem]">
                          <div>
                            <p className="max-w-xl text-[1.02rem] leading-relaxed text-black/75">{s.line}</p>
                            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                              <div>
                                <dt className="t-label text-[0.62rem] text-black/55">{t("Price")}</dt>
                                <dd className="mt-1 font-semibold">{s.from[market]}</dd>
                              </div>
                              <div>
                                <dt className="t-label text-[0.62rem] text-black/55">{t("Time")}</dt>
                                <dd className="mt-1 font-semibold">{s.time}</dd>
                              </div>
                            </dl>
                            <a href="#kontakt" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-spark-deep underline-offset-4 hover:underline">
                              {t("Ask about this")} <Arrow />
                            </a>
                          </div>
                          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-lg shadow-[0_18px_30px_-16px_rgba(12,13,12,0.55)] sm:block">
                            {isOpen && <Image src={s.photo} alt={s.alt} fill sizes="208px" className="object-cover" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
