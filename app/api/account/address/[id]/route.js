import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not logged in" }, { status: 401 });
  const { id } = await params;
  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.customerId !== user.id) return Response.json({ error: "Not found" }, { status: 404 });
    const { label, line1, line2, city, phone, isDefault } = await request.json();
    if (isDefault) {
      await prisma.address.updateMany({ where: { customerId: user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({
      where: { id },
      data: { label: label || "Home", line1, line2: line2 || null, city, phone, isDefault: !!isDefault },
    });
    return Response.json({ ok: true, address });
  } catch (e) {
    return Response.json({ error: "Could not update address" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not logged in" }, { status: 401 });
  const { id } = await params;
  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.customerId !== user.id) return Response.json({ error: "Not found" }, { status: 404 });
    await prisma.address.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Could not delete address" }, { status: 500 });
  }
}
