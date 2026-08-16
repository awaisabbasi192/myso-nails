import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

function genCode(name) {
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase().padEnd(4, "X");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return prefix + suffix;
}

async function uniqueReferralCode(name) {
  for (let i = 0; i < 10; i++) {
    const code = genCode(name);
    const exists = await prisma.customer.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
  }
  return "MYSO" + Date.now().toString().slice(-6);
}

export async function POST(request) {
  try {
    const { name, email, password, referralCode } = await request.json();
    const nm = (name || "").trim();
    const em = (email || "").trim().toLowerCase();
    const pw = (password || "").trim();
    if (!nm || !em || !pw) return Response.json({ error: "All fields required" }, { status: 400 });
    if (pw.length < 5) return Response.json({ error: "Password must be at least 5 characters" }, { status: 400 });

    const existing = await prisma.customer.findUnique({ where: { email: em } });
    if (existing) return Response.json({ error: "An account with this email already exists" }, { status: 409 });

    // Validate referrer
    let referrer = null;
    if (referralCode?.trim()) {
      referrer = await prisma.customer.findUnique({ where: { referralCode: referralCode.trim().toUpperCase() } });
    }

    const myCode = await uniqueReferralCode(nm);
    const user = await prisma.customer.create({
      data: {
        name: nm, email: em,
        password: await bcrypt.hash(pw, 10),
        role: "customer",
        referralCode: myCode,
        referredBy: referrer?.referralCode || null,
        points: referrer ? 20 : 0, // welcome bonus if referred
      },
    });

    // Award referrer 50 points
    if (referrer) {
      await prisma.customer.update({ where: { id: referrer.id }, data: { points: { increment: 50 } } }).catch(() => {});
    }

    // Welcome email with referral code (fire-and-forget — never block signup)
    sendWelcomeEmail(user.name, user.email, myCode, referrer ? 20 : 0).catch(() => {});

    await setSessionCookie({ id: user.id, role: user.role, name: user.name });
    return Response.json({ ok: true, role: user.role });
  } catch (e) {
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
