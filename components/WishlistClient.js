"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import ProductCard from "./ProductCard";

const label = { fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "var(--rose)" };

export default function WishlistClient({ products }) {
  const { wishlist, ready } = useCart();
  const items = ready ? products.filter((p) => wishlist.includes(p.slug)) : [];

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "44px 24px 90px" }}>
      <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 18 }}>
        Home / Wishlist
      </div>
      <div style={{ borderBottom: "1px solid var(--card-b)", paddingBottom: 26, marginBottom: 34 }}>
        <div style={{ ...label, marginBottom: 12 }}>Saved for later</div>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 48, margin: 0 }}>
          My Wishlist {ready && items.length > 0 ? <span style={{ fontSize: 22, color: "var(--rose)" }}>({items.length})</span> : null}
        </h1>
      </div>

      {!ready ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--ink-muted)", fontSize: 14 }}>Loading your saved sets…</div>
      ) : items.length === 0 ? (
        <div style={{ border: "1px dashed var(--card-b)", borderRadius: 3, padding: "70px 30px", textAlign: "center", background: "var(--panel)" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>♡</div>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 30, margin: "0 0 12px" }}>Your wishlist is empty</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--ink-muted)", maxWidth: 380, margin: "0 auto 28px" }}>
            Tap the heart on any set to save it here — build your dream collection and come back anytime.
          </p>
          <Link href="/shop" className="shimmer" style={{ display: "inline-block", padding: "15px 34px", fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", borderRadius: 2 }}>
            Browse the sets
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 22 }}>
          {items.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
