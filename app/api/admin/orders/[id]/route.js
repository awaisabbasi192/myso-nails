import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

const VALID = ["Pending", "Confirmed", "Shipped", "Delivered", "Rejected", "Cancelled"];

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await request.json();
  const data = {};
  if (body.status !== undefined) {
    if (!VALID.includes(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
    data.status = body.status;
  }
  if (body.trackingNumber !== undefined) data.trackingNumber = body.trackingNumber || null;
  const order = await prisma.order.update({ where: { id }, data });
  return Response.json({ ok: true, order });
}

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return Response.json({ ok: true });
}
