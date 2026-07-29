import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not logged in" }, { status: 401 });
  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
    if (order.customerId !== user.id) return Response.json({ error: "Not your order" }, { status: 403 });
    if (order.status !== "Pending") return Response.json({ error: "Only Pending orders can be cancelled" }, { status: 400 });
    await prisma.order.update({ where: { id }, data: { status: "Cancelled", cancelledAt: new Date() } });
    const adminPhone = process.env.ADMIN_WHATSAPP || process.env.NEXT_PUBLIC_WHATSAPP || "923020909786";
    const waText = `Hi Myso Nails! Order *${order.code}* has been cancelled by the customer (${order.customerName}).`;
    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waText)}`;
    return Response.json({ ok: true, waUrl });
  } catch (e) {
    return Response.json({ error: "Could not cancel order" }, { status: 500 });
  }
}
