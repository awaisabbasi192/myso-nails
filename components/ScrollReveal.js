"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveals `.scroll-reveal` / `.reveal-left` / `.reveal-right` sections as they
 * enter the viewport. Re-runs on every route change (Next.js client navigation
 * does NOT fire DOMContentLoaded again), and force-reveals everything after a
 * short fallback so content can never get stuck invisible.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll(".scroll-reveal, .reveal-left, .reveal-right")
    );
    if (els.length === 0) return;

    // If IntersectionObserver isn't available, just show everything.
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.07 }
    );

    els.forEach((el) => io.observe(el));

    // Safety net: never let a section stay invisible.
    const fallback = setTimeout(() => {
      els.forEach((el) => el.classList.add("revealed"));
    }, 1500);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [pathname]);

  return null;
}
