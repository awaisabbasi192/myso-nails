import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(request) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const where = status && status !== "All" ? { status } : {};
    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    const rows = [
      ["Order Code", "Date", "Customer", "Phone", "City", "Address", "Items", "Subtotal", "Shipping", "Total", "Payment", "Status", "Tracking", "Coupon"].join(","),
      ...orders.map((o) => [
        o.code,
        o.createdAt.toISOString().slice(0, 10),
        `"${o.customerName.replace(/"/g, '""')}"`,
        o.phone,
        `"${o.city.replace(/"/g, '""')}"`,
        `"${o.address.replace(/"/g, '""')}"`,
        `"${o.items.map((i) => `${i.name} x${i.qty}`).join("; ").replace(/"/g, '""')}"`,
        o.subtotal,
        o.shipping,
        o.total,
        o.paymentMethod,
        o.status,
        o.trackingNumber || "",
        o.couponCode || "",
      ].join(",")),
    ].join("\n");
    return new Response(rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (e) {
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
