"use client";

// Only imported through loadGsap() in src/lib/motion.ts, never statically: phones never download it.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "expo.out", duration: 1.1 });

export { gsap, ScrollTrigger };
