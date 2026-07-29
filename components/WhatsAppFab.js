"use client";

import { usePathname } from "next/navigation";
import { waLink } from "@/lib/format";

export default function WhatsAppFab() {
  const pathname = usePathname();
  // Hide on checkout & account — they have their own WhatsApp buttons and the
  // floating button overlaps the order summary / total on small screens.
  if (pathname === "/cart" || pathname?.startsWith("/account")) return null;

  return (
    <a
      href={waLink("Hi M&S!")}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-fab"
      style={{
        position: "fixed",
        bottom: 26,
        right: 26,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        gap: 11,
        background: "#25D366",
        color: "#06340F",
        padding: "14px 20px",
        borderRadius: 40,
        fontSize: 12.5,
        letterSpacing: ".1em",
        boxShadow: "0 14px 34px rgba(0,0,0,.5)",
        animation: "msPulse 2.6s infinite",
      }}
    >
      <span style={{ fontSize: 17 }}>✆</span> Order on WhatsApp
    </a>
  );
}
