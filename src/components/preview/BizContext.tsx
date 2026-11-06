"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Biz } from "@/lib/biz-core";
import { defaultBiz } from "@/lib/biz";

const BizContext = createContext<Biz>(defaultBiz);

/** Client components read the business from here; without a provider it's the concept business. */
export function BizProvider({ biz, children }: { biz: Biz; children: ReactNode }) {
  return <BizContext.Provider value={biz}>{children}</BizContext.Provider>;
}

export const useBiz = () => useContext(BizContext);
