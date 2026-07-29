import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    const b = await request.json();
    const data = {};
    if (b.active !== undefined) data.active = !!b.active;
    if (b.value !== undefined) data.value = Number(b.value);
    if (b.minSpend !== undefined) data.minSpend = Number(b.minSpend);
    if (b.detail !== undefined) data.detail = b.detail;
    if (b.type !== undefined) data.type = b.type;
    if (b.expiresAt !== undefined) data.expiresAt = b.expiresAt ? new Date(b.expiresAt) : null;
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return Response.json({ ok: true, coupon });
  } catch (e) {
    return Response.json({ error: "Could not update coupon" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });
  return Response.json({ ok: true });
}
