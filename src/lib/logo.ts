/**
 * The lead's own logo (Forge draws it before the meeting; the CRM sanitises it): an `<svg viewBox>`
 * with `<g data-part="mark">` (stroked shapes) and `<g data-part="word">` (the name). Main ink is
 * currentColor, so it takes the colour of wherever it sits. Pure string work: runs on the server and
 * in the browser.
 */
export type BizLogo = { svg: string };

const SHAPE = /<(path|circle|rect|line|polyline|polygon|ellipse)\b([^>]*?)(\/?)>/gi;

/** The root `<svg …>` sized by CSS (no width/height), hidden from screen readers (the name is the label). */
function rootTag(svg: string, style: string) {
  return svg.replace(/^<svg\b([^>]*)>/i, (_m, attrs: string) => {
    const own = /\sstyle\s*=\s*"([^"]*)"/i.exec(attrs)?.[1] ?? "";
    const clean = attrs.replace(/\s(width|height|class|aria-hidden|focusable|role|style)\s*=\s*("[^"]*"|'[^']*')/gi, "");
    const css = [style, own].filter(Boolean).join(";");
    return `<svg${clean} class="biz-logo__svg" aria-hidden="true" focusable="false"${css ? ` style="${css}"` : ""}>`;
  });
}

/** For the header and footer: as drawn. */
export const inlineLogo = (svg: string) => rootTag(svg.trim(), "");

/**
 * For the page loader: every shape in the mark gets `pathLength="1"` (so one dash draws its whole
 * outline) and its place in the stagger (`--i`); the root gets the count (`--n`).
 */
export function loaderLogo(svg: string) {
  const s = svg.trim();
  const markAt = s.search(/<g\b[^>]*data-part\s*=\s*["']mark["']/i);
  if (markAt < 0) return rootTag(s, "--n:1");
  const wordAt = s.search(/<g\b[^>]*data-part\s*=\s*["']word["']/i);
  const end = wordAt > markAt ? wordAt : s.length;
  let i = 0;
  const mark = s.slice(markAt, end).replace(SHAPE, (_m, tag: string, attrs: string, close: string) => {
    const n = i++;
    let a = attrs.replace(/\spathLength\s*=\s*("[^"]*"|'[^']*')/gi, "");
    a = /\sstyle\s*=\s*"/i.test(a) ? a.replace(/\sstyle\s*=\s*"/i, ` style="--i:${n};`) : `${a} style="--i:${n}"`;
    return `<${tag}${a} pathLength="1"${close}>`;
  });
  return rootTag(s.slice(0, markAt) + mark + s.slice(end), `--n:${Math.max(i, 1)}`);
}
