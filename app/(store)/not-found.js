import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "24px" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 80, fontWeight: 300, color: "var(--rose)", marginBottom: 16, fontFamily: "var(--serif)" }}>404</div>
        <h1 style={{ fontSize: 32, color: "var(--ink)", marginBottom: 12, fontFamily: "var(--serif)" }}>Page Not Found</h1>
        <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 32, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved. Don't worry, you can find everything you need below.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ padding: "12px 24px", background: "linear-gradient(100deg, #9B1B2A, #C4233D)", color: "#fff", textDecoration: "none", borderRadius: 2, fontSize: 13, letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 500 }}>
            Go Home
          </Link>
          <Link href="/shop" style={{ padding: "12px 24px", border: "1px solid var(--card-b)", color: "var(--ink)", textDecoration: "none", borderRadius: 2, fontSize: 13, letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 500 }}>
            View Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
