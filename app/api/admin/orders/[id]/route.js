import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { sendOrderStatusEmail, sendGiftCardEmail } from "@/lib/email";

const VALID = ["Pending", "Confirmed", "Shipped", "Delivered", "Rejected", "Cancelled"];
const CANCELLED = ["Rejected", "Cancelled"];

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await request.json();
  const data = {};
  if (body.status !== undefined) {
    if (!VALID.includes(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
    data.status = body.status;
    if (CANCELLED.includes(body.status)) data.cancelledAt = new Date();
  }
  if (body.trackingNumber !== undefined) data.trackingNumber = body.trackingNumber || null;

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: { select: { id: true, email: true } } },
  });

  const order = await prisma.order.update({ where: { id }, data });

  if (body.status && existing && body.status !== existing.status) {
    const changing = body.status;
    const custId = existing.customer?.id;

    // Customer status emails
    if (["Confirmed", "Shipped", "Delivered"].includes(changing)) {
      const emailOrder = { ...existing, ...order, trackingNumber: data.trackingNumber ?? existing.trackingNumber };
      await sendOrderStatusEmail(emailOrder, existing.items, existing.customer?.email || null);
    }

    // On confirmation — activate & deliver any gift cards purchased in this order
    if (changing === "Confirmed") {
      const cards = await prisma.giftCard.findMany({ where: { orderCode: existing.code, active: false } });
      for (const c of cards) {
        await prisma.giftCard.update({ where: { id: c.id }, data: { active: true } }).catch(() => {});
        if (c.buyerEmail) sendGiftCardEmail(c, c.buyerEmail).catch(() => {});
      }
    }

    // On delivery — award loyalty points (1 per Rs 10) and record them so they can be reversed
    if (changing === "Delivered" && existing.status !== "Delivered" && custId && existing.pointsEarned === 0) {
      const pts = Math.floor(existing.total / 10);
      if (pts > 0) {
        await prisma.customer.update({ where: { id: custId }, data: { points: { increment: pts } } }).catch(() => {});
        await prisma.order.update({ where: { id }, data: { pointsEarned: pts } }).catch(() => {});
      }
    }

    // On cancel/reject (from a non-cancelled state) — refund points, restore stock & gift card balance
    if (CANCELLED.includes(changing) && !CANCELLED.includes(existing.status)) {
      if (custId) {
        // Refund points the customer spent, and claw back points they earned (if it was delivered)
        const delta = (existing.pointsRedeemed || 0) - (existing.pointsEarned || 0);
        if (delta !== 0) {
          await prisma.customer.update({ where: { id: custId }, data: { points: { increment: delta } } }).catch(() => {});
        }
      }
      // Restore product stock
      for (const it of existing.items) {
        if (it.productId) await prisma.product.update({ where: { id: it.productId }, data: { stock: { increment: it.qty } } }).catch(() => {});
      }
      // Restore gift card balance that was redeemed
      if (existing.giftCardCode && existing.giftCardUsed > 0) {
        await prisma.giftCard.update({ where: { code: existing.giftCardCode }, data: { balance: { increment: existing.giftCardUsed }, active: true } }).catch(() => {});
      }
    }
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
