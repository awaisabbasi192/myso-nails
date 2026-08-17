"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { waLink } from "@/lib/format";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", referralCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState({ status: "", sent: false }); // status: "" | "sending" | "done"
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) { setForm((f) => ({ ...f, referralCode: ref.toUpperCase() })); setMode("signup"); }
  }, []);

  async function sendReset() {
    if (forgot.status === "sending") return;
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { setError("Please enter a valid email address"); return; }
    setForgot({ status: "sending", sent: false });
    try {
      const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); setForgot({ status: "", sent: false }); return; }
      setForgot({ status: "done", sent: !!data.sent });
    } catch { setError("Network error"); setForgot({ status: "", sent: false }); }
  }

  async function submit() {
    if (loading) return;
    setError("");

    // Validation
    if (mode === "signup" && !form.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!form.password) {
      setError("Please enter your password");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const url = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      router.push(data.role === "admin" ? "/admin" : "/account");
      router.refresh();
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  const inputStyle = { background: "var(--bg)", border: "1px solid var(--card-b)", color: "var(--ink)", padding: 14, fontSize: 13, outline: "none" };
  const lab = { fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-muted)" };
  const tabs = [{ k: "login", l: "Log in" }, { k: "signup", l: "Create account" }];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px 110px" }}>
      <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid var(--card-b)", background: "var(--panel)" }}>
        <div style={{ position: "relative", minHeight: 520 }}>
          <img src="/assets/p4-nude.jpeg" alt="Pearl Bloom Nude set" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,10,11,.92),rgba(10,10,11,.25))", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 36 }}>
            <div style={{ fontFamily: "var(--script)", fontSize: 40, color: "#fff", textShadow: "0 2px 18px rgba(0,0,0,.5)" }}>welcome back</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "rgba(255,255,255,.78)", fontWeight: 300, maxWidth: 290, margin: "10px 0 0" }}>Save your nail sizes once, then reorder in two taps. Your wishlist and order tracking live here.</p>
          </div>
        </div>
        <div style={{ padding: "44px 40px" }}>
          <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--card-b)", marginBottom: 30 }}>
            {tabs.map((t) => (
              <div key={t.k} onClick={() => { setMode(t.k); setError(""); setForgot({ status: "", sent: false }); }} style={{ cursor: "pointer", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", paddingBottom: 13, color: mode === t.k ? "var(--rose)" : "var(--ink-muted)", borderBottom: `2px solid ${mode === t.k ? "var(--rose)" : "transparent"}` }}>{t.l}</div>
            ))}
          </div>

          {mode === "forgot" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 26, margin: 0 }}>Reset your password</h2>
              {forgot.status === "done" ? (
                <>
                  <div style={{ padding: "16px 18px", border: "1px solid rgba(143,214,166,.3)", color: "#8FD6A6", fontSize: 13, lineHeight: 1.7 }}>
                    {forgot.sent
                      ? "✓ Reset link sent! Check your inbox — and if you don't see it, check your spam/junk folder too. Link works for 1 hour."
                      : "If that email is registered, a reset link is on its way. Check your spam/junk folder if you don't see it in inbox."}
                  </div>
                  <a href={waLink("Hi M&S! I need help resetting my password.")} target="_blank" rel="noreferrer" className="btn-wa" style={{ textAlign: "center", padding: 15, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>Reset via WhatsApp</a>
                  <div onClick={() => { setMode("login"); setForgot({ status: "", sent: false }); }} style={{ cursor: "pointer", fontSize: 12, color: "var(--rose)", textAlign: "center" }}>← Back to login</div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>Enter your email and we'll send you a link to set a new password.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Email</span><input value={form.email} onChange={set("email")} placeholder="you@email.com" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && sendReset()} /></div>
                  {error && <div style={{ fontSize: 12, color: "#E39B9B", borderLeft: "2px solid rgba(200,90,90,.6)", paddingLeft: 12 }}>{error}</div>}
                  <div onClick={sendReset} className="shimmer" style={{ cursor: "pointer", textAlign: "center", padding: 16, fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", marginTop: 6 }}>{forgot.status === "sending" ? "Sending…" : "Send reset link"}</div>
                  <div onClick={() => { setMode("login"); setError(""); }} style={{ cursor: "pointer", fontSize: 12, color: "var(--rose)", textAlign: "center" }}>← Back to login</div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "signup" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Full name</span><input value={form.name} onChange={set("name")} placeholder="Areeba Khan" style={inputStyle} /></div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Email</span><input value={form.email} onChange={set("email")} placeholder="you@email.com" style={inputStyle} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Password</span><input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && submit()} /></div>
              {mode === "signup" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={lab}>Referral code <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--ink-faint)" }}>(optional)</span></span>
                  <input value={form.referralCode} onChange={set("referralCode")} placeholder="e.g. AREE1234" style={{ ...inputStyle, letterSpacing: ".12em" }} />
                  {form.referralCode.trim() && <div style={{ fontSize: 11.5, color: "#8FD6A6" }}>✓ You'll receive 20 welcome points on signup.</div>}
                </div>
              )}
              {mode === "login" && (
                <div onClick={() => { setMode("forgot"); setError(""); setForgot({ status: "", sent: false }); }} style={{ cursor: "pointer", fontSize: 12, color: "var(--rose)", textAlign: "right", marginTop: -6 }}>Forgot password?</div>
              )}
              {error && <div style={{ fontSize: 12, color: "#E39B9B", borderLeft: "2px solid rgba(200,90,90,.6)", paddingLeft: 12 }}>{error}</div>}
              <div onClick={submit} className="shimmer" style={{ cursor: "pointer", textAlign: "center", padding: 16, fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", marginTop: 6 }}>{loading ? "…" : mode === "signup" ? "Create my account" : "Log in"}</div>
              <div style={{ fontSize: 12, color: "rgba(247,241,237,.4)", textAlign: "center" }}>or</div>
              <a href={waLink("Hi M&S!")} target="_blank" rel="noreferrer" className="btn-wa" style={{ textAlign: "center", padding: 15, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>Continue on WhatsApp</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
