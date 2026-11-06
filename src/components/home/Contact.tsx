"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";
import { PhoneIcon } from "@/components/layout/MobileBar";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/content/offer";
import { telOf } from "@/lib/biz-core";
import { useT } from "@/lib/i18n";

/**
 * Closing the circuit: the whole brand in one form. An open knife switch sits above the fields;
 * send the request and it snaps shut, current runs round the loop and the lamp comes on. Validates
 * properly and sends nothing (it's a concept).
 */
export function Contact() {
  const biz = useBiz();
  const t = useT();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [job, setJob] = useState(0);
  const list = services[biz.lang];

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (String(data.get("name") ?? "").trim().length < 2) next.name = t("Please tell us your name.");
    if (String(data.get("phone") ?? "").replace(/\D/g, "").length < 6) next.phone = t("We need a number we can call you back on.");
    setErrors(next);
    if (Object.keys(next).length) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    setSent(true);
  };

  return (
    <section id="kontakt" aria-labelledby="contact-title" className="sec-night relative border-t border-white/10 px-[var(--gutter)] py-24 md:py-36">
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="fuse">
            <b>F11</b> {t("Contact")}
          </p>
          <h2 id="contact-title" className="t-display t-xl mt-5">
            {t("Close the circuit.")}
          </h2>
          <p className="t-lead mt-6 max-w-md">{t("Tell us what's going on and we'll call back within 30 minutes, with a time and a price. If it's sparking or smells of burning, don't type: call.")}</p>
          {biz.phone && (
            <a href={telOf(biz)} className="btn btn-spark mt-8" data-no-translate>
              <PhoneIcon />
              <span className="tabular-nums">{biz.phoneDisplay}</span>
            </a>
          )}
        </Reveal>

        <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
          <div className={clsx(sent && "closed")}>
            <Loop />
          </div>

          {sent ? (
            <div role="status" className="swap-in mt-6">
              <p className="t-md font-display font-medium">{t("The light's on.")}</p>
              <p className="t-lead mt-3">{t("Thanks. We'll call you within 30 minutes. (This is a concept site, so nothing was actually sent.)")}</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 grid gap-4">
              <div role="radiogroup" aria-label={t("What do you need?")} className="flex flex-wrap gap-2">
                {list.slice(0, 5).map((s, i) => (
                  <button key={s.name} type="button" role="radio" aria-checked={job === i} onClick={() => setJob(i)} className="chip">
                    {s.name}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("Your name")} name="name" autoComplete="name" error={errors.name} />
                <Field label={t("Phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" error={errors.phone} />
              </div>
              <label className="grid gap-1.5 text-sm">
                <span className="text-ash">{t("What's happening? (optional)")}</span>
                <textarea name="note" rows={3} className="field resize-none" />
              </label>
              <button type="submit" className="btn btn-spark w-full sm:w-fit">
                {t("Send the request")}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Field({ label, name, error, type = "text", autoComplete, inputMode }: { label: string; name: string; error?: string; type?: string; autoComplete?: string; inputMode?: "tel" }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-ash">{label}</span>
      <input name={name} type={type} autoComplete={autoComplete} inputMode={inputMode} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-err` : undefined} className="field" />
      {error && (
        <span id={`${name}-err`} className="text-[0.84rem] text-[#ef9a82]">
          {error}
        </span>
      )}
    </label>
  );
}

/** A circuit diagram: source, knife switch (open), lamp. `.closed` on the parent closes it. */
function Loop() {
  const D = "M60 60 H188 M232 60 H388 V130 H60 V60";
  return (
    <svg viewBox="0 0 450 150" className="block w-full max-w-[28rem]" aria-hidden fill="none">
      <defs>
        <radialGradient id="loadGlow">
          <stop offset="0" stopColor="#ffcf7d" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb224" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={D} stroke="#3a3b36" strokeWidth="3" />
      <path className="circuit-flow" d="M232 60 H388 V130 H60 V60 H188" pathLength={1} stroke="#ffb224" strokeWidth="3" />
      {/* source */}
      <g transform="translate(60 95)">
        <rect x="-16" y="-8" width="32" height="16" fill="#0c0d0c" />
        <path d="M-14-5H14M-8 5H8" stroke="#efede6" strokeWidth="2.5" />
      </g>
      {/* knife */}
      <circle cx="188" cy="60" r="5" fill="#efede6" />
      <circle cx="232" cy="60" r="5" fill="#efede6" />
      <line className="knife" x1="188" y1="60" x2="232" y2="60" stroke="#ffb224" strokeWidth="4" strokeLinecap="round" />
      {/* lamp */}
      <circle className="load-glow" cx="388" cy="60" r="52" fill="url(#loadGlow)" />
      <circle cx="388" cy="60" r="17" fill="#0c0d0c" stroke="#efede6" strokeWidth="2.5" />
      <path d="M376 48 400 72M400 48 376 72" stroke="#efede6" strokeWidth="2.5" />
    </svg>
  );
}
