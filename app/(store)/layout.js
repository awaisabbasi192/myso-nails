import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import BottomNav from "@/components/BottomNav";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }) {
  let announcement = "Free delivery over Rs 5,000 · Handmade in Pakistan · Order on WhatsApp 0302 090 9786";
  let safeUser = null;
  let storeClosed = false;
  let storeClosedMsg = "We're temporarily closed. Check back soon!";
  let flashSalePercent = 0;
  try {
    const [content, user] = await Promise.all([
      prisma.siteContent.findUnique({ where: { id: 1 } }),
      getCurrentUser(),
    ]);
    announcement = content?.announcement || announcement;
    safeUser = user ? { id: user.id, name: user.name, role: user.role } : null;
    storeClosed = content?.storeClosed ?? false;
    storeClosedMsg = content?.storeClosedMsg || storeClosedMsg;
    flashSalePercent = content?.flashSalePercent ?? 0;
  } catch (e) {
    console.error("StoreLayout error:", e.message);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header announcement={announcement} user={safeUser} />

      {/* Store status / flash sale banners (admin-controlled) */}
      {storeClosed ? (
        <div style={{ background: "linear-gradient(100deg,#5E0F18,#9B1B2A)", color: "#fff", textAlign: "center", padding: "12px 20px", fontSize: 13, letterSpacing: ".05em", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15 }}>🚫</span>
          <span><strong style={{ letterSpacing: ".14em", textTransform: "uppercase", fontSize: 11 }}>Store Closed</strong> — {storeClosedMsg}</span>
        </div>
      ) : flashSalePercent > 0 ? (
        <div style={{ background: "linear-gradient(100deg,#9B1B2A,#C4233D 60%,#9B1B2A)", backgroundSize: "200% 100%", animation: "msShimmer 7s linear infinite", color: "#fff", textAlign: "center", padding: "12px 20px", fontSize: 13, letterSpacing: ".08em", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15 }}>⚡</span>
          <span><strong style={{ letterSpacing: ".16em", textTransform: "uppercase", fontSize: 11.5 }}>Flash Sale</strong> — {flashSalePercent}% OFF everything, automatically applied at checkout!</span>
        </div>
      ) : null}

      {children}
      <Footer />
      <WhatsAppFab />
      <BottomNav user={safeUser} />
    </div>
  );
}
