import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const rules = await prisma.bundleRule.findMany({ orderBy: { minQty: "asc" } });
  return Response.json(rules);
}

export async function POST(request) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { name, minQty, discountPercent } = await request.json();
  if (!name || !minQty || !discountPercent) return Response.json({ error: "Missing fields" }, { status: 400 });
  const rule = await prisma.bundleRule.create({ data: { name, minQty: parseInt(minQty), discountPercent: parseInt(discountPercent) } });
  return Response.json(rule);
}
