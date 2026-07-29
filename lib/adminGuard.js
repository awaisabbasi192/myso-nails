import { getCurrentUser } from "./auth";

/** Returns the admin user, or a Response to return early if not authorised. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { user: null, deny: Response.json({ error: "Not authorised" }, { status: 403 }) };
  }
  return { user, deny: null };
}
