import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function hashToken(t) {
  return crypto.createHash("sha256").update(t).digest("hex");
}

export async function POST(request) {
  try {
    const { email, token, newPassword } = await request.json();
    if (!email || !token || !newPassword) {
      return Response.json({ error: "Missing details" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    const customer = await prisma.customer.findUnique({ where: { email: normalized } });
    if (!customer || !customer.resetToken || !customer.resetExpiry) {
      return Response.json({ error: "This reset link is invalid. Please request a new one." }, { status: 400 });
    }
    if (customer.resetExpiry < new Date()) {
      return Response.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }
    if (hashToken(token) !== customer.resetToken) {
      return Response.json({ error: "This reset link is invalid. Please request a new one." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { password: hashed, resetToken: null, resetExpiry: null },
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Reset password error:", e.message);
    return Response.json({ error: "Could not reset password" }, { status: 500 });
  }
}
