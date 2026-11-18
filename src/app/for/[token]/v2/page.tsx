import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeContent } from "@/components/home/HomeContent";
import { previewBiz } from "@/lib/preview";
import { generateMetadata as previewMetadata } from "../page";

// Always the CRM's current data, like /for/<token>
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

/** The lead's preview with the no-3D hero: same business, same page, same metadata. */
export async function generateMetadata(props: Props): Promise<Metadata> {
  return previewMetadata(props);
}

export default async function PreviewPageV2({ params }: Props) {
  const biz = await previewBiz((await params).token);
  if (!biz) notFound();
  return <HomeContent hero="v2" />;
}
