import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const { productId, email } = await request.json();
    if (!productId || !email) return Response.json({ error: "Missing fields" }, { status: 400 });
    const user = await getCurrentUser();
    await prisma.stockAlert.upsert({
      where: { productId_email: { productId, email } },
      update: {},
      create: { productId, email, customerId: user?.id || null },
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Could not save alert" }, { status: 500 });
  }
}
