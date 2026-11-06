import type { CSSProperties } from "react";

/** The page's recurring object: one miniature circuit breaker. Purely visual; wrap it in a button. */
export function Breaker({ on, size = 1 }: { on: boolean; size?: number }) {
  return (
    <span className="breaker" data-on={on} aria-hidden style={size === 1 ? undefined : ({ "--w": `${1.9 * size}rem`, "--h": `${3 * size}rem` } as CSSProperties)}>
      <i />
    </span>
  );
}
