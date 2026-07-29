import { requireAdmin } from "@/lib/adminGuard";
import fs from "fs";
import path from "path";

export async function GET() {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) return Response.json({ files: [] });
    const files = fs.readdirSync(uploadsDir)
      .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .map((f) => ({
        name: f,
        path: `/uploads/${f}`,
        size: fs.statSync(path.join(uploadsDir, f)).size,
        mtime: fs.statSync(path.join(uploadsDir, f)).mtime.toISOString(),
      }))
      .sort((a, b) => b.mtime.localeCompare(a.mtime));
    return Response.json({ files });
  } catch (e) {
    return Response.json({ files: [] });
  }
}
