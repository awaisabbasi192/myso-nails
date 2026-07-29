import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const em = (email || "").trim().toLowerCase();
    const pw = (password || "").trim();
    if (!em || !pw) return Response.json({ error: "Enter email and password" }, { status: 400 });

    const user = await prisma.customer.findUnique({ where: { email: em } });
    if (!user || !(await bcrypt.compare(pw, user.password))) {
      return Response.json({ error: "Wrong email or password. Try again." }, { status: 401 });
    }
    await setSessionCookie({ id: user.id, role: user.role, name: user.name });
    return Response.json({ ok: true, role: user.role });
  } catch (e) {
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
