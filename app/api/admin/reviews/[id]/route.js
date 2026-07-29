import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    await prisma.review.delete({ where: { id } });
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
    const { verified } = await request.json();
    const review = await prisma.review.update({ where: { id }, data: { verified: !!verified } });
    return Response.json({ ok: true, review });
  } catch (e) {
    return Response.json({ error: "Could not update review" }, { status: 500 });
  }
}
