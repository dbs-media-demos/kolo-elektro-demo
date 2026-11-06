import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeContent } from "@/components/home/HomeContent";
import { previewBiz } from "@/lib/preview";
import { L } from "@/lib/biz-core";

// Always the CRM's current data: an edit there shows on the next reload
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const biz = await previewBiz((await params).token);
  const robots = { index: false, follow: false, googleBot: { index: false, follow: false } };
  if (!biz) return { title: "Preview not found", robots };
  const place = [biz.address.city || biz.area, biz.address.region].filter(Boolean).join(", ");
  const title = L(biz, `${biz.name} | Electrician in ${place || biz.area}`, `${biz.name} | Električar, ${place || biz.area}`);
  const description = L(
    biz,
    `Callouts, rewiring, panels, lighting and EV chargers in ${biz.area}. The price before we start, a test report after. Call ${biz.phoneDisplay || "us"}.`,
    `Kvarovi, nove instalacije, razvodne table, rasveta i punjači za automobile — ${biz.area}. Cena pre početka rada, zapisnik posle. Pozovite ${biz.phoneDisplay || "nas"}.`,
  );
  return {
    title: { absolute: title },
    description,
    robots,
    alternates: { canonical: null },
    openGraph: { type: "website", siteName: biz.name, title, description, images: [] },
    twitter: { card: "summary", title, description },
  };
}

export default async function PreviewPage({ params }: Props) {
  const biz = await previewBiz((await params).token);
  if (!biz) notFound();
  return <HomeContent />;
}
