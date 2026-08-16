import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccountClient from "@/components/AccountClient";

export const dynamic = "force-dynamic";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  const [ordersRaw, addresses, products, customer] = await Promise.all([
    prisma.order.findMany({ where: { customerId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.address.findMany({ where: { customerId: user.id }, orderBy: { isDefault: "desc" } }),
    prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.customer.findUnique({ where: { id: user.id }, select: { nailSizes: true, createdAt: true, points: true, referralCode: true } }),
  ]);

  const slugByProductName = Object.fromEntries(products.map((p) => [p.name, p.slug]));
  const productBySlug = Object.fromEntries(products.map((p) => [p.slug, { id: p.id, slug: p.slug, name: p.name }]));

  const orders = ordersRaw.map((o) => ({
    id: o.id, code: o.code, status: o.status, total: o.total, subtotal: o.subtotal,
    shipping: o.shipping, paymentMethod: o.paymentMethod, date: fmtDate(o.createdAt),
    address: o.address, city: o.city, nailSizes: o.nailSizes, notes: o.notes,
    trackingNumber: o.trackingNumber,
    items: o.items.map((it) => ({
      name: it.name, image: it.image, size: it.size, qty: it.qty, unitPrice: it.unitPrice,
      slug: slugByProductName[it.name] || null,
      productId: it.productId,
    })),
  }));

  const plainProducts = products.map((p) => ({ slug: p.slug, name: p.name, image: p.image, price: p.price, id: p.id }));

  return (
    <AccountClient
      user={{ id: user.id, name: user.name, email: user.email, phone: user.phone, nailSizes: customer?.nailSizes || "", memberSince: fmtDate(customer?.createdAt || new Date()), points: customer?.points || 0, referralCode: customer?.referralCode || null }}
      orders={orders}
      addresses={addresses.map((a) => ({ id: a.id, label: a.label, line1: a.line1, line2: a.line2, city: a.city, phone: a.phone, isDefault: a.isDefault }))}
      products={plainProducts}
    />
  );
}
