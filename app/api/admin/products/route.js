import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  try {
    const b = await request.json();
    if (!b.name) return Response.json({ error: "Name is required" }, { status: 400 });

    let slug = slugify(b.name);
    if (await prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const count = await prisma.product.count();
    const product = await prisma.product.create({
      data: {
        slug,
        name: b.name,
        image: b.image || "/assets/p1-french.jpeg",
        images: b.images || "[]",
        price: Number(b.price) || 0,
        wasPrice: b.wasPrice ? Number(b.wasPrice) : null,
        shape: b.shape || "Almond",
        finish: b.finish || "Glossy",
        occasion: b.occasion || "Party",
        length: b.length || "Medium",
        badge: b.badge || null,
        colorway: b.colorway || "",
        blurb: b.blurb || "",
        rating: b.rating ? Number(b.rating) : 5,
        reviewsCount: b.reviewsCount ? Number(b.reviewsCount) : 0,
        stock: b.stock != null ? Number(b.stock) : 10,
        featured: !!b.featured,
        sortOrder: count + 1,
        categoryId: b.categoryId || null,
      },
    });
    return Response.json({ ok: true, product });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not create product" }, { status: 500 });
  }
}
