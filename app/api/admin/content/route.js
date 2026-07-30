import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function PUT(request) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  try {
    const b = await request.json();
    const data = {};
    const ALLOWED = ["heroHeadline", "heroScript", "heroImage", "announcement", "studioImage", "studioHeadline", "studioBody1", "studioBody2", "studioFounder", "studioRole", "aboutImage1", "aboutHeadline", "aboutBody1", "aboutBody2", "aboutArtistImg", "aboutArtistName", "aboutArtistBio", "aboutArtistSign", "waConfirmed", "waShipped", "waDelivered", "waRejected", "deliveryFee", "freeDeliveryOver", "codHandling", "storeClosed", "storeClosedMsg", "flashSalePercent", "instagramHandle", "instagramPosts"];
    // These DB columns are Int/Boolean — coerce so string form values don't crash Prisma.
    const INT_FIELDS = ["deliveryFee", "freeDeliveryOver", "codHandling", "flashSalePercent"];
    const BOOL_FIELDS = ["storeClosed"];
    for (const k of ALLOWED) {
      if (b[k] === undefined) continue;
      if (INT_FIELDS.includes(k)) data[k] = parseInt(b[k], 10) || 0;
      else if (BOOL_FIELDS.includes(k)) data[k] = Boolean(b[k]);
      else data[k] = b[k];
    }
    const content = await prisma.siteContent.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        heroHeadline: b.heroHeadline || "Nails that finish the whole look.",
        heroScript: b.heroScript || "effortlessly luxe",
        heroImage: b.heroImage || "/assets/p1-french.jpeg",
        announcement: b.announcement || "Free delivery over Rs 5,000 · Handmade in Pakistan",
        studioImage: b.studioImage || "/assets/p4-nude.jpeg",
        studioHeadline: b.studioHeadline || "Every set is painted by hand — mine.",
        studioBody1: b.studioBody1 || "I started M&S in my bedroom with one brush and a lamp.",
        studioBody2: b.studioBody2 || "If you can send me a photo of it, I can paint it.",
        studioFounder: b.studioFounder || "Maya",
        studioRole: b.studioRole || "Founder & nail artist",
      },
    });
    return Response.json({ ok: true, content });
  } catch (e) {
    return Response.json({ error: "Could not save content" }, { status: 500 });
  }
}
