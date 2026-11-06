/**
 * The Kolo mark: an electric circuit drawn as a ring, closed by a switch in amber with the load
 * at its centre. The whole brand is that one idea: closing the circuit.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <path d="M21.6 6.6a11 11 0 1 0 3.1 15.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path className="logo-switch" d="M24.7 22.1 26 12" stroke="var(--spark)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.6" fill="var(--spark)" />
    </svg>
  );
}

export function Logo({ name = "Kolo", sub, className }: { name?: string; sub?: string; className?: string }) {
  return (
    <span className={className}>
      <span className="flex items-center gap-2.5">
        <LogoMark className="h-8 w-8 shrink-0" />
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate font-display text-[1.15rem] font-medium tracking-[-0.03em]">{name}</span>
          {sub && <span className="t-label mt-1 text-[0.58rem] text-ash">{sub}</span>}
        </span>
      </span>
    </span>
  );
}
