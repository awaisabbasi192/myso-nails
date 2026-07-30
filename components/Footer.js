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
            <Link href="/lookbook" style={{ color: "inherit" }}>Lookbook</Link>
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
            <div>Mon–Sat · 11am–9pm</div>
          </div>
          {/* Social icons */}
          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            {[
              { href: "https://instagram.com/_myso.nails", label: "Instagram", icon: "IG" },
              { href: "https://tiktok.com/@mysonails", label: "TikTok", icon: "TT" },
              { href: "https://pinterest.com/mysonails", label: "Pinterest", icon: "PT" },
            ].map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                style={{ width: 36, height: 36, border: "1px solid var(--card-b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, letterSpacing: ".12em", color: "var(--ink-muted)", borderRadius: 2, transition: "border-color .2s, color .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--rose)"; e.currentTarget.style.color = "var(--rose)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-b)"; e.currentTarget.style.color = "var(--ink-muted)"; }}
              >
                {icon}
              </a>
            ))}
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
