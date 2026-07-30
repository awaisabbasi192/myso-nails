import Link from "next/link";
import { waLink } from "@/lib/format";

export const metadata = {
  title: "Lookbook — Myso Nails Studio",
  description: "Nail inspiration and styling ideas. Browse our lookbook for bridal, casual, festive and custom designs.",
};

const LOOKS = [
  {
    title: "Bridal Blush",
    tag: "Bridal",
    desc: "Soft pink almond nails with hand-painted gold foil — matched to dupatta colour from a reference photo.",
    img: "/assets/p4-nude.jpeg",
    shape: "Almond · Long",
    occasion: "Nikah / Walima",
    href: "/bridal",
  },
  {
    title: "French Classic",
    tag: "Everyday",
    desc: "A clean French tip in ivory and nude — understated, office-appropriate, and incredibly versatile.",
    img: "/assets/p1-french.jpeg",
    shape: "Oval · Medium",
    occasion: "Daily wear",
    href: "/shop",
  },
  {
    title: "Maroon Chrome",
    tag: "Festive",
    desc: "Deep maroon with mirror chrome finish — the set everyone orders for mehndi and dholak nights.",
    img: "/assets/p2-maroon.jpeg",
    shape: "Coffin · Long",
    occasion: "Mehndi / Dholak",
    href: "/shop",
  },
  {
    title: "Leopard Statement",
    tag: "Bold",
    desc: "Hand-painted leopard print in black and caramel — for the bride who wants her nails remembered.",
    img: "/assets/p3-leopard.jpeg",
    shape: "Stiletto · Extra long",
    occasion: "Barat / Party",
    href: "/custom",
  },
  {
    title: "Gallery Collection",
    tag: "Custom",
    desc: "Everything from florals to abstract art — if you can screenshot it, Maya can paint it.",
    img: "/assets/g1.jpeg",
    shape: "Any shape",
    occasion: "Custom order",
    href: "/custom",
  },
  {
    title: "Minimalist Nude",
    tag: "Bridal",
    desc: "Bare nail, sheer gloss, and barely-there shimmer — for brides who let the outfit do the talking.",
    img: "/assets/g2.jpeg",
    shape: "Almond · Short",
    occasion: "All functions",
    href: "/bridal",
  },
];

const label = { fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "var(--rose)" };

export default function LookbookPage() {
  return (
    <div>
      {/* HERO */}
      <section style={{ background: "var(--panel)", borderBottom: "1px solid var(--card-b)", padding: "80px 24px 72px", textAlign: "center" }}>
        <div style={{ ...label, marginBottom: 18 }}>Style inspiration</div>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: "clamp(40px,5.5vw,70px)", margin: "0 0 20px", lineHeight: 1.1 }}>
          The Lookbook
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink-muted)", maxWidth: 500, margin: "0 auto 32px" }}>
          Every set is hand-painted to order. Browse the looks below — then send us a screenshot of anything you love and we&apos;ll quote a custom version.
        </p>
        <a
          href={waLink("Hi! I want a custom nail design — let me send a reference photo.")}
          target="_blank"
          rel="noreferrer"
          className="shimmer"
          style={{ display: "inline-block", padding: "15px 36px", fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", borderRadius: 2 }}
        >
          Order a custom set
        </a>
      </section>

      {/* GRID */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "70px 24px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 28 }}>
          {LOOKS.map((look, i) => (
            <div
              key={look.title}
              className="scroll-reveal card-soft zoom-wrap"
              style={{ background: "var(--panel)", border: "1px solid var(--card-b)", borderRadius: 3, overflow: "hidden", animationDelay: `${i * 0.08}s` }}
            >
              {/* Image */}
              <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", background: "#0a0a0a" }}>
                <img
                  src={look.img}
                  alt={look.title}
                  className="zoom"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {/* Tag */}
                <div style={{ position: "absolute", top: 16, left: 16, background: "var(--rose)", color: "#fff", fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 2 }}>
                  {look.tag}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "24px 26px 28px" }}>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 26, margin: "0 0 10px", color: "var(--ink)" }}>
                  {look.title}
                </h2>
                <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "var(--ink-muted)", margin: "0 0 16px" }}>
                  {look.desc}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                  <span style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "5px 10px", color: "var(--rose)", borderRadius: 2 }}>
                    {look.shape}
                  </span>
                  <span style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "5px 10px", color: "var(--ink-muted)", borderRadius: 2 }}>
                    {look.occasion}
                  </span>
                </div>
                <Link
                  href={look.href}
                  style={{ display: "inline-block", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--rose)", borderBottom: "1px solid var(--rose)", paddingBottom: 4 }}
                >
                  Shop this look →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOM CTA */}
      <section style={{ background: "var(--panel)", borderTop: "1px solid var(--card-b)", padding: "90px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ ...label, marginBottom: 18 }}>Don&apos;t see your style?</div>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 46, margin: "0 0 20px" }}>
            We can paint anything.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink-muted)", marginBottom: 32 }}>
            Screenshot anything you love — from Pinterest, Instagram, real life — and send it on WhatsApp. Maya will quote you within an hour.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={waLink("Hi! I want a completely custom nail design. Let me send you a reference photo.")}
              target="_blank"
              rel="noreferrer"
              className="shimmer"
              style={{ padding: "16px 36px", fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", borderRadius: 2 }}
            >
              Send a reference photo
            </a>
            <Link href="/shop" className="btn-outline" style={{ padding: "16px 36px", fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", borderRadius: 2 }}>
              Shop ready sets
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
