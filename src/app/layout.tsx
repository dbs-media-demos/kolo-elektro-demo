import type { Metadata, Viewport } from "next";
import { Caveat, Geologica, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./held.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { agencyName, noindex, site } from "@/lib/site";

// Headlines use "block": a late swap would re-wrap the big display lines and shift the page.
const display = Geologica({ subsets: ["latin", "latin-ext"], variable: "--font-geologica", display: "block" });
const sans = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-instrument", display: "swap" });
const mono = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin", "latin-ext"], variable: "--font-jetbrains", display: "swap", preload: false });
const hand = Caveat({ weight: "600", subsets: ["latin", "latin-ext"], variable: "--font-caveat", display: "swap", preload: false });

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
        {children}
        <SmoothScroll />
      </body>
    </html>
  );
}
