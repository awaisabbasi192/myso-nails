import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return Response.json(cats);
}

export async function POST(request) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  try {
    const b = await request.json();
    if (!b.name?.trim()) return Response.json({ error: "Name required" }, { status: 400 });
    const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
    const cat = await prisma.category.create({
      data: {
        name: b.name.trim(),
        slug,
        image: b.image || "/assets/p1-french.jpeg",
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        showOnHome: b.showOnHome !== false,
      },
    });
    return Response.json(cat);
  } catch (e) {
    if (e.code === "P2002") return Response.json({ error: "Slug already exists" }, { status: 409 });
    return Response.json({ error: "Could not create category" }, { status: 500 });
  }
}
