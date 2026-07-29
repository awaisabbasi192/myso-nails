import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not logged in" }, { status: 401 });
  try {
    const { current, newPassword } = await request.json();
    if (!current || !newPassword) return Response.json({ error: "Both fields are required" }, { status: 400 });
    if (newPassword.length < 8) return Response.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    const customer = await prisma.customer.findUnique({ where: { id: user.id } });
    const ok = await bcrypt.compare(current, customer.password);
    if (!ok) return Response.json({ error: "Current password is incorrect" }, { status: 400 });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({ where: { id: user.id }, data: { password: hashed } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Could not change password" }, { status: 500 });
  }
}
