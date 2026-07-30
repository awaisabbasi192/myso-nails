"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartContext";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/bridal", label: "Bridal" },
  { href: "/custom", label: "Custom" },
  { href: "/gift-cards", label: "Gifts" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ announcement, user }) {
  const pathname = usePathname();
  const { cartCount, wishCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Announcement bar — continuous scrolling ticker */}
      <div className="announce-bar shimmer">
        <div className="announce-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="announce-item">{announcement}</span>
          ))}
        </div>
      </div>

      <header style={{ position: "sticky", top: 0, zIndex: 80, background: "rgba(10,10,11,.94)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(227,183,166,.14)" }}>
        {/* Desktop header */}
        <div className="header-desktop" style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0, position: "relative", height: 50, width: 100 }}>
            <Image src="/assets/logo.png" alt="Myso Nails Studio" fill style={{ objectFit: "contain" }} />
          </Link>

          <nav className="desktop-nav" style={{ display: "flex", gap: 16, marginLeft: 6, flexWrap: "nowrap" }}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="nav-link" style={{ whiteSpace: "nowrap", ...(pathname === n.href ? { color: "var(--rose-light)", borderBottom: "1px solid var(--bronze)" } : {}) }}>
                {n.label}
              </Link>
            ))}
            {user?.role === "admin" ? (
              <Link href="/admin" className="nav-link accent" style={{ whiteSpace: "nowrap" }}>Admin</Link>
            ) : user ? (
              <Link href="/account" className="nav-link accent" style={{ whiteSpace: "nowrap" }}>{user.name?.split(" ")[0] || "Account"}</Link>
            ) : (
              <Link href="/login" className="nav-link accent" style={{ whiteSpace: "nowrap" }}>Login</Link>
            )}
          </nav>

          <div style={{ flex: 1, minWidth: 12 }} />

          <div className="header-search" style={{ flexShrink: 0 }}>
            <SearchBar style={{ width: 160 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <ThemeToggle />
            <Link href="/wishlist" aria-label="Wishlist" style={{ position: "relative", fontSize: 18, color: "var(--rose)" }}>
              ♡
              {wishCount > 0 && <span style={{ position: "absolute", top: -6, right: -9, fontFamily: "var(--sans)", fontSize: 9, background: "var(--rose)", color: "#fff", borderRadius: 9, padding: "1px 5px" }}>{wishCount}</span>}
            </Link>
            <Link href="/cart" className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 16px", borderRadius: 2 }}>
              <span style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase" }}>Bag</span>
              <span style={{ fontSize: 11, color: "var(--rose)" }}>({cartCount})</span>
            </Link>
          </div>
        </div>

        {/* Mobile header */}
        <div className="header-mobile" style={{ display: "none", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 58 }}>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", display: "flex", flexDirection: "column", gap: 5 }}
            aria-label="Menu"
          >
            <span style={{ display: "block", width: 22, height: 1.5, background: "var(--rose)", transition: "all .25s", transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none", borderRadius: 2 }} />
            <span style={{ display: "block", width: 22, height: 1.5, background: "var(--ink)", transition: "all .25s", opacity: mobileOpen ? 0 : 1, borderRadius: 2 }} />
            <span style={{ display: "block", width: 22, height: 1.5, background: "var(--rose)", transition: "all .25s", transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none", borderRadius: 2 }} />
          </button>

          {/* Logo center */}
          <Link href="/" style={{ display: "flex", alignItems: "center", position: "relative", height: 40, width: 90 }}>
            <Image src="/assets/logo.png" alt="Myso Nails Studio" fill style={{ objectFit: "contain" }} />
          </Link>

          {/* Dark mode toggle + Cart */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle />
            <Link href="/cart" style={{ position: "relative", padding: "8px 4px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: 2, right: -2, fontFamily: "var(--sans)", fontSize: 9, fontWeight: 600, background: "var(--rose)", color: "#fff", borderRadius: 10, padding: "1px 5px", lineHeight: 1.4 }}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile full-screen drawer */}
      {mobileOpen && (
        <div className="mobile-drawer" style={{ position: "fixed", inset: 0, zIndex: 200, backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Drawer header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 58, borderBottom: "1px solid var(--header-border)" }}>
            <div className="text-gradient" style={{ fontFamily: "var(--serif)", fontSize: 22 }}>Menu</div>
            <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 26, color: "var(--ink-muted)", lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Search */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-b)" }}>
            <SearchBar autoFocus={false} onDone={() => setMobileOpen(false)} />
          </div>

          {/* Nav links */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "17px 24px",
                  fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300,
                  color: pathname === n.href ? "var(--rose)" : "var(--ink)",
                  borderBottom: "1px solid var(--card-b)",
                  transition: "color .2s",
                }}
              >
                {n.label}
                {pathname === n.href && <span style={{ fontSize: 14, color: "var(--rose)" }}>●</span>}
              </Link>
            ))}
            <Link href={user?.role === "admin" ? "/admin" : user ? "/account" : "/login"} onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", padding: "17px 24px", fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300, color: "var(--rose)", borderBottom: "1px solid var(--card-b)" }}>
              {user?.role === "admin" ? "Admin panel" : user ? (user.name?.split(" ")[0] || "My account") : "Login / Signup"}
            </Link>
          </div>

          {/* Drawer footer */}
          <div style={{ padding: "20px 24px 32px", borderTop: "1px solid var(--header-border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Link href="/cart" onClick={() => setMobileOpen(false)} style={{ textAlign: "center", padding: "13px 16px", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>
              Bag ({cartCount})
            </Link>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || "923020909786"}?text=${encodeURIComponent("Hi Myso Nails! I'd like to place an order.")}`} target="_blank" rel="noreferrer" style={{ textAlign: "center", padding: "13px 16px", border: "1px solid rgba(37,211,102,.4)", color: "var(--ink)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
