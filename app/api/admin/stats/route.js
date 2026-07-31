import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const { deny } = await requireAdmin();
  if (deny) return deny;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [allOrders, thisMonth, lastMonth, statusCounts, topProducts] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { createdAt: { gte: thisMonthStart } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } }, _sum: { total: true }, _count: true }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.orderItem.groupBy({
      by: ["name", "image"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
  ]);

  // Revenue by month (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const result = await prisma.order.aggregate({
      where: { createdAt: { gte: start, lt: end }, status: { notIn: ["Rejected", "Cancelled"] } },
      _sum: { total: true },
      _count: true,
    });
    monthlyData.push({
      month: start.toLocaleString("default", { month: "short", year: "2-digit" }),
      revenue: result._sum.total || 0,
      orders: result._count,
    });
  }

  return Response.json({
    allTime: { revenue: allOrders._sum.total || 0, orders: allOrders._count },
    thisMonth: { revenue: thisMonth._sum.total || 0, orders: thisMonth._count },
    lastMonth: { revenue: lastMonth._sum.total || 0, orders: lastMonth._count },
    statusCounts,
    topProducts,
    monthlyData,
  });
}
