import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("Email: GMAIL_USER or GMAIL_APP_PASSWORD not set");
    return null;
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

const FROM = () => `Myso Nails Studio <${process.env.GMAIL_USER}>`;

const base = `background:#0a0a0b;color:#f7f1ed;font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 32px`;
const footer = `<hr style="border:none;border-top:1px solid #1e1e1e;margin:32px 0"/><p style="font-size:12px;color:rgba(247,241,237,.3)">Myso Nails Studio · Lahore, Pakistan</p>`;
const trackLink = (code) =>
  `<p style="font-size:13px;color:rgba(247,241,237,.55);line-height:1.8;margin-top:20px">Track your order at <a href="https://mysonails.pk/track" style="color:#d4a89a">mysonails.pk/track</a> — use code <strong>${code}</strong> and your phone number. (Check spam if not in inbox)</p>`;

function itemRows(items) {
  return (items || [])
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;font-size:14px">${i.name} × ${i.qty}</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;font-size:14px">Rs ${i.unitPrice * i.qty}</td></tr>`
    )
    .join("");
}

async function send(to, subject, html) {
  const t = getTransporter();
  if (!t) return false;
  try {
    const info = await t.sendMail({ from: FROM(), to, subject, html });
    console.log(`Email sent: ${subject} → ${to} [${info.messageId}]`);
    return true;
  } catch (e) {
    console.error("Email SMTP error:", e.message);
    return false;
  }
}

export async function sendOrderConfirmEmail(order, items, customerEmail) {
  if (!customerEmail) return;
  await send(
    customerEmail,
    `Order confirmed — ${order.code} · Myso Nails Studio`,
    `<div style="${base}">
      <h1 style="font-size:28px;font-weight:300;margin:0 0 8px">Order received ✓</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 28px">Hi ${order.customerName}, thank you for your order! We'll start preparing your set now.</p>
      <div style="border:1px solid #2a2a2a;padding:24px;margin-bottom:28px">
        <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c9a27e;margin-bottom:16px">Order ${order.code}</div>
        <table style="width:100%;border-collapse:collapse">${itemRows(items)}
          <tr><td style="padding:12px 0 4px;font-size:12px;color:rgba(247,241,237,.5)">Shipping</td><td style="padding:12px 0 4px;text-align:right;font-size:12px;color:rgba(247,241,237,.5)">${order.shipping === 0 ? "Free" : "Rs " + order.shipping}</td></tr>
          <tr><td style="padding:4px 0 0;font-weight:600;font-size:16px">Total</td><td style="padding:4px 0 0;text-align:right;font-size:16px;color:#d4a89a">Rs ${order.total}</td></tr>
        </table>
      </div>
      ${trackLink(order.code)}${footer}</div>`
  );
}

export async function sendOrderStatusEmail(order, items, customerEmail) {
  if (!customerEmail) return;
  let subject, html;

  if (order.status === "Confirmed") {
    subject = `Your order ${order.code} is confirmed — we're preparing it! 🌸`;
    html = `<div style="${base}">
      <h1 style="font-size:28px;font-weight:300;margin:0 0 8px">Order confirmed 🌸</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 24px">Hi ${order.customerName}, great news — your order has been confirmed and we're getting your nails ready!</p>
      <div style="border:1px solid #2a2a2a;padding:20px;margin-bottom:24px">
        <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c9a27e;margin-bottom:14px">Order ${order.code}</div>
        <table style="width:100%;border-collapse:collapse">${itemRows(items)}
          <tr><td style="padding:12px 0 0;font-weight:600;font-size:15px">Total</td><td style="padding:12px 0 0;text-align:right;font-size:15px;color:#d4a89a">Rs ${order.total}</td></tr>
        </table>
      </div>
      ${trackLink(order.code)}${footer}</div>`;
  } else if (order.status === "Shipped") {
    subject = `Your Myso Nails order ${order.code} has been shipped! 🚚`;
    const trackingLine = order.trackingNumber
      ? `<p style="font-size:13px;color:rgba(247,241,237,.7);line-height:1.8;margin-top:16px">Tracking number: <strong style="color:#d4a89a">${order.trackingNumber}</strong></p>`
      : "";
    html = `<div style="${base}">
      <h1 style="font-size:28px;font-weight:300;margin:0 0 8px">On its way! 🚚</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 16px">Hi ${order.customerName}, your order <strong style="color:#d4a89a">${order.code}</strong> has been shipped to ${order.city}!</p>
      ${trackingLine}
      <p style="font-size:13px;color:rgba(247,241,237,.55);line-height:1.8;margin-top:16px">Delivery usually takes 2–5 working days 💅</p>
      ${trackLink(order.code)}${footer}</div>`;
  } else if (order.status === "Delivered") {
    subject = `Order ${order.code} delivered — enjoy your nails! 💅`;
    html = `<div style="${base}">
      <h1 style="font-size:28px;font-weight:300;margin:0 0 8px">Delivered! 💅</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 16px">Hi ${order.customerName}, your Myso Nails order <strong style="color:#d4a89a">${order.code}</strong> has been delivered. We hope you love your new nails!</p>
      <p style="font-size:13px;color:rgba(247,241,237,.55);line-height:1.8">Leave a review or reorder at <a href="https://mysonails.pk" style="color:#d4a89a">mysonails.pk</a></p>
      ${footer}</div>`;
  } else {
    return;
  }

  await send(customerEmail, subject, html);
}

export async function sendStockAlertEmail(productName, productSlug, email) {
  return send(
    email,
    `${productName} is back in stock! — Myso Nails Studio`,
    `<div style="${base}">
      <h1 style="font-size:26px;font-weight:300;margin:0 0 10px">Back in stock! 🌸</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 22px">Aap ne <strong style="color:#d4a89a">${productName}</strong> ke liye stock alert lagaya tha — yeh set ab dobara available hai!</p>
      <a href="https://mysonails.pk/product/${productSlug}" style="display:inline-block;background:linear-gradient(100deg,#9B1B2A,#C4233D);color:#fff;padding:14px 28px;text-decoration:none;font-size:13px;letter-spacing:.1em;text-transform:uppercase">Shop now →</a>
      <p style="font-size:12px;color:rgba(247,241,237,.4);line-height:1.8;margin:24px 0 0">Sets limited quantity mein hain — jaldi order karein. Yeh email aap ne khud request ki thi.</p>
      ${footer}</div>`
  );
}

export async function sendWelcomeEmail(name, email, referralCode, welcomePoints) {
  if (!email) return;
  const firstName = (name || "there").split(" ")[0];
  const pointsLine = welcomePoints
    ? `<p style="font-size:13px;color:rgba(247,241,237,.6);line-height:1.8;margin:0 0 8px">🎁 You've got <strong style="color:#8FD6A6">${welcomePoints} welcome points</strong> in your account — redeem them at checkout for a discount.</p>`
    : "";
  return send(
    email,
    "Welcome to Myso Nails Studio 🌸",
    `<div style="${base}">
      <h1 style="font-size:28px;font-weight:300;margin:0 0 8px">Welcome, ${firstName}! 🌸</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 22px">Thank you for joining Myso Nails Studio — hand-painted press-on sets, sized to your nails and shipped nationwide from Lahore.</p>
      ${pointsLine}
      <div style="border:1px solid #2a2a2a;padding:22px;margin:20px 0">
        <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c9a27e;margin-bottom:10px">Your referral code</div>
        <div style="font-family:Georgia,serif;font-size:26px;color:#d4a89a;letter-spacing:.08em">${referralCode || "—"}</div>
        <p style="font-size:12.5px;color:rgba(247,241,237,.5);line-height:1.7;margin:10px 0 0">Share it with friends — you earn <strong style="color:#8FD6A6">50 points</strong> when they sign up, and they get <strong style="color:#8FD6A6">20 points</strong> too.</p>
      </div>
      <a href="https://mysonails.store/shop" style="display:inline-block;background:linear-gradient(100deg,#9B1B2A,#C4233D);color:#fff;padding:14px 28px;text-decoration:none;font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-top:8px">Shop the sets →</a>
      ${footer}</div>`
  );
}

export async function sendAdminOrderEmail(order, items) {
  const to = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
  if (!to) return;
  return send(
    to,
    `🛍 New order ${order.code} — Rs ${order.total}`,
    `<div style="${base}">
      <h1 style="font-size:24px;font-weight:300;margin:0 0 8px">New order received 🛍</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 20px">A new order just came in and is awaiting payment verification.</p>
      <div style="border:1px solid #2a2a2a;padding:22px;margin-bottom:20px">
        <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c9a27e;margin-bottom:14px">Order ${order.code}</div>
        <table style="width:100%;border-collapse:collapse;font-size:13.5px;color:rgba(247,241,237,.75)">
          <tr><td style="padding:4px 0">Customer</td><td style="padding:4px 0;text-align:right;color:#f7f1ed">${order.customerName}</td></tr>
          <tr><td style="padding:4px 0">Phone</td><td style="padding:4px 0;text-align:right;color:#f7f1ed">${order.phone}</td></tr>
          <tr><td style="padding:4px 0">City</td><td style="padding:4px 0;text-align:right;color:#f7f1ed">${order.city}</td></tr>
          <tr><td style="padding:4px 0">Total</td><td style="padding:4px 0;text-align:right;color:#d4a89a;font-size:16px">Rs ${order.total}</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:14px;border-top:1px solid #2a2a2a">${itemRows(items)}</table>
      </div>
      <a href="https://mysonails.store/admin" style="display:inline-block;background:linear-gradient(100deg,#9B1B2A,#C4233D);color:#fff;padding:13px 26px;text-decoration:none;font-size:12px;letter-spacing:.1em;text-transform:uppercase">Open admin panel →</a>
      ${footer}</div>`
  );
}

export async function sendGiftCardEmail(giftCard, buyerEmail) {
  if (!buyerEmail) return;
  const forLine = giftCard.recipient ? ` for <strong style="color:#d4a89a">${giftCard.recipient}</strong>` : "";
  const msgLine = giftCard.message
    ? `<p style="font-size:13px;color:rgba(247,241,237,.6);line-height:1.8;font-style:italic;margin:14px 0 0">“${giftCard.message}”</p>`
    : "";
  return send(
    buyerEmail,
    `Your Myso Nails gift card — ${giftCard.code} 🎁`,
    `<div style="${base}">
      <h1 style="font-size:26px;font-weight:300;margin:0 0 8px">Your gift card is ready 🎁</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 20px">Here's the Myso Nails gift card${forLine}. The code below can be applied at checkout — no expiry.</p>
      <div style="border:1px solid #2a2a2a;padding:28px;margin-bottom:20px;text-align:center;background:#111">
        <div style="font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#c9a27e;margin-bottom:12px">Gift card code</div>
        <div style="font-family:Georgia,serif;font-size:30px;color:#d4a89a;letter-spacing:.12em">${giftCard.code}</div>
        <div style="font-family:Georgia,serif;font-size:22px;color:#f7f1ed;margin-top:14px">Rs ${giftCard.initialAmount}</div>
        ${msgLine}
      </div>
      <p style="font-size:12.5px;color:rgba(247,241,237,.5);line-height:1.7">To redeem: add sets to the bag, then enter this code in the <strong style="color:rgba(247,241,237,.7)">coupon / gift card</strong> field at checkout. The balance carries over across orders.</p>
      <a href="https://mysonails.store/shop" style="display:inline-block;background:linear-gradient(100deg,#9B1B2A,#C4233D);color:#fff;padding:14px 28px;text-decoration:none;font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-top:8px">Shop now →</a>
      ${footer}</div>`
  );
}

export async function sendAbandonedCartEmail(name, email, items, subtotal) {
  if (!email) return;
  const firstName = (name || "there").split(" ")[0];
  const rows = (items || [])
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;font-size:14px">${i.name} × ${i.qty || 1}</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;font-size:14px">Rs ${(i.price || 0) * (i.qty || 1)}</td></tr>`)
    .join("");
  return send(
    email,
    `${firstName}, you left something in your bag 🛍`,
    `<div style="${base}">
      <h1 style="font-size:26px;font-weight:300;margin:0 0 8px">Still thinking it over? 💅</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 20px">Hi ${firstName}, your hand-painted sets are still in your bag. They're limited quantity — complete your order before they sell out.</p>
      <div style="border:1px solid #2a2a2a;padding:22px;margin-bottom:22px">
        <table style="width:100%;border-collapse:collapse">${rows}
          <tr><td style="padding:12px 0 0;font-weight:600;font-size:15px">Subtotal</td><td style="padding:12px 0 0;text-align:right;font-size:15px;color:#d4a89a">Rs ${subtotal}</td></tr>
        </table>
      </div>
      <a href="https://mysonails.store/cart" style="display:inline-block;background:linear-gradient(100deg,#9B1B2A,#C4233D);color:#fff;padding:14px 30px;text-decoration:none;font-size:13px;letter-spacing:.1em;text-transform:uppercase">Complete my order →</a>
      <p style="font-size:12px;color:rgba(247,241,237,.4);line-height:1.7;margin:22px 0 0">Need help with sizing or a custom design? Just reply or message us on WhatsApp 0302 090 9786.</p>
      ${footer}</div>`
  );
}

export async function sendPasswordResetEmail(customerName, email, link) {
  return send(
    email,
    "Reset your Myso Nails password",
    `<div style="${base}">
      <h1 style="font-size:26px;font-weight:300;margin:0 0 12px">Reset your password</h1>
      <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 24px">Hi ${customerName || "there"}, tap the button below to set a new password — this link works for 1 hour.</p>
      <a href="${link}" style="display:inline-block;background:linear-gradient(100deg,#9B1B2A,#C4233D);color:#fff;padding:14px 28px;text-decoration:none;font-size:13px;letter-spacing:.1em;text-transform:uppercase">Reset password</a>
      <p style="font-size:12px;color:rgba(247,241,237,.4);line-height:1.8;margin:24px 0 0">If you didn't ask for this, ignore this email — your password won't change.</p>
      <p style="font-size:12px;color:rgba(247,241,237,.3);margin:12px 0 0">Can't see this email? Check your spam/junk folder.</p>
      ${footer}</div>`
  );
}
