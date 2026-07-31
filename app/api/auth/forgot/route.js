import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

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

    let sent = false;
    try {
      sent = await sendPasswordResetEmail(customer.name, normalized, link);
    } catch (e) {
      console.error("Reset email failed:", e.message);
    }

    return Response.json({ ok: true, sent });
  } catch (e) {
    console.error("Forgot password error:", e.message);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
