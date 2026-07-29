import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Resend } from "resend";

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

// Resend customer confirmation email
async function sendConfirmEmail(order, items) {
  const apikey = process.env.RESEND_API_KEY;
  if (!apikey || apikey.startsWith("re_placeholder")) return;
  // Find customer email
  let email = null;
  if (order.customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: order.customerId }, select: { email: true } });
    email = customer?.email;
  }
  if (!email) return;
  const resend = new Resend(apikey);
  const itemRows = items.map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a">${i.name} × ${i.qty}</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right">Rs ${i.unitPrice * i.qty}</td></tr>`).join("");
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "orders@mysonails.pk",
    to: email,
    subject: `Order confirmed — ${order.code} · Myso Nails Studio`,
    html: `
      <div style="background:#0a0a0b;color:#f7f1ed;font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 32px">
        <img src="https://mysonails.pk/assets/logo.png" width="60" height="60" style="border-radius:50%;margin-bottom:24px" alt="Myso Nails" />
        <h1 style="font-size:28px;font-weight:300;margin:0 0 8px">Order received ✓</h1>
        <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 28px">Hi ${order.customerName}, thank you for your order! We'll start preparing your set now.</p>
        <div style="border:1px solid #2a2a2a;padding:24px;margin-bottom:28px">
          <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c9a27e;margin-bottom:16px">Order ${order.code}</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${itemRows}
            <tr><td style="padding:12px 0 4px;font-size:12px;color:rgba(247,241,237,.5)">Shipping</td><td style="padding:12px 0 4px;text-align:right;font-size:12px;color:rgba(247,241,237,.5)">${order.shipping === 0 ? "Free" : "Rs " + order.shipping}</td></tr>
            <tr><td style="padding:4px 0 0;font-weight:600;font-size:16px">Total</td><td style="padding:4px 0 0;text-align:right;font-size:16px;color:#d4a89a">Rs ${order.total}</td></tr>
          </table>
        </div>
        <p style="font-size:13px;color:rgba(247,241,237,.55);line-height:1.8">Payment: <strong>JazzCash (paid in advance)</strong><br/>Delivery to: ${order.city}</p>
        <p style="font-size:13px;color:rgba(247,241,237,.55);line-height:1.8;margin-top:24px">Track your order at <a href="https://mysonails.pk/track" style="color:#d4a89a">mysonails.pk/track</a> using order code <strong>${order.code}</strong> and your phone number.</p>
        <hr style="border:none;border-top:1px solid #1e1e1e;margin:32px 0"/>
        <p style="font-size:12px;color:rgba(247,241,237,.3)">Myso Nails Studio · Lahore, Pakistan</p>
      </div>
    `,
  }).catch(() => {});
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
    const dbProducts = await prisma.product.findMany({ where: { slug: { in: slugs } } });
    const bySlug = Object.fromEntries(dbProducts.map((p) => [p.slug, p]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const p = i.slug ? bySlug[i.slug] : null;
      const unitPrice = p ? p.price : Number(i.price) || 0;
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

    // Background notifications (don't block the response)
    notifyAdmin(order).catch(() => {});
    sendConfirmEmail(order, orderItems).catch(() => {});

    return Response.json({ ok: true, code: order.code, total });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not place order" }, { status: 500 });
  }
}
