import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { name, phone, topic, body } = await request.json();
    if (!name || !body) {
      return Response.json({ error: "Name and message required" }, { status: 400 });
    }
    await prisma.message.create({
      data: { name: name.trim(), phone: phone?.trim() || null, topic: topic || null, body: body.trim() },
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
