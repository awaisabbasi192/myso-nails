"use client";

import { useState } from "react";
import { waLink } from "@/lib/format";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", topic: "Custom / bridal quote", body: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function send() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setSent(true);
    } catch { setSent(true); } finally { setLoading(false); }
  }

  const inputStyle = { background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: 14, fontSize: 13, outline: "none", width: "100%", minWidth: 0 };
  const lab = { fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}><span style={lab}>Name</span><input value={form.name} onChange={set("name")} placeholder="Your name" style={inputStyle} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}><span style={lab}>WhatsApp number</span><input value={form.phone} onChange={set("phone")} placeholder="03xx xxxxxxx" style={inputStyle} /></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={lab}>Topic</span>
        <select value={form.topic} onChange={set("topic")} style={{ ...inputStyle, background: "var(--bg)" }}>
          <option>Custom / bridal quote</option>
          <option>Sizing help</option>
          <option>Order status</option>
          <option>Wholesale &amp; salons</option>
          <option>Something else</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Message</span><textarea value={form.body} onChange={set("body")} rows={5} placeholder="Event date, design idea, shape and length you like…" style={{ ...inputStyle, resize: "vertical" }} /></div>
      <div onClick={send} className="shimmer" style={{ cursor: "pointer", textAlign: "center", padding: 17, fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase" }}>{sent ? "Message sent ✓" : loading ? "…" : "Send message"}</div>
      <a href={waLink("Hi M&S!")} target="_blank" rel="noreferrer" className="btn-wa" style={{ textAlign: "center", padding: 16, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>Chat instead</a>
    </div>
  );
}
