import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { recomputeProductRating, bumpReviewsCount } from "@/lib/reviews";

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    const review = await prisma.review.findUnique({ where: { id }, select: { productId: true, verified: true } });
    await prisma.review.delete({ where: { id } });
    if (review?.productId) {
      if (review.verified) await bumpReviewsCount(review.productId, -1);
      await recomputeProductRating(review.productId);
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Could not delete review" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    const body = await request.json();
    const data = {};
    if (body.verified !== undefined) data.verified = !!body.verified;
    if (body.body !== undefined) data.body = body.body;
    if (body.rating !== undefined) data.rating = parseInt(body.rating);
    if (body.name !== undefined) data.name = body.name;

    // Track a verified state change so the public reviewsCount stays correct
    let prev = null;
    if (body.verified !== undefined) {
      prev = await prisma.review.findUnique({ where: { id }, select: { verified: true } });
    }
    const review = await prisma.review.update({ where: { id }, data });

    if (body.verified !== undefined && prev && prev.verified !== data.verified) {
      await bumpReviewsCount(review.productId, data.verified ? 1 : -1);
    }
    // Verifying/hiding or changing a rating changes the product's public star rating
    if (body.verified !== undefined || body.rating !== undefined) await recomputeProductRating(review.productId);
    return Response.json({ ok: true, review });
  } catch (e) {
    return Response.json({ error: "Could not update review" }, { status: 500 });
  }
}
