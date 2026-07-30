import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

// Rate limit: track failed attempts per email (30 min window, max 5 attempts)
const failedAttempts = new Map();
const RATE_LIMIT_WINDOW = 30 * 60 * 1000; // 30 minutes
const MAX_ATTEMPTS = 5;

function checkRateLimit(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = failedAttempts.get(key);

  if (!record) return true;
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    failedAttempts.delete(key);
    return true;
  }
  return record.count < MAX_ATTEMPTS;
}

function recordFailedAttempt(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = failedAttempts.get(key) || { firstAttempt: now, count: 0 };
  failedAttempts.set(key, { firstAttempt: record.firstAttempt, count: record.count + 1 });
}

function clearFailedAttempts(email) {
  failedAttempts.delete(email.toLowerCase());
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const em = (email || "").trim().toLowerCase();
    const pw = (password || "").trim();
    if (!em || !pw) return Response.json({ error: "Enter email and password" }, { status: 400 });

    // Check rate limit
    if (!checkRateLimit(em)) {
      return Response.json({ error: "Too many failed attempts. Try again in 30 minutes." }, { status: 429 });
    }

    const user = await prisma.customer.findUnique({ where: { email: em } });
    if (!user || !(await bcrypt.compare(pw, user.password))) {
      recordFailedAttempt(em);
      return Response.json({ error: "Wrong email or password. Try again." }, { status: 401 });
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(em);
    await setSessionCookie({ id: user.id, role: user.role, name: user.name });
    return Response.json({ ok: true, role: user.role });
  } catch (e) {
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
