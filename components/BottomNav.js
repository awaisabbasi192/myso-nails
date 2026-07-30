"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";

function IconHome({ active }) {
  const c = active ? "var(--rose)" : "var(--ink-muted)";
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? "rgba(155,27,42,.12)" : "none"} stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}
function IconShop({ active }) {
  const c = active ? "var(--rose)" : "var(--ink-muted)";
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
function IconBag({ active }) {
  const c = active ? "var(--rose)" : "var(--ink-muted)";
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}
function IconAccount({ active }) {
  const c = active ? "var(--rose)" : "var(--ink-muted)";
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

export default function BottomNav({ user }) {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const items = [
    { href: "/", label: "Home", icon: (a) => <IconHome active={a} />, exact: true },
    { href: "/shop", label: "Shop", icon: (a) => <IconShop active={a} /> },
    { href: "/cart", label: "Cart", icon: (a) => <IconBag active={a} />, badge: cartCount },
    { href: user ? "/account" : "/login", label: user ? (user.name?.split(" ")[0] || "Account") : "Login", icon: (a) => <IconAccount active={a} /> },
  ];

  return (
    <nav className="bottom-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--header-bg)", backdropFilter: "blur(20px)",
      borderTop: "1px solid var(--header-border)",
      display: "none",
      alignItems: "center",
      height: 64,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/";
        const isHome = item.exact && pathname === "/";
        const isActive = isHome || active;
        return (
          <Link
            key={item.label}
            href={item.href}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4, padding: "6px 0", position: "relative",
              textDecoration: "none",
            }}
          >
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.icon(isActive)}
              {item.badge > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -7,
                  background: "var(--rose)", color: "#fff",
                  fontSize: 8, fontWeight: 600, borderRadius: 10,
                  padding: "1px 4px", lineHeight: 1.4, fontFamily: "var(--sans)",
                  minWidth: 14, textAlign: "center",
                }}>{item.badge}</span>
              )}
            </div>
            <span style={{
              fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase",
              color: isActive ? "var(--rose)" : "var(--ink-muted)",
              fontFamily: "var(--sans)", transition: "color .2s",
            }}>{item.label}</span>
            {isActive && (
              <span style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 2, background: "var(--rose)", borderRadius: "0 0 2px 2px",
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
