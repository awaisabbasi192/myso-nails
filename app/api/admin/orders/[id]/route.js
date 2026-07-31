import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { sendOrderStatusEmail } from "@/lib/email";

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

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: { select: { id: true, email: true } } },
  });

  const order = await prisma.order.update({ where: { id }, data });

  if (body.status && existing) {
    if (["Confirmed", "Shipped", "Delivered"].includes(body.status)) {
      const emailOrder = { ...existing, ...order, trackingNumber: data.trackingNumber ?? existing.trackingNumber };
      const customerEmail = existing.customer?.email || null;
      await sendOrderStatusEmail(emailOrder, existing.items, customerEmail);
    }
    // Award loyalty points on delivery: 1 point per Rs 10 spent
    if (body.status === "Delivered" && existing.status !== "Delivered" && existing.customer?.id) {
      const pts = Math.floor(existing.total / 10);
      if (pts > 0) await prisma.customer.update({ where: { id: existing.customer.id }, data: { points: { increment: pts } } }).catch(() => {});
    }
    // Trigger stock alerts if product restocked (handled separately)
  }

  return Response.json({ ok: true, order });
}

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return Response.json({ ok: true });
}
