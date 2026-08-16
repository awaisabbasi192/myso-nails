"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rs } from "@/lib/format";

const KEY = "myso_recently_viewed";
const MAX = 8;

/**
 * Records the current product in localStorage and shows a strip of
 * previously-viewed products (excluding the current one). Purely client-side.
 */
export default function RecentlyViewed({ current }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { list = []; }

    // What we show = everything viewed before, minus the current product
    setItems(list.filter((p) => p.slug !== current.slug).slice(0, MAX));

    // Record the current product at the front (de-duplicated, capped)
    if (current?.slug) {
      const next = [current, ...list.filter((p) => p.slug !== current.slug)].slice(0, MAX + 1);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.slug]);

  if (items.length === 0) return null;

  return (
    <div style={{ marginTop: 70 }}>
      <h3 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 34, margin: "0 0 24px" }}>Recently viewed</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
        {items.map((p) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="card" style={{ display: "block" }}>
            <div style={{ aspectRatio: "1/1", overflow: "hidden" }}>
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--ink)" }}>{p.name}</span>
              <span style={{ fontSize: 13, color: "var(--rose-light)", whiteSpace: "nowrap" }}>{rs(p.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
