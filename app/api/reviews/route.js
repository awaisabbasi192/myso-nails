import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const b = await request.json();
    if (!b.productId || !b.name?.trim() || !b.body?.trim()) return Response.json({ error: "Name and review required" }, { status: 400 });
    const rating = Math.max(1, Math.min(5, Number(b.rating) || 5));
    const review = await prisma.review.create({
      data: { productId: b.productId, name: b.name.trim(), body: b.body.trim(), rating },
    });
    await prisma.product.update({
      where: { id: b.productId },
      data: {
        reviewsCount: { increment: 1 },
        rating: {
          set: await prisma.review.aggregate({ where: { productId: b.productId }, _avg: { rating: true } }).then((r) => Math.round((r._avg.rating || 5) * 10) / 10),
        },
      },
    });
    return Response.json({ ok: true, review });
  } catch {
    return Response.json({ error: "Could not submit review" }, { status: 500 });
  }
}
