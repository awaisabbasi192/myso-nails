import Image from "next/image";
import Link from "next/link";
import { waLink } from "@/lib/format";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--card-b)", background: "var(--panel-2)", padding: "60px 24px 30px" }}>
      <div data-r="footer" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ position: "relative", height: 70, width: 150 }}>
            <Image src="/assets/logo.png" alt="Myso Nails Studio" fill style={{ objectFit: "contain" }} />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.85, color: "var(--ink-muted)", fontWeight: 300, maxWidth: 290, margin: "18px 0 0" }}>
            Hand-painted press-on nail sets, custom bridal work and size-fitted reusable sets. Shipped nationwide from Lahore.
          </p>
        </div>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 18 }}>Shop</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, color: "var(--ink-muted)" }}>
            <Link href="/shop" style={{ color: "inherit" }}>All sets</Link>
            <Link href="/bridal" style={{ color: "inherit" }}>Bridal sets</Link>
            <Link href="/custom" style={{ color: "inherit" }}>Custom order</Link>
            <Link href="/gift-cards" style={{ color: "inherit" }}>Gift cards</Link>
            <Link href="/wishlist" style={{ color: "inherit" }}>My wishlist</Link>
            <Link href="/size-guide" style={{ color: "inherit" }}>Size guide</Link>
            <Link href="/track" style={{ color: "inherit" }}>Track my order</Link>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 18 }}>Help</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, color: "var(--ink-muted)" }}>
            <Link href="/faq" style={{ color: "inherit" }}>FAQ</Link>
            <Link href="/policies#delivery" style={{ color: "inherit" }}>Delivery &amp; shipping</Link>
            <Link href="/policies#refund" style={{ color: "inherit" }}>Refund &amp; returns</Link>
            <Link href="/policies#payment" style={{ color: "inherit" }}>Payment &amp; JazzCash</Link>
            <Link href="/policies" style={{ color: "inherit" }}>Terms &amp; policies</Link>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 18 }}>Talk to us</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, color: "var(--ink-muted)" }}>
            <a href={waLink()} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>WhatsApp 0302 090 9786</a>
            <a href="https://instagram.com/_myso.nails" target="_blank" rel="noreferrer" style={{ color: "inherit" }}>@_myso.nails</a>
            <div>Mon–Sat · 11am–9pm</div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "44px auto 0", paddingTop: 22, borderTop: "1px solid var(--card-b)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
        <div>© 2026 Myso Nails Studio</div>
        <div>JazzCash · 100% Advance Payment</div>
      </div>
    </footer>
  );
}
