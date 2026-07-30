"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ onDone, autoFocus = false, style }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  function go(e) {
    e?.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    onDone?.();
  }

  return (
    <form onSubmit={go} style={{ display: "flex", alignItems: "center", ...style }}>
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, pointerEvents: "none" }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          placeholder="Search sets…"
          aria-label="Search products"
          style={{ width: "100%", background: "var(--panel)", color: "var(--ink)", border: "1px solid var(--card-b)", padding: "10px 14px 10px 34px", fontSize: 12.5, outline: "none", borderRadius: 2 }}
        />
      </div>
    </form>
  );
}
