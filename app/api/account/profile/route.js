import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not logged in" }, { status: 401 });
  try {
    const { name, phone, nailSizes } = await request.json();
    const data = {};
    if (name !== undefined) {
      if (!name?.trim()) return Response.json({ error: "Name is required" }, { status: 400 });
      data.name = name.trim();
    }
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (nailSizes !== undefined) data.nailSizes = nailSizes?.trim() || null;
    const updated = await prisma.customer.update({ where: { id: user.id }, data });
    return Response.json({ ok: true, name: updated.name, phone: updated.phone, nailSizes: updated.nailSizes });
  } catch (e) {
    return Response.json({ error: "Could not update profile" }, { status: 500 });
  }
}
