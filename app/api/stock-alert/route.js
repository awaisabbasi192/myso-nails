import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { email, productId } = await request.json();
    if (!email || !email.includes("@") || !productId) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    await prisma.stockAlert.upsert({
      where: { email_productId: { email: email.trim().toLowerCase(), productId } },
      update: { notified: false },
      create: { email: email.trim().toLowerCase(), productId },
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
