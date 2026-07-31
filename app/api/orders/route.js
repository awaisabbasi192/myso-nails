import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendOrderConfirmEmail } from "@/lib/email";

const FREE_DELIVERY_OVER = 5000;
const DELIVERY_FEE = 300;

async function uniqueCode() {
  for (let i = 0; i < 20; i++) {
    const n = await prisma.order.count();
    const code = "MS-" + (2610 + n + i);
    const exists = await prisma.order.findUnique({ where: { code } });
    if (!exists) return code;
  }
  return "MS-" + Date.now().toString().slice(-6);
}

// CallMeBot admin WA notification
async function notifyAdmin(order) {
  const apikey = process.env.CALLMEBOT_APIKEY;
  const phone = process.env.ADMIN_WHATSAPP;
  if (!apikey || apikey === "your_callmebot_key_here" || !phone) return;
  const msg = `🛍 New Myso order ${order.code}\nFrom: ${order.customerName}\nPhone: ${order.phone}\nCity: ${order.city}\nTotal: Rs ${order.total}\nPayment: ${order.paymentMethod.toUpperCase()}`;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(msg)}&apikey=${apikey}`;
  await fetch(url).catch(() => {});
}

async function sendConfirmEmail(order, items) {
  if (!order.customerId) return;
  const customer = await prisma.customer.findUnique({ where: { id: order.customerId }, select: { email: true } });
  if (!customer?.email) return;
  await sendOrderConfirmEmail(order, items, customer.email);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, phone, address, city, nailSizes, notes, items, paymentMethod, couponCode, paymentProof } = body;

    if (!customerName || !phone || !address || !city) {
      return Response.json({ error: "Please fill in your delivery details" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Your bag is empty" }, { status: 400 });
    }
    if (!paymentProof) {
      return Response.json({ error: "Please upload your JazzCash payment screenshot. All orders are paid in advance." }, { status: 400 });
    }

    const slugs = items.filter((i) => i.slug).map((i) => i.slug);
    const [dbProducts, siteContent] = await Promise.all([
      prisma.product.findMany({ where: { slug: { in: slugs } } }),
      prisma.siteContent.findUnique({ where: { id: 1 }, select: { flashSalePercent: true } }),
    ]);
    const bySlug = Object.fromEntries(dbProducts.map((p) => [p.slug, p]));
    // Server recomputes prices from DB (trusted) and applies the active flash sale.
    const flashPct = siteContent?.flashSalePercent ?? 0;
    const withFlash = (price) => (flashPct > 0 ? Math.round(price * (1 - flashPct / 100)) : price);

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const p = i.slug ? bySlug[i.slug] : null;
      const unitPrice = p ? withFlash(p.price) : Number(i.price) || 0;
      const qty = Math.max(1, Number(i.qty) || 1);
      subtotal += unitPrice * qty;
      return {
        productId: p ? p.id : null,
        name: p ? p.name : i.name || "Item",
        image: p ? p.image : i.image || "/assets/logo.png",
        size: i.size || "Medium set",
        unitPrice,
        qty,
      };
    });

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
      if (coupon && coupon.active && subtotal >= coupon.minSpend && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        discount = coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
        appliedCoupon = coupon.code;
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    // Delivery: Rs 300 on every order, free at Rs 5,000+
    const shipping = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    const total = Math.max(0, subtotal - discount) + shipping;

    const user = await getCurrentUser();
    const code = await uniqueCode();

    const order = await prisma.order.create({
      data: {
        code,
        customerId: user ? user.id : null,
        customerName, phone, address, city,
        nailSizes: nailSizes || null,
        notes: notes || null,
        subtotal, shipping, total,
        paymentMethod: "jazzcash",
        paymentProof: paymentProof || null,
        couponCode: appliedCoupon,
        status: "Pending",
        items: { create: orderItems },
      },
    });

    for (const it of orderItems) {
      if (it.productId) {
        await prisma.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.qty } } }).catch(() => {});
      }
    }

    notifyAdmin(order).catch(() => {});
    await sendConfirmEmail(order, orderItems);

    return Response.json({ ok: true, code: order.code, total });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not place order" }, { status: 500 });
  }
}
