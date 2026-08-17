import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/account");

  const [orders, products, customers, coupons, content, categories, messages, subscribers, reviews, giftCards] = await Promise.all([
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ include: { category: true }, orderBy: { sortOrder: "asc" } }),
    prisma.customer.findMany({ where: { role: "customer" }, include: { orders: { select: { total: true, code: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" } }),
    prisma.coupon.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.siteContent.findUnique({ where: { id: 1 } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.review.findMany({ include: { product: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.giftCard.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueThisMonth = orders.filter((o) => o.createdAt >= monthStart && o.status !== "Rejected" && o.status !== "Cancelled").reduce((t, o) => t + o.total, 0);
  const pendingVerification = orders.filter((o) => o.status === "Pending").length;
  const lowStock = products.filter((p) => p.stock <= 3);

  // Daily revenue for last 14 days
  const revenueByDay = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    revenueByDay[d.toISOString().slice(0, 10)] = 0;
  }
  orders.forEach((o) => {
    if (o.status === "Rejected" || o.status === "Cancelled") return;
    const day = o.createdAt.toISOString().slice(0, 10);
    if (revenueByDay[day] !== undefined) revenueByDay[day] += o.total;
  });

  const kpis = {
    revenue: revenueThisMonth,
    orders: orders.length,
    customers: customers.length,
    pending: pendingVerification,
    lowStock: lowStock.length,
    lowStockName: lowStock[0]?.name || null,
    subscribers: subscribers.length,
    messages: messages.length,
    revenueChart: Object.entries(revenueByDay).map(([date, total]) => ({ date, total })),
  };

  const plainOrders = orders.map((o) => ({
    id: o.id, code: o.code, customerName: o.customerName, city: o.city, phone: o.phone,
    address: o.address, nailSizes: o.nailSizes, notes: o.notes,
    items: o.items.map((it) => `${it.name} ×${it.qty}`).join(", "),
    itemList: o.items.map((it) => ({ name: it.name, image: it.image, size: it.size, qty: it.qty, unitPrice: it.unitPrice })),
    total: o.total, subtotal: o.subtotal, shipping: o.shipping,
    status: o.status, paymentMethod: o.paymentMethod, paymentProof: o.paymentProof,
    trackingNumber: o.trackingNumber || null,
    couponCode: o.couponCode, date: fmtDate(o.createdAt),
    createdAt: o.createdAt.toISOString(),
  }));
  const plainProducts = products.map((p) => ({
    id: p.id, slug: p.slug, name: p.name, image: p.image, images: p.images, price: p.price, wasPrice: p.wasPrice,
    shape: p.shape, finish: p.finish, occasion: p.occasion, length: p.length, badge: p.badge,
    colorway: p.colorway, blurb: p.blurb, stock: p.stock, featured: p.featured,
    categoryId: p.categoryId, categoryName: p.category?.name || "—",
  }));
  const plainCustomers = customers.map((c) => ({
    id: c.id, name: c.name, email: c.email, phone: c.phone || "—", city: c.city || "—",
    orders: c.orders.length, spent: c.orders.reduce((t, o) => t + o.total, 0),
    orderList: c.orders.map((o) => ({ code: o.code, status: o.status, total: o.total, date: fmtDate(o.createdAt) })),
  }));
  const plainCoupons = coupons.map((c) => ({
    id: c.id, code: c.code, type: c.type, value: c.value, minSpend: c.minSpend,
    detail: c.detail, active: c.active, usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null,
  }));
  const plainCategories = categories.map((c) => ({
    id: c.id, name: c.name, slug: c.slug, image: c.image, sortOrder: c.sortOrder, showOnHome: c.showOnHome,
  }));
  const plainMessages = messages.map((m) => ({ id: m.id, name: m.name, phone: m.phone || "", topic: m.topic || "", body: m.body, date: fmtDate(m.createdAt) }));
  const plainSubscribers = subscribers.map((s) => ({ id: s.id, email: s.email, date: fmtDate(s.createdAt) }));
  const plainReviews = reviews.map((r) => ({
    id: r.id, productId: r.productId, productName: r.product?.name || "Unknown", productSlug: r.product?.slug || "",
    name: r.name, rating: r.rating, body: r.body, image: r.image, image2: r.image2, verified: r.verified, date: fmtDate(r.createdAt),
  }));
  const plainGiftCards = giftCards.map((g) => ({
    id: g.id, code: g.code, initialAmount: g.initialAmount, balance: g.balance,
    recipient: g.recipient, sender: g.sender, buyerEmail: g.buyerEmail, orderCode: g.orderCode,
    active: g.active, date: fmtDate(g.createdAt),
  }));

  const plainContent = content ? {
    heroHeadline: content.heroHeadline, heroScript: content.heroScript,
    heroImage: content.heroImage, announcement: content.announcement,
    studioImage: content.studioImage, studioHeadline: content.studioHeadline,
    studioBody1: content.studioBody1, studioBody2: content.studioBody2,
    studioFounder: content.studioFounder, studioRole: content.studioRole,
    aboutImage1: content.aboutImage1, aboutHeadline: content.aboutHeadline,
    aboutBody1: content.aboutBody1, aboutBody2: content.aboutBody2,
    aboutArtistImg: content.aboutArtistImg, aboutArtistName: content.aboutArtistName,
    aboutArtistBio: content.aboutArtistBio, aboutArtistSign: content.aboutArtistSign,
    waConfirmed: content.waConfirmed, waShipped: content.waShipped,
    waDelivered: content.waDelivered, waRejected: content.waRejected,
    deliveryFee: content.deliveryFee, freeDeliveryOver: content.freeDeliveryOver,
    codHandling: content.codHandling, storeClosed: content.storeClosed,
    storeClosedMsg: content.storeClosedMsg, flashSalePercent: content.flashSalePercent,
    instagramHandle: content.instagramHandle, instagramPosts: content.instagramPosts,
    dealActive: content.dealActive, dealTitle: content.dealTitle, dealSubtitle: content.dealSubtitle,
    dealPercent: content.dealPercent, dealMaxOrders: content.dealMaxOrders, dealTheme: content.dealTheme,
    dealMode: content.dealMode,
  } : null;

  return (
    <AdminDashboard
      adminEmail={user.email}
      kpis={kpis}
      orders={plainOrders}
      products={plainProducts}
      customers={plainCustomers}
      coupons={plainCoupons}
      categories={plainCategories}
      messages={plainMessages}
      subscribers={plainSubscribers}
      reviews={plainReviews}
      giftCards={plainGiftCards}
      content={plainContent}
    />
  );
}
