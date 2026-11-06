"use client";

import { Hero } from "@/components/hero/Hero";
import { Plan } from "./Plan";
import { Services } from "./Services";
import { Faults } from "./Faults";
import { Prices } from "./Prices";
import { Process } from "./Process";
import { Work } from "./Work";
import { Report } from "./Report";
import { Reviews } from "./Reviews";
import { Faq } from "./Faq";
import { Area } from "./Area";
import { Contact } from "./Contact";

/** The homepage, shared by the concept site (/, /en) and personalised previews (/for/<token>). */
export function HomeContent() {
  return (
    <>
      <Hero />
      <Plan />
      <Services />
      <Faults />
      <Prices />
      <Process />
      <Work />
      <Report />
      <Reviews />
      <Faq />
      <Area />
      <Contact />
    </>
  );
}
