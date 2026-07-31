import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await request.json();
  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.launchAt !== undefined) data.launchAt = new Date(body.launchAt);
  if (body.image !== undefined) data.image = body.image;
  if (body.active !== undefined) data.active = Boolean(body.active);
  const drop = await prisma.drop.update({ where: { id }, data });
  return Response.json(drop);
}

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  await prisma.drop.delete({ where: { id } });
  return Response.json({ ok: true });
}
