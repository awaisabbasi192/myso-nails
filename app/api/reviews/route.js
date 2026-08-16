import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { recomputeProductRating, bumpReviewsCount } from "@/lib/reviews";

export async function POST(request) {
  try {
    const b = await request.json();
    if (!b.productId || !b.name?.trim() || !b.body?.trim()) return Response.json({ error: "Name and review required" }, { status: 400 });
    const rating = Math.max(1, Math.min(5, Number(b.rating) || 5));

    // A review auto-publishes only if it comes from a verified buyer —
    // a logged-in customer who has a delivered order containing this product.
    // Everyone else's review is held for admin approval (verified = false).
    const user = await getCurrentUser();
    let verified = false;
    if (user) {
      const boughtIt = await prisma.order.findFirst({
        where: { customerId: user.id, status: "Delivered", items: { some: { productId: b.productId } } },
        select: { id: true },
      });
      if (boughtIt) verified = true;
    }

    const review = await prisma.review.create({
      data: {
        productId: b.productId,
        name: b.name.trim(),
        body: b.body.trim(),
        rating,
        image: b.image || null,
        image2: b.image2 || null,
        verified,
      },
    });

    // Public rating tracks verified reviews; count only grows for published ones.
    await recomputeProductRating(b.productId);
    if (verified) await bumpReviewsCount(b.productId, 1);

    return Response.json({ ok: true, review, verified });
  } catch {
    return Response.json({ error: "Could not submit review" }, { status: 500 });
  }
}
