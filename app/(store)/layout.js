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
  try {
    const [content, user] = await Promise.all([
      prisma.siteContent.findUnique({ where: { id: 1 } }),
      getCurrentUser(),
    ]);
    announcement = content?.announcement || announcement;
    safeUser = user ? { id: user.id, name: user.name, role: user.role } : null;
  } catch (e) {
    console.error("StoreLayout error:", e.message);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header announcement={announcement} user={safeUser} />
      {children}
      <Footer />
      <WhatsAppFab />
      <BottomNav user={safeUser} />
    </div>
  );
}
