import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { BizProvider } from "@/components/preview/BizContext";
import { PreviewGuard } from "@/components/preview/PreviewGuard";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { previewBiz } from "@/lib/preview";

/**
 * A personalised preview made in the Scale by Noon CRM: this demo's homepage with a real
 * business's name, phone, address, hours and rating, in its language (Serbian businesses get
 * the Serbian page, rendered on the server from i18n/sr). The token is the key; removing the
 * demo in the CRM makes the page 404.
 */
export default async function PreviewLayout({ children, params }: { children: ReactNode; params: Promise<{ token: string }> }) {
  const { token } = await params;
  const biz = await previewBiz(token);
  if (!biz) notFound();
  return (
    <BizProvider biz={biz}>
      <SiteChrome>{children}</SiteChrome>
      <PreviewGuard />
    </BizProvider>
  );
}
