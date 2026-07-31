import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await request.json();
  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.minQty !== undefined) data.minQty = parseInt(body.minQty);
  if (body.discountPercent !== undefined) data.discountPercent = parseInt(body.discountPercent);
  if (body.active !== undefined) data.active = Boolean(body.active);
  const rule = await prisma.bundleRule.update({ where: { id }, data });
  return Response.json(rule);
}

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  await prisma.bundleRule.delete({ where: { id } });
  return Response.json({ ok: true });
}
