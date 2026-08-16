import { prisma } from "@/lib/prisma";

/**
 * Recomputes a product's public star rating from its VERIFIED reviews only,
 * so the number shown matches the reviews actually displayed. The reviewsCount
 * field is managed separately (incremented/decremented) so seeded marketing
 * totals are preserved rather than overwritten.
 */
export async function recomputeProductRating(productId) {
  if (!productId) return;
  const stats = await prisma.review.aggregate({
    where: { productId, verified: true },
    _avg: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.round((stats._avg.rating || 5) * 10) / 10 },
  }).catch(() => {});
}

/** Adjusts a product's reviewsCount by delta (clamped at 0). */
export async function bumpReviewsCount(productId, delta) {
  if (!productId || !delta) return;
  if (delta > 0) {
    await prisma.product.update({ where: { id: productId }, data: { reviewsCount: { increment: delta } } }).catch(() => {});
  } else {
    const p = await prisma.product.findUnique({ where: { id: productId }, select: { reviewsCount: true } });
    const next = Math.max(0, (p?.reviewsCount || 0) + delta);
    await prisma.product.update({ where: { id: productId }, data: { reviewsCount: next } }).catch(() => {});
  }
}
