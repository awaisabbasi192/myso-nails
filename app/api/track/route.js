import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { code, phone } = await request.json();
    if (!code?.trim() || !phone?.trim()) return Response.json({ error: "Order code and phone required" }, { status: 400 });
    const order = await prisma.order.findFirst({
      where: { code: code.trim().toUpperCase(), phone: { contains: phone.trim().replace(/\D/g, "").slice(-7) } },
      include: { items: true },
    });
    if (!order) return Response.json({ error: "Order not found. Check your order code and phone number." }, { status: 404 });
    return Response.json({
      code: order.code, status: order.status, total: order.total,
      createdAt: order.createdAt, city: order.city,
      items: order.items.map((it) => ({ name: it.name, qty: it.qty, image: it.image })),
    });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
