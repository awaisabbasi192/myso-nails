import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendOrderConfirmEmail, sendAdminOrderEmail } from "@/lib/email";
import { getActiveDeal } from "@/lib/deal";

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

function genGiftCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "MG-" + s;
}

async function uniqueGiftCode() {
  for (let i = 0; i < 12; i++) {
    const code = genGiftCode();
    const exists = await prisma.giftCard.findUnique({ where: { code } });
    if (!exists) return code;
  }
  return "MG-" + Date.now().toString().slice(-8);
}

function isGiftItem(i) {
  return !!(i.giftMeta || i.size === "Gift Card" || String(i.name || "").startsWith("Gift Card"));
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
    const [dbProducts, deal] = await Promise.all([
      prisma.product.findMany({ where: { slug: { in: slugs } } }),
      getActiveDeal(),
    ]);
    const bySlug = Object.fromEntries(dbProducts.map((p) => [p.slug, p]));
    // Server recomputes prices from DB (trusted) and applies the active promotion.
    const flashPct = deal.percent || 0;
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

    // Bundle deal: find best active rule matching total qty
    const totalQty = orderItems.reduce((s, i) => s + i.qty, 0);
    if (discount === 0) {
      const rules = await prisma.bundleRule.findMany({ where: { active: true }, orderBy: { minQty: "desc" } });
      const match = rules.find((r) => totalQty >= r.minQty);
      if (match) discount = Math.round((subtotal * match.discountPercent) / 100);
    }

    // Gift card redemption — applied against the discounted subtotal (like a coupon).
    // Client & server both compute min(balance, subtotal - discount) so the paid total matches.
    let giftCardUsed = 0;
    let appliedGiftCode = null;
    let giftRecord = null;
    if (body.giftCardCode) {
      const gc = await prisma.giftCard.findUnique({ where: { code: String(body.giftCardCode).trim().toUpperCase() } });
      if (gc && gc.active && gc.balance > 0) {
        giftCardUsed = Math.min(gc.balance, Math.max(0, subtotal - discount));
        appliedGiftCode = gc.code;
        giftRecord = gc;
      }
    }

    // Delivery: Rs 300 on every order, free at Rs 5,000+
    const shipping = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    const afterCouponAndBundle = Math.max(0, subtotal - discount - giftCardUsed) + shipping;

    const user = await getCurrentUser();
    // Loyalty points redemption (server-validates against DB balance, max 20% of order)
    let pointsRedeemed = 0;
    if (body.pointsRedeemed > 0 && user) {
      const cu = await prisma.customer.findUnique({ where: { id: user.id }, select: { points: true } });
      pointsRedeemed = Math.min(Number(body.pointsRedeemed) || 0, cu?.points || 0, Math.floor(afterCouponAndBundle * 0.2));
      if (pointsRedeemed > 0) {
        await prisma.customer.update({ where: { id: user.id }, data: { points: { decrement: pointsRedeemed } } });
      }
    }
    const total = Math.max(0, afterCouponAndBundle - pointsRedeemed);
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
        pointsRedeemed,
        giftCardCode: appliedGiftCode,
        giftCardUsed,
        status: "Pending",
        items: { create: orderItems },
      },
    });

    // Deduct the redeemed amount from the gift card balance
    if (giftRecord && giftCardUsed > 0) {
      const newBalance = giftRecord.balance - giftCardUsed;
      await prisma.giftCard.update({
        where: { id: giftRecord.id },
        data: { balance: newBalance, active: newBalance > 0 },
      }).catch(() => {});
    }

    for (const it of orderItems) {
      if (it.productId) {
        await prisma.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.qty } } }).catch(() => {});
      }
    }

    // Create gift cards purchased in this order (inactive until payment is confirmed by admin)
    const buyerEmail = user ? (await prisma.customer.findUnique({ where: { id: user.id }, select: { email: true } }))?.email || null : null;
    const giftItems = items.filter(isGiftItem);
    for (const gi of giftItems) {
      const amount = Number(gi.price) || 0;
      if (amount <= 0) continue;
      const gcCode = await uniqueGiftCode();
      await prisma.giftCard.create({
        data: {
          code: gcCode,
          initialAmount: amount,
          balance: amount,
          recipient: gi.giftMeta?.recipient || null,
          sender: gi.giftMeta?.sender || null,
          message: gi.giftMeta?.message || null,
          buyerEmail,
          orderCode: order.code,
          active: false,
        },
      }).catch(() => {});
    }

    // Mark this customer's abandoned cart as recovered
    if (buyerEmail) {
      await prisma.abandonedCart.updateMany({ where: { email: buyerEmail, recovered: false }, data: { recovered: true } }).catch(() => {});
    }

    notifyAdmin(order).catch(() => {});
    sendAdminOrderEmail(order, orderItems).catch(() => {});
    await sendConfirmEmail(order, orderItems);

    return Response.json({ ok: true, code: order.code, total });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not place order" }, { status: 500 });
  }
}
