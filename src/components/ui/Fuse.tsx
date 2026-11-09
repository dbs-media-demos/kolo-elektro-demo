import type { ReactNode } from "react";

/**
 * A section's fuse label: every section is numbered like a circuit in the panel directory. Below
 * 1024 px the sections run in the emergency-trade order (globals.css, "phone order"), so `phone`
 * is the number the section has there.
 */
export function Fuse({ n, phone = n, children }: { n: number; phone?: number; children: ReactNode }) {
  return (
    <p className="fuse">
      {phone === n ? (
        <b>F{n}</b>
      ) : (
        <b>
          <span className="max-lg:hidden">F{n}</span>
          <span className="lg:hidden">F{phone}</span>
        </b>
      )}{" "}
      {children}
    </p>
  );
}
