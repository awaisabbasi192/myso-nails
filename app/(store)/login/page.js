"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { waLink } from "@/lib/format";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  async function submit() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const url = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      router.push(data.role === "admin" ? "/admin" : "/account");
      router.refresh();
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  const inputStyle = { background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: 14, fontSize: 13, outline: "none" };
  const lab = { fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)" };
  const tabs = [{ k: "login", l: "Log in" }, { k: "signup", l: "Create account" }];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px 110px" }}>
      <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)" }}>
        <div style={{ position: "relative", minHeight: 520 }}>
          <img src="/assets/p4-nude.jpeg" alt="Pearl Bloom Nude set" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.72 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,10,11,.92),rgba(10,10,11,.25))", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 36 }}>
            <div className="text-gradient" style={{ fontFamily: "var(--script)", fontSize: 38 }}>welcome back</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "rgba(247,241,237,.6)", fontWeight: 300, maxWidth: 290, margin: "10px 0 0" }}>Save your nail sizes once, then reorder in two taps. Your wishlist and order tracking live here.</p>
          </div>
        </div>
        <div style={{ padding: "44px 40px" }}>
          <div style={{ display: "flex", gap: 24, borderBottom: "1px solid rgba(227,183,166,.14)", marginBottom: 30 }}>
            {tabs.map((t) => (
              <div key={t.k} onClick={() => { setMode(t.k); setError(""); }} style={{ cursor: "pointer", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", paddingBottom: 13, color: mode === t.k ? "var(--rose-light)" : "rgba(247,241,237,.45)", borderBottom: `2px solid ${mode === t.k ? "var(--bronze)" : "transparent"}` }}>{t.l}</div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Full name</span><input value={form.name} onChange={set("name")} placeholder="Areeba Khan" style={inputStyle} /></div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Email</span><input value={form.email} onChange={set("email")} placeholder="you@email.com" style={inputStyle} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Password</span><input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && submit()} /></div>
            {error && <div style={{ fontSize: 12, color: "#E39B9B", borderLeft: "2px solid rgba(200,90,90,.6)", paddingLeft: 12 }}>{error}</div>}
            <div onClick={submit} className="shimmer" style={{ cursor: "pointer", textAlign: "center", padding: 16, fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", marginTop: 6 }}>{loading ? "…" : mode === "signup" ? "Create my account" : "Log in"}</div>
            <div style={{ fontSize: 12, color: "rgba(247,241,237,.4)", textAlign: "center" }}>or</div>
            <a href={waLink("Hi M&S!")} target="_blank" rel="noreferrer" className="btn-wa" style={{ textAlign: "center", padding: 15, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>Continue on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
