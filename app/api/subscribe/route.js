import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    await prisma.subscriber.upsert({
      where: { email: email.trim().toLowerCase() },
      update: {},
      create: { email: email.trim().toLowerCase() },
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
