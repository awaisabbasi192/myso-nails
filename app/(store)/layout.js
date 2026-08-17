import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import BottomNav from "@/components/BottomNav";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getActiveDeal, dealTheme } from "@/lib/deal";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }) {
  let announcement = "Free delivery over Rs 5,000 · Handmade in Pakistan · Order on WhatsApp 0302 090 9786";
  let safeUser = null;
  let storeClosed = false;
  let storeClosedMsg = "We're temporarily closed. Check back soon!";
  let deal = { active: false };
  try {
    const [content, user] = await Promise.all([
      prisma.siteContent.findUnique({ where: { id: 1 } }),
      getCurrentUser(),
    ]);
    announcement = content?.announcement || announcement;
    safeUser = user ? { id: user.id, name: user.name, role: user.role } : null;
    storeClosed = content?.storeClosed ?? false;
    storeClosedMsg = content?.storeClosedMsg || storeClosedMsg;
    deal = await getActiveDeal(content);
  } catch (e) {
    console.error("StoreLayout error:", e.message);
  }

  const dt = deal.active ? dealTheme(deal.theme) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header announcement={announcement} user={safeUser} />

      {/* Store status / promotional deal banner (admin-controlled) */}
      {storeClosed ? (
        <div style={{ background: "linear-gradient(100deg,#5E0F18,#9B1B2A)", color: "#fff", textAlign: "center", padding: "12px 20px", fontSize: 13, letterSpacing: ".05em", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15 }}>🚫</span>
          <span><strong style={{ letterSpacing: ".14em", textTransform: "uppercase", fontSize: 11 }}>Store Closed</strong> — {storeClosedMsg}</span>
        </div>
      ) : deal.active ? (
        <div className="deal-banner" style={{ background: dt.grad, backgroundSize: "200% 100%", animation: "msShimmer 7s linear infinite", color: dt.text, textAlign: "center", padding: "11px 18px", fontSize: 13, letterSpacing: ".04em", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", lineHeight: 1.5 }}>
          <span style={{ fontSize: 16 }}>{dt.emoji}</span>
          <span className="deal-banner-text">
            <strong style={{ letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12 }}>{deal.title}</strong>
            {deal.subtitle ? <span> — {deal.subtitle}</span> : <span> — {deal.percent}% OFF everything</span>}
            {deal.remaining != null && (
              <strong style={{ marginLeft: 8, padding: "2px 9px", borderRadius: 20, background: "rgba(255,255,255,.22)", fontSize: 11, letterSpacing: ".08em", whiteSpace: "nowrap" }}>
                {deal.remaining === 1 ? "Last 1 left!" : `Only ${deal.remaining} left!`}
              </strong>
            )}
          </span>
        </div>
      ) : null}

      {children}
      <Footer />
      <WhatsAppFab />
      <BottomNav user={safeUser} />
    </div>
  );
}
