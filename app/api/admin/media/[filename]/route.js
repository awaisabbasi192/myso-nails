import { requireAdmin } from "@/lib/adminGuard";
import fs from "fs";
import path from "path";

export async function DELETE(request, { params }) {
  const { deny } = await requireAdmin();
  if (deny) return deny;
  const { filename } = await params;
  // Prevent path traversal
  const safe = path.basename(filename);
  if (safe !== filename || filename.includes("..")) {
    return Response.json({ error: "Invalid filename" }, { status: 400 });
  }
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", safe);
    if (!fs.existsSync(filePath)) return Response.json({ error: "File not found" }, { status: 404 });
    fs.unlinkSync(filePath);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Could not delete file" }, { status: 500 });
  }
}
