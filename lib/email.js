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
