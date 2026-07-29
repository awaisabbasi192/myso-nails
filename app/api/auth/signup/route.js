import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const nm = (name || "").trim();
    const em = (email || "").trim().toLowerCase();
    const pw = (password || "").trim();
    if (!nm || !em || !pw) return Response.json({ error: "All fields required" }, { status: 400 });
    if (pw.length < 5) return Response.json({ error: "Password must be at least 5 characters" }, { status: 400 });

    const existing = await prisma.customer.findUnique({ where: { email: em } });
    if (existing) return Response.json({ error: "An account with this email already exists" }, { status: 409 });

    const user = await prisma.customer.create({
      data: { name: nm, email: em, password: await bcrypt.hash(pw, 10), role: "customer" },
    });
    await setSessionCookie({ id: user.id, role: user.role, name: user.name });
    return Response.json({ ok: true, role: user.role });
  } catch (e) {
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
