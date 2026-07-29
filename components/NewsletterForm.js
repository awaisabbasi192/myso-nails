"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        style={{ flex: 1, minWidth: 220, background: "transparent", border: "1px solid rgba(227,183,166,.3)", color: "var(--ink)", padding: "16px 18px", fontSize: 13, outline: "none" }}
      />
      <div onClick={subscribe} className="shimmer" style={{ cursor: "pointer", padding: "16px 34px", fontSize: 11.5, letterSpacing: ".24em", textTransform: "uppercase" }}>
        {done ? "Code sent ✓" : loading ? "…" : "Get my code"}
      </div>
    </div>
  );
}
