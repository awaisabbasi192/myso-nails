import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    const b = await request.json();
    const data = {};
    if (b.name !== undefined) data.name = b.name;
    if (b.slug !== undefined) data.slug = b.slug;
    if (b.image !== undefined) data.image = b.image;
    if (b.sortOrder !== undefined) data.sortOrder = Number(b.sortOrder);
    if (b.showOnHome !== undefined) data.showOnHome = Boolean(b.showOnHome);
    const cat = await prisma.category.update({ where: { id }, data });
    return Response.json(cat);
  } catch (e) {
    return Response.json({ error: "Could not update category" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not delete category" }, { status: 500 });
  }
}
