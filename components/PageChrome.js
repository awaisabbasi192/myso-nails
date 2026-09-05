"use client";

import { useEffect, useState } from "react";

/**
 * Thin reading-progress bar along the top of the page plus a
 * back-to-top button that fades in once you're a screen down.
 */
export default function PageChrome() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = null;
    function onScroll() {
      if (frame) return;                       // coalesce to one update per frame
      frame = requestAnimationFrame(() => {
        frame = null;
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
        setShowTop(window.scrollY > window.innerHeight * 0.9);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" style={{ width: progress + "%" }} />
      <button
        className={`back-to-top${showTop ? " show" : ""}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </>
  );
}
