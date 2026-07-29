import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not logged in" }, { status: 401 });
  try {
    const { label, line1, line2, city, phone, isDefault } = await request.json();
    if (!line1 || !city || !phone) return Response.json({ error: "Line1, city and phone are required" }, { status: 400 });
    if (isDefault) {
      await prisma.address.updateMany({ where: { customerId: user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { customerId: user.id, label: label || "Home", line1, line2: line2 || null, city, phone, isDefault: !!isDefault },
    });
    return Response.json({ ok: true, address });
  } catch (e) {
    return Response.json({ error: "Could not save address" }, { status: 500 });
  }
}
