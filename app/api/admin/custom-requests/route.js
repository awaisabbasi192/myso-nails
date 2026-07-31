import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const reqs = await prisma.customNailRequest.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(reqs);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, occasion, deadline, length, shape, sizes, colorPrefs, designNotes, refImages } = body;
    if (!name || !phone || !designNotes) return Response.json({ error: "Name, phone and design notes are required" }, { status: 400 });
    const req = await prisma.customNailRequest.create({
      data: {
        name, email: email || null, phone, occasion: occasion || null, deadline: deadline || null,
        length: length || "Medium", shape: shape || "Square",
        sizes: typeof sizes === "object" ? JSON.stringify(sizes) : sizes || "{}",
        colorPrefs: colorPrefs || null, designNotes,
        refImages: Array.isArray(refImages) ? JSON.stringify(refImages) : "[]",
      },
    });
    return Response.json({ ok: true, id: req.id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not submit request" }, { status: 500 });
  }
}
