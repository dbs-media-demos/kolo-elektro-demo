import type { Metadata, Viewport } from "next";
import { Caveat, Geologica, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./held.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { agencyName, noindex, site } from "@/lib/site";

// These are the big-screen fonts. Phones and tablets use two subset files instead (globals.css,
// scripts/phone-fonts.py), so nothing here is preloaded: a font is only fetched where its family is used.
// Headlines use "block": a late swap would re-wrap the big display lines and shift the page.
const display = Geologica({ subsets: ["latin", "latin-ext"], variable: "--font-geologica", display: "block", preload: false });
const sans = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-instrument", display: "swap", preload: false });
const mono = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin", "latin-ext"], variable: "--font-jetbrains", display: "swap", preload: false });
const hand = Caveat({ weight: "600", subsets: ["latin", "latin-ext"], variable: "--font-caveat", display: "swap", preload: false });

/** Not a big screen with a mouse: the phone fonts (globals.css). */
const PHONE_MEDIA = "not all and (min-width: 1024px) and (hover: hover) and (pointer: fine)";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.legalName} | Električar, Novi Sad`, template: `%s | ${site.name}` },
  description: "Električar koji dođe kad kaže. Kvarovi, nove instalacije, razvodne table, rasveta i punjači za automobile u Novom Sadu. Cena pre početka rada, zapisnik posle.",
  applicationName: site.legalName,
  creator: agencyName,
  formatDetection: { telephone: false },
  robots: noindex ? { index: false, follow: false, googleBot: { index: false, follow: false } } : { index: true, follow: true },
  openGraph: { type: "website", siteName: site.legalName, locale: "sr_RS" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0c0d0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr-Latn" className={`${display.variable} ${sans.variable} ${mono.variable} ${hand.variable}`}>
      <body className="min-h-dvh">
        <link rel="preload" href="/fonts/geologica-phone.woff2" as="font" type="font/woff2" crossOrigin="anonymous" media={PHONE_MEDIA} />
        <link rel="preload" href="/fonts/instrument-phone.woff2" as="font" type="font/woff2" crossOrigin="anonymous" media={PHONE_MEDIA} />
        {children}
        <SmoothScroll />
      </body>
    </html>
  );
}
