"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [creds, setCreds] = useState({ token: "", email: "" });
  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // "" | "saving" | "done"

  // Read token + email from the URL without needing a Suspense boundary.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setCreds({ token: p.get("token") || "", email: p.get("email") || "" });
  }, []);

  async function submit() {
    if (status === "saving") return;
    setError("");
    if (!creds.token || !creds.email) { setError("This reset link is invalid. Please request a new one."); return; }
    if (!form.newPassword) { setError("Please enter a new password"); return; }
    if (form.newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (form.newPassword !== form.confirm) { setError("Passwords do not match"); return; }
    setStatus("saving");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: creds.email, token: creds.token, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not reset password"); setStatus(""); return; }
      setStatus("done");
      setTimeout(() => router.push("/login"), 2200);
    } catch {
      setError("Network error"); setStatus("");
    }
  }

  const inputStyle = { background: "var(--bg)", border: "1px solid var(--card-b)", color: "var(--ink)", padding: 14, fontSize: 13, outline: "none", width: "100%" };
  const lab = { fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8, display: "block" };

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: "70px 24px 110px" }}>
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: "40px 36px" }}>
        <div className="text-gradient" style={{ fontFamily: "var(--script)", fontSize: 36, marginBottom: 6 }}>almost there</div>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 30, margin: "0 0 8px" }}>Set a new password</h1>

        {status === "done" ? (
          <div style={{ marginTop: 20, padding: "16px 20px", border: "1px solid rgba(143,214,166,.3)", color: "#8FD6A6", fontSize: 13.5, lineHeight: 1.7 }}>
            ✓ Password reset! Taking you to the login page…
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
              {creds.email ? <>For <strong style={{ color: "var(--ink)" }}>{creds.email}</strong></> : "Enter your new password below."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span style={lab}>New password</span>
                <input type="password" value={form.newPassword} onChange={(e) => { setForm((f) => ({ ...f, newPassword: e.target.value })); setError(""); }} placeholder="Min. 8 characters" style={inputStyle} />
              </div>
              <div>
                <span style={lab}>Confirm new password</span>
                <input type="password" value={form.confirm} onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setError(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Re-enter password" style={inputStyle} />
              </div>
              {error && <div style={{ fontSize: 12, color: "#E39B9B", borderLeft: "2px solid rgba(200,90,90,.6)", paddingLeft: 12 }}>{error}</div>}
              <div onClick={submit} className="shimmer" style={{ cursor: "pointer", textAlign: "center", padding: 15, fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", marginTop: 4 }}>
                {status === "saving" ? "Saving…" : "Reset password"}
              </div>
              <Link href="/login" style={{ fontSize: 12, color: "var(--ink-muted)", textAlign: "center" }}>Back to login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
