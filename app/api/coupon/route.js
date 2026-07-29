import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") || "").trim().toUpperCase();
  const subtotal = Number(searchParams.get("subtotal") || 0);
  if (!code) return Response.json({ error: "Enter a code" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return Response.json({ error: "Invalid code" }, { status: 404 });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return Response.json({ error: "This code has expired" }, { status: 400 });
  if (subtotal < coupon.minSpend) return Response.json({ error: `Spend Rs ${coupon.minSpend.toLocaleString("en-PK")} to use this code` }, { status: 400 });

  const discount = coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Response.json({ ok: true, code: coupon.code, discount, detail: coupon.detail });
}
