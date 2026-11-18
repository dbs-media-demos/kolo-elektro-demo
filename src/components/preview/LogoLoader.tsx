import { loaderLogo } from "@/lib/logo";

/**
 * Runs inline, before the page under it paints: the first view of this lead's page in the tab shows
 * the loader (html[data-loading]); a reload in the same tab skips it. It exits after `hold` ms, or
 * at once on a click or a key, and fires `loader:done` (lib/loader) as it goes. No React needed,
 * so a slow script can't keep it up; the CSS hides it after 2.8 s even without JavaScript.
 */
const boot = `function(k,hold,out){var h=document.documentElement;try{if(sessionStorage.getItem(k)){h.setAttribute("data-loader","off");return}sessionStorage.setItem(k,"1")}catch(e){}var rm=matchMedia("(prefers-reduced-motion: reduce)").matches,done=!1;h.setAttribute("data-loading","");h.setAttribute("data-loader","play");function go(){if(done)return;done=!0;removeEventListener("pointerdown",go,!0);removeEventListener("keydown",go,!0);h.setAttribute("data-loader","exit");h.removeAttribute("data-loading");try{dispatchEvent(new Event("loader:done"))}catch(e){}setTimeout(function(){h.setAttribute("data-loader","off")},rm?350:out)}setTimeout(go,rm?600:hold);addEventListener("pointerdown",go,!0);addEventListener("keydown",go,!0)}`;

/** Draw, fill and word reveal take ~1.3 s (CSS); a short hold, then the exit. */
const HOLD_MS = 1600;
const EXIT_MS = 700;

export function LogoLoader({ svg, token, exit = "lift" }: { svg: string; token: string; exit?: "lift" | "wipe" | "fade" }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `(${boot})(${JSON.stringify(`bizLoader:${token}`)},${HOLD_MS},${EXIT_MS})` }} />
      <div className="biz-loader" data-exit={exit} aria-hidden="true">
        <div className="biz-loader__logo" dangerouslySetInnerHTML={{ __html: loaderLogo(svg) }} />
      </div>
    </>
  );
}
