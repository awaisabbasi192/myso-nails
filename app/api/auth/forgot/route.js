import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const RESET_TTL = 60 * 60 * 1000; // 1 hour

function hashToken(t) {
  return crypto.createHash("sha256").update(t).digest("hex");
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Please enter a valid email" }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    const customer = await prisma.customer.findUnique({ where: { email: normalized } });

    // Always respond the same way so we don't reveal which emails exist.
    if (!customer) return Response.json({ ok: true, sent: false });

    // Generate a token; store only its hash.
    const rawToken = crypto.randomBytes(32).toString("hex");
    await prisma.customer.update({
      where: { id: customer.id },
      data: { resetToken: hashToken(rawToken), resetExpiry: new Date(Date.now() + RESET_TTL) },
    });

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      new URL(request.url).origin;
    const link = `${origin}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalized)}`;

    // Send the email if Resend is configured; otherwise fall back to WhatsApp on the UI.
    const apikey = process.env.RESEND_API_KEY;
    let sent = false;
    if (apikey && !apikey.startsWith("re_placeholder")) {
      try {
        const resend = new Resend(apikey);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "orders@mysonails.pk",
          to: normalized,
          subject: "Reset your Myso Nails password",
          html: `
            <div style="background:#0a0a0b;color:#f7f1ed;font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 32px">
              <h1 style="font-size:26px;font-weight:300;margin:0 0 12px">Reset your password</h1>
              <p style="color:rgba(247,241,237,.6);font-size:14px;line-height:1.8;margin:0 0 24px">Hi ${customer.name || "there"}, we got a request to reset your Myso Nails password. Tap the button below — this link works for 1 hour.</p>
              <a href="${link}" style="display:inline-block;background:linear-gradient(100deg,#9B1B2A,#C4233D);color:#fff;padding:14px 28px;text-decoration:none;font-size:13px;letter-spacing:.1em;text-transform:uppercase">Reset password</a>
              <p style="font-size:12px;color:rgba(247,241,237,.4);line-height:1.8;margin:24px 0 0">If you didn't ask for this, you can safely ignore this email — your password won't change.</p>
              <hr style="border:none;border-top:1px solid #1e1e1e;margin:28px 0"/>
              <p style="font-size:12px;color:rgba(247,241,237,.3)">Myso Nails Studio · Lahore, Pakistan</p>
            </div>`,
        });
        sent = true;
      } catch (e) {
        console.error("Reset email failed:", e.message);
      }
    }

    return Response.json({ ok: true, sent });
  } catch (e) {
    console.error("Forgot password error:", e.message);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
