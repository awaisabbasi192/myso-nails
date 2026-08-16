import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Vercel Cron hits this endpoint on a schedule (see vercel.json). It emails a
// one-time reminder for carts that have been idle 2–24 hours and never ordered.
export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const idleSince = new Date(now - 2 * 60 * 60 * 1000);  // idle at least 2h
  const notOlderThan = new Date(now - 24 * 60 * 60 * 1000); // and no older than 24h

  const carts = await prisma.abandonedCart.findMany({
    where: { reminded: false, recovered: false, updatedAt: { lt: idleSince, gt: notOlderThan } },
    take: 50,
  });

  let sent = 0;
  for (const c of carts) {
    // If the customer ordered after this snapshot, mark recovered and skip
    const order = await prisma.order.findFirst({
      where: { customer: { email: c.email }, createdAt: { gt: c.updatedAt } },
      select: { id: true },
    });
    if (order) {
      await prisma.abandonedCart.update({ where: { id: c.id }, data: { recovered: true } }).catch(() => {});
      continue;
    }

    let items = [];
    try { items = JSON.parse(c.items || "[]"); } catch { items = []; }
    if (items.length === 0) continue;

    await sendAbandonedCartEmail(c.name, c.email, items, c.subtotal);
    await prisma.abandonedCart.update({ where: { id: c.id }, data: { reminded: true } }).catch(() => {});
    sent++;
  }

  return Response.json({ ok: true, checked: carts.length, sent });
}
