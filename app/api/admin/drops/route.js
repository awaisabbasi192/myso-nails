import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const drops = await prisma.drop.findMany({ orderBy: { launchAt: "asc" } });
  return Response.json(drops);
}

export async function POST(request) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { name, description, launchAt, image } = await request.json();
  if (!name || !launchAt) return Response.json({ error: "Missing fields" }, { status: 400 });
  const drop = await prisma.drop.create({ data: { name, description: description || null, launchAt: new Date(launchAt), image: image || null } });
  return Response.json(drop);
}
