import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.legalName}: električar, Novi Sad`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: the mark, the promise, and three wires running out of frame. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0c0d0c", color: "#efede6", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 110, width: 8, height: 630, display: "flex", background: "#8a5430" }} />
        <div style={{ position: "absolute", top: 0, right: 90, width: 8, height: 630, display: "flex", background: "#2f6db5" }} />
        <div style={{ position: "absolute", top: 0, right: 70, width: 8, height: 630, display: "flex", background: "#9aae3c" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <path d="M21.6 6.6a11 11 0 1 0 3.1 15.5" fill="none" stroke="#efede6" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24.7 22.1 26 12" fill="none" stroke="#ffb224" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="16" cy="16" r="2.6" fill="#ffb224" />
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>{site.legalName}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 600, letterSpacing: -4, lineHeight: 1 }}>Električar koji</div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 600, letterSpacing: -4, lineHeight: 1.05, color: "#ffb224" }}>dođe kad kaže.</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#a3a59c" }}>Kvarovi · Instalacije · Table · Rasveta · Novi Sad</div>
        </div>
      </div>
    ),
    size,
  );
}
