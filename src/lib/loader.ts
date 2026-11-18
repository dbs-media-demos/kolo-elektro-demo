/**
 * The lead's logo page loader (components/preview/LogoLoader) sets `html[data-loading]` while it
 * shows and fires `loader:done` on window as it starts to exit. The homepage's own entrance
 * (hero timelines, the 3D intro, counters) waits for that, so it plays in view, not behind it.
 */
export const LOADER_DONE = "loader:done";

export const loaderShowing = () => typeof document !== "undefined" && document.documentElement.hasAttribute("data-loading");

/** Runs `cb` once the loader is gone (at once when there is none). Returns a cancel for effects' cleanup. */
export function whenLoaderDone(cb: () => void): () => void {
  if (!loaderShowing()) {
    cb();
    return () => {};
  }
  let live = true;
  const on = () => {
    if (live) cb();
  };
  window.addEventListener(LOADER_DONE, on, { once: true });
  return () => {
    live = false;
    window.removeEventListener(LOADER_DONE, on);
  };
}
