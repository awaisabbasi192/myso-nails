"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { rs, stars } from "@/lib/format";

export default function ProductCard({ p }) {
  const { addToCart, toggleWish, isWished } = useCart();
  const router = useRouter();
  const wished = isWished(p.slug);

  function add(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ slug: p.slug, name: p.name, image: p.image, price: p.price, size: "Medium set" }, 1);
  }
  function wish(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleWish(p.slug);
  }

  return (
    <div className="card zoom-wrap" style={{ background: "var(--panel)", borderRadius: 2, overflow: "hidden" }}>
      <Link href={`/product/${p.slug}`} style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", display: "block" }}>
        <Image src={p.image} alt={p.name} className="zoom" fill style={{ objectFit: "cover" }} />
        {p.badge && (
          <div style={{ position: "absolute", top: 14, left: 14, background: "var(--rose)", border: "none", fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", padding: "6px 11px", color: "#fff" }}>{p.badge}</div>
        )}
        <div onClick={wish} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: "50%", background: "var(--panel)", border: "1px solid var(--card-b)", color: "var(--rose)", fontSize: 15 }}>{wished ? "♥" : "♡"}</div>
      </Link>
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.42)" }}>{p.shape} · {p.finish}</div>
        <Link href={`/product/${p.slug}`} style={{ display: "block", color: "var(--ink)", fontFamily: "var(--serif)", fontSize: 23, margin: "9px 0 6px" }}>{p.name}</Link>
        <div style={{ fontSize: 11.5, color: "rgba(247,241,237,.5)", display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: "var(--bronze)" }}>{stars(p.rating)}</span> <span>{p.rating} ({p.reviewsCount})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <span style={{ fontSize: 15, color: "var(--rose-light)", letterSpacing: ".06em" }}>{rs(p.price)}</span>
            {p.wasPrice ? <span style={{ fontSize: 12, color: "rgba(247,241,237,.35)", textDecoration: "line-through" }}>{rs(p.wasPrice)}</span> : null}
          </div>
          <div onClick={add} className="add-btn" style={{ cursor: "pointer", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "10px 14px" }}>Add</div>
        </div>
      </div>
    </div>
  );
}
