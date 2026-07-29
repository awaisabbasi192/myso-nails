"use client";

import { useState } from "react";
import Link from "next/link";
import { rs } from "@/lib/format";

const STAGES = ["Pending", "Confirmed", "Shipped", "Delivered"];

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TrackPage() {
  const [form, setForm] = useState({ code: "", phone: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function track() {
    if (!form.code.trim() || !form.phone.trim() || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Not found");
      else setResult(data);
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  const inp = { background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "#F7F1ED", padding: 14, fontSize: 13, outline: "none", width: "100%" };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "64px 24px 110px" }}>
      <div style={{ fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "rgba(227,183,166,.75)", marginBottom: 14 }}>Order tracking</div>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 48, margin: "0 0 10px" }}>Track your order</h1>
      <p style={{ fontSize: 14, color: "rgba(247,241,237,.5)", marginBottom: 38 }}>Enter your order code (e.g. MS-2617) and the phone number you used at checkout.</p>

      <div style={{ border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)", padding: 30 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginBottom: 8 }}>Order code</div>
            <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="MS-2617" style={inp} onKeyDown={(e) => e.key === "Enter" && track()} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginBottom: 8 }}>Phone number</div>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="03XX XXX XXXX" style={inp} onKeyDown={(e) => e.key === "Enter" && track()} />
          </div>
          {error && <div style={{ fontSize: 12.5, color: "#E39B9B", borderLeft: "2px solid rgba(200,90,90,.5)", paddingLeft: 12 }}>{error}</div>}
          <div onClick={track} className="shimmer" style={{ cursor: "pointer", textAlign: "center", padding: 16, fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", marginTop: 4 }}>{loading ? "Looking up…" : "Track order"}</div>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 28, border: "1px solid rgba(227,183,166,.2)", background: "var(--panel)", padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 6 }}>{result.code}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 26 }}>{result.items.map((i) => i.name).join(", ")}</div>
              <div style={{ fontSize: 12, color: "rgba(247,241,237,.45)", marginTop: 4 }}>{fmtDate(result.createdAt)} · {rs(result.total)} · {result.city}</div>
            </div>
            <div style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", border: `1px solid ${result.status === "Delivered" ? "rgba(143,214,166,.5)" : result.status === "Rejected" ? "rgba(200,90,90,.5)" : "rgba(227,183,166,.35)"}`, padding: "8px 14px", color: result.status === "Delivered" ? "#8FD6A6" : result.status === "Rejected" ? "#E39B9B" : "var(--rose-light)" }}>{result.status}</div>
          </div>
          {result.status !== "Rejected" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
              {STAGES.map((s, i) => {
                const done = STAGES.indexOf(result.status) >= i;
                return (
                  <div key={s} style={{ borderTop: `2px solid ${done ? "var(--bronze)" : "rgba(227,183,166,.15)"}`, paddingTop: 12 }}>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: done ? "var(--rose-light)" : "rgba(247,241,237,.35)" }}>{s}</div>
                    <div style={{ fontSize: 11, color: "rgba(247,241,237,.35)", marginTop: 4 }}>{done ? (i === 0 ? fmtDate(result.createdAt) : "Done") : "—"}</div>
                  </div>
                );
              })}
            </div>
          )}
          {result.status === "Rejected" && <div style={{ fontSize: 13, color: "#E39B9B", marginTop: 8 }}>This order was not processed. Please contact us on WhatsApp.</div>}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(227,183,166,.12)", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/shop" style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.3)", padding: "10px 18px", color: "rgba(247,241,237,.7)" }}>Shop more</Link>
          </div>
        </div>
      )}
    </div>
  );
}
