import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    const b = await request.json();
    const data = {};
    for (const k of ["name", "image", "images", "shape", "finish", "occasion", "length", "badge", "colorway", "blurb"]) {
      if (b[k] !== undefined) data[k] = b[k];
    }
    if (b.price !== undefined) data.price = Number(b.price);
    if (b.wasPrice !== undefined) data.wasPrice = b.wasPrice ? Number(b.wasPrice) : null;
    if (b.stock !== undefined) data.stock = Number(b.stock);
    if (b.rating !== undefined) data.rating = Number(b.rating);
    if (b.reviewsCount !== undefined) data.reviewsCount = Number(b.reviewsCount);
    if (b.featured !== undefined) data.featured = !!b.featured;
    if (b.categoryId !== undefined) data.categoryId = b.categoryId || null;

    const product = await prisma.product.update({ where: { id }, data });
    return Response.json({ ok: true, product });
  } catch (e) {
    return Response.json({ error: "Could not update product" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Could not delete (it may have orders attached)" }, { status: 500 });
  }
}
