import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function POST(request) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  try {
    const b = await request.json();
    const code = (b.code || "").trim().toUpperCase();
    if (!code) return Response.json({ error: "Code is required" }, { status: 400 });
    if (await prisma.coupon.findUnique({ where: { code } })) {
      return Response.json({ error: "That code already exists" }, { status: 409 });
    }
    const coupon = await prisma.coupon.create({
      data: {
        code,
        type: b.type === "flat" ? "flat" : "percentage",
        value: Number(b.value) || 0,
        minSpend: Number(b.minSpend) || 0,
        detail: b.detail || null,
        expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
        active: b.active !== false,
      },
    });
    return Response.json({ ok: true, coupon });
  } catch (e) {
    return Response.json({ error: "Could not create coupon" }, { status: 500 });
  }
}
