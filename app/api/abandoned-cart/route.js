import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Captures a logged-in customer's cart so we can send a recovery email if they
// don't complete checkout. Keyed by email; the latest snapshot replaces the old
// one and resets the reminder cycle.
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ ok: false });

    const { items, subtotal } = await request.json();
    if (!Array.isArray(items) || items.length === 0) return Response.json({ ok: false });

    const customer = await prisma.customer.findUnique({ where: { id: user.id }, select: { email: true, name: true } });
    if (!customer?.email) return Response.json({ ok: false });

    const snapshot = items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, image: i.image, slug: i.slug }));

    await prisma.abandonedCart.upsert({
      where: { email: customer.email },
      update: { items: JSON.stringify(snapshot), subtotal: Number(subtotal) || 0, name: customer.name, reminded: false, recovered: false },
      create: { email: customer.email, name: customer.name, items: JSON.stringify(snapshot), subtotal: Number(subtotal) || 0 },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
