import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET = process.env.SESSION_SECRET || "dev-secret";
export const SESSION_COOKIE = "miso_session";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

/** Sign a small JSON payload into a tamper-proof token. */
export function signSession(payload) {
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

/** Verify a token and return its payload, or null if invalid. */
export function verifySession(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}

/** Read the session payload from the request cookie (server-side). */
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** Fetch the full logged-in customer record, or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.id) return null;
  return prisma.customer.findUnique({ where: { id: session.id } });
}

/** Set the session cookie (call inside a Route Handler / Server Action). */
export async function setSessionCookie(payload) {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
