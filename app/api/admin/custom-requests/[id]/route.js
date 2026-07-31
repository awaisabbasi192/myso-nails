import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const { status } = await request.json();
  const req = await prisma.customNailRequest.update({ where: { id }, data: { status } });
  return Response.json(req);
}

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  await prisma.customNailRequest.delete({ where: { id } });
  return Response.json({ ok: true });
}
