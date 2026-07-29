"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { rs, stars, waLink } from "@/lib/format";

const FILTER_GROUPS = [
  { name: "Shape", key: "shape", opts: ["Almond", "Coffin", "Square", "Stiletto"] },
  { name: "Finish", key: "finish", opts: ["French", "Chrome", "Glitter", "Matte", "Glossy"] },
  { name: "Occasion", key: "occasion", opts: ["Bridal", "Party", "Everyday"] },
];

export default function ShopClient({ products, initialCat }) {
  const { addToCart, toggleWish, isWished } = useCart();
  const router = useRouter();
  const [filters, setFilters] = useState({ shape: [], finish: [], occasion: [] });
  const [sort, setSort] = useState("Popularity");
  const [quick, setQuick] = useState(null);
  const [search, setSearch] = useState("");
  const [priceMax, setPriceMax] = useState(6000);

  function toggleFilter(group, val) {
    setFilters((f) => {
      const cur = f[group];
      return { ...f, [group]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });
  }
  function clearFilters() {
    setFilters({ shape: [], finish: [], occasion: [] });
    setPriceMax(6000);
  }

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      if (initialCat && p.categorySlug !== initialCat) return false;
      if (filters.shape.length && !filters.shape.includes(p.shape)) return false;
      if (filters.finish.length && !filters.finish.some((x) => p.finish.toLowerCase().includes(x.toLowerCase()))) return false;
      if (filters.occasion.length && !filters.occasion.includes(p.occasion)) return false;
      if (p.price > priceMax) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.colorway.toLowerCase().includes(q) && !p.blurb?.toLowerCase().includes(q)) return false;
      return true;
    });
    list = list.slice().sort((a, b) =>
      sort === "Price: low to high" ? a.price - b.price
      : sort === "Price: high to low" ? b.price - a.price
      : sort === "Rating" ? b.rating - a.rating
      : sort === "Newest" ? b.sortOrder - a.sortOrder
      : b.reviewsCount - a.reviewsCount
    );
    return list;
  }, [products, filters, sort, initialCat, search, priceMax]);

  const quickP = quick ? products.find((p) => p.slug === quick) : null;

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "44px 24px 90px" }}>
      <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.35)", marginBottom: 18 }}>Home / Shop / All sets</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", borderBottom: "1px solid rgba(227,183,166,.14)", paddingBottom: 26, marginBottom: 34 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 48, margin: 0 }}>All press-on sets</h1>
          <div style={{ fontSize: 12.5, color: "rgba(247,241,237,.45)", marginTop: 10 }}>{shown.length} sets · every set fitted to your nail sizes</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sets…" style={{ background: "var(--panel)", color: "var(--ink)", border: "1px solid rgba(227,183,166,.28)", padding: "11px 16px", fontSize: 12.5, outline: "none", width: 190 }} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: "var(--panel)", color: "var(--ink)", border: "1px solid rgba(227,183,166,.28)", padding: "11px 14px", fontSize: 12.5, outline: "none" }}>
            <option>Popularity</option>
            <option>Newest</option>
            <option>Price: low to high</option>
            <option>Price: high to low</option>
            <option>Rating</option>
          </select>
        </div>
      </div>

      <div data-r="sidebar" style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 44, alignItems: "start" }}>
        <aside style={{ position: "sticky", top: 110 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)" }}>Filters</div>
            <div onClick={clearFilters} style={{ cursor: "pointer", fontSize: 11, color: "rgba(247,241,237,.4)", borderBottom: "1px solid rgba(247,241,237,.2)" }}>Clear</div>
          </div>
          {FILTER_GROUPS.map((g) => (
            <div key={g.key} style={{ borderTop: "1px solid rgba(227,183,166,.14)", padding: "20px 0" }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.55)", marginBottom: 14 }}>{g.name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {g.opts.map((o) => {
                  const on = filters[g.key].includes(o);
                  return (
                    <div key={o} onClick={() => toggleFilter(g.key, o)} className="pill" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: on ? "var(--rose-light)" : "rgba(247,241,237,.7)" }}>
                      <span style={{ width: 15, height: 15, border: "1px solid rgba(227,183,166,.4)", display: "grid", placeItems: "center", fontSize: 9, color: "var(--rose-light)" }}>{on ? "✓" : ""}</span>{o}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(227,183,166,.14)", padding: "20px 0" }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.55)", marginBottom: 16 }}>Price range</div>
            <input type="range" min="2000" max="6000" step="100" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--bronze)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "rgba(247,241,237,.45)", marginTop: 8 }}><span>Rs 2,000</span><span>Rs {priceMax.toLocaleString()}</span></div>
          </div>
          <a href={waLink("Hi! I want a custom set")} target="_blank" rel="noreferrer" className="btn-wa" style={{ display: "block", marginTop: 14, padding: 14, textAlign: "center", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" }}>Want custom? WhatsApp</a>
        </aside>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
          {shown.map((p) => {
            const wished = isWished(p.slug);
            return (
              <div key={p.slug} className="card">
                <div className="zoom-wrap" style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden" }}>
                  <Link href={`/product/${p.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                    <img src={p.image} alt={p.name} className="zoom" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Link>
                  {p.stock === 0 && <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(10,10,11,.88)", border: "1px solid rgba(200,90,90,.4)", fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", padding: "6px 11px", color: "#E39B9B" }}>Sold out</div>}
                  <div onClick={() => toggleWish(p.slug)} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(10,10,11,.75)", border: "1px solid rgba(227,183,166,.28)", color: "var(--rose)", fontSize: 15, cursor: "pointer" }}>{wished ? "♥" : "♡"}</div>
                  {p.stock > 0 && <div onClick={() => setQuick(p.slug)} style={{ position: "absolute", bottom: 12, left: 12, right: 12, textAlign: "center", background: "rgba(10,10,11,.86)", border: "1px solid rgba(227,183,166,.3)", padding: 11, fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--rose-light)", cursor: "pointer" }}>Quick view</div>}
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)" }}>{p.shape} · {p.length} · {p.occasion}</div>
                  <Link href={`/product/${p.slug}`} style={{ display: "block", color: "var(--ink)", fontFamily: "var(--serif)", fontSize: 22, margin: "9px 0 8px" }}>{p.name}</Link>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14.5, color: "var(--rose-light)" }}>{rs(p.price)}</span>
                    <span style={{ fontSize: 11.5, color: "rgba(247,241,237,.45)" }}><span style={{ color: "var(--bronze)" }}>{stars(p.rating)}</span> {p.rating}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {shown.length === 0 && (
            <div style={{ gridColumn: "1/-1", border: "1px dashed rgba(227,183,166,.25)", padding: 40, textAlign: "center", color: "rgba(247,241,237,.5)", fontSize: 13.5 }}>No sets match these filters. <span onClick={clearFilters} style={{ cursor: "pointer", color: "var(--rose)" }}>Clear filters</span></div>
          )}
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      {quickP && (
        <div onClick={() => setQuick(null)} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(4,4,5,.85)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 24 }}>
          <div data-r="modal" onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid rgba(227,183,166,.3)", maxWidth: 820, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <img src={quickP.image} alt={quickP.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ padding: 36 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)" }}>Quick view</div>
                <div onClick={() => setQuick(null)} style={{ cursor: "pointer", fontSize: 22, color: "rgba(247,241,237,.5)" }}>×</div>
              </div>
              <h3 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 36, margin: "14px 0 10px" }}>{quickP.name}</h3>
              <div style={{ fontSize: 12.5, color: "rgba(247,241,237,.5)" }}>{quickP.shape} · {quickP.length} · {quickP.colorway}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--rose-light)", margin: "18px 0" }}>{rs(quickP.price)}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "rgba(247,241,237,.58)", fontWeight: 300 }}>{quickP.blurb}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                <div onClick={() => { addToCart({ slug: quickP.slug, name: quickP.name, image: quickP.image, price: quickP.price, size: "Medium set" }, 1); setQuick(null); }} className="gradient-warm" style={{ cursor: "pointer", textAlign: "center", padding: 15, fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase" }}>Add to bag</div>
                <div onClick={() => router.push(`/product/${quickP.slug}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid rgba(227,183,166,.3)", padding: 15, fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.75)" }}>Full details</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
