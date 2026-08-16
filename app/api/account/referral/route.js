import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function genCode(name) {
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase().padEnd(4, "X");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return prefix + suffix;
}

async function uniqueCode(name) {
  for (let i = 0; i < 10; i++) {
    const code = genCode(name);
    const exists = await prisma.customer.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
  }
  return "MYSO" + Date.now().toString().slice(-6);
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.customer.findUnique({ where: { id: user.id }, select: { referralCode: true, name: true } });
  if (existing?.referralCode) return Response.json({ referralCode: existing.referralCode });

  const code = await uniqueCode(existing?.name || user.name || "MYSO");
  await prisma.customer.update({ where: { id: user.id }, data: { referralCode: code } });
  return Response.json({ referralCode: code });
}
