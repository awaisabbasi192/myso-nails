"use client";
import { useEffect } from "react";

export default function CursorEffect() {
  useEffect(() => {
    // Only on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot  = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;

    let rx = 0, ry = 0;

    function move(e) {
      const x = e.clientX, y = e.clientY;
      dot.style.transform  = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      // ring follows with lerp applied via rAF
      rx += (x - rx) * 0.12;
      ry += (y - ry) * 0.12;
    }

    function lerp() {
      rx += (parseFloat(dot.style.left || 0) - rx) * 0.1;
      ry += (parseFloat(dot.style.top  || 0) - ry) * 0.1;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(lerp);
    }

    // Simpler: direct follow with CSS transition on ring
    function move2(e) {
      const x = e.clientX, y = e.clientY;
      dot.style.transform  = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    }

    // Scale ring on hover over interactive elements
    function onEnter() {
      ring.style.width = "60px";
      ring.style.height = "60px";
      ring.style.borderColor = "rgba(155,27,42,.8)";
      dot.style.transform += " scale(1.5)";
    }
    function onLeave() {
      ring.style.width = "38px";
      ring.style.height = "38px";
      ring.style.borderColor = "rgba(155,27,42,.5)";
    }

    document.addEventListener("mousemove", move2);
    document.querySelectorAll("a,button,[role='button'],[style*='cursor: pointer'],[style*='cursor:pointer']").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    // Button ripple on click
    function addRipple(e) {
      const btn = e.currentTarget;
      btn.classList.add("rippling");
      setTimeout(() => btn.classList.remove("rippling"), 600);
    }
    document.querySelectorAll(".shimmer,.gradient-warm,.btn-outline").forEach((btn) => {
      btn.classList.add("ripple-btn");
      btn.addEventListener("click", addRipple);
    });

    // Pulse CTA on first .shimmer button
    const firstCta = document.querySelector(".shimmer");
    if (firstCta) firstCta.classList.add("pulse-cta");

    return () => {
      document.removeEventListener("mousemove", move2);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
    </>
  );
}
