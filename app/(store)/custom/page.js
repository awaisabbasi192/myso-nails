"use client";

import { useState } from "react";
import Link from "next/link";
import { waLink } from "@/lib/format";

const inp = { background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: "13px 16px", fontSize: 13.5, outline: "none", width: "100%" };

export default function CustomOrderPage() {
  const [form, setForm] = useState({ name: "", phone: "", occasion: "Bridal", deadline: "", description: "", reference: "" });
  const [status, setStatus] = useState(""); // "" | "sent" | "error"
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit() {
    if (!form.name || !form.phone || !form.description) { alert("Please fill in name, phone and description."); return; }
    const msg = `Hi Myso Nails! 🌸 I'd like a custom order:\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Occasion:* ${form.occasion}\n*Deadline:* ${form.deadline || "Flexible"}\n*Description:* ${form.description}${form.reference ? "\n*Reference:* " + form.reference : ""}`;
    const url = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || "923020909786"}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setStatus("sent");
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 100px" }}>
      <Link href="/shop" style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 28, display: "inline-block" }}>← Back to shop</Link>
      <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(227,183,166,.75)", marginBottom: 10 }}>Custom orders</div>
      <h1 className="page-h1" style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 52, lineHeight: 1.05, margin: "0 0 16px" }}>Tell me what you want</h1>
      <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.55)", fontWeight: 300, maxWidth: 580, marginBottom: 44 }}>
        If you can send me a photo of it, I can paint it. Custom sets start from Rs 3,000 depending on detail. I reply to every inquiry on WhatsApp within an hour.
      </p>

      {status === "sent" ? (
        <div style={{ border: "1px solid rgba(143,214,166,.3)", padding: "28px 30px", background: "rgba(143,214,166,.06)" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: "#8FD6A6", marginBottom: 10 }}>Request sent via WhatsApp</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "rgba(247,241,237,.6)" }}>If WhatsApp didn't open automatically, message us at 0302 090 9786. We'll reply with a quote within the hour.</p>
          <div onClick={() => setStatus("")} style={{ cursor: "pointer", marginTop: 18, display: "inline-block", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.3)", padding: "10px 18px", color: "rgba(247,241,237,.7)" }}>Start over</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Your name *</div>
              <input value={form.name} onChange={set("name")} placeholder="Areeba" style={inp} />
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>WhatsApp number *</div>
              <input value={form.phone} onChange={set("phone")} placeholder="0300 1234567" style={inp} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Occasion</div>
              <select value={form.occasion} onChange={set("occasion")} style={{ ...inp, background: "var(--bg)" }}>
                {["Bridal", "Party", "Birthday", "Eid", "Everyday", "Other"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>I need it by</div>
              <input type="date" value={form.deadline} onChange={set("deadline")} style={{ ...inp, background: "var(--bg)" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Describe your dream set *</div>
            <textarea rows={4} value={form.description} onChange={set("description")} placeholder="e.g. Nude almond set with 3D roses on ring fingers, gold foil accents, medium length…" style={{ ...inp, resize: "vertical" }} />
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Reference image link (optional)</div>
            <input value={form.reference} onChange={set("reference")} placeholder="Instagram link, Pinterest URL, or describe the reference…" style={inp} />
          </div>
          <div style={{ padding: "18px 22px", border: "1px solid rgba(227,183,166,.14)", background: "var(--panel)", fontSize: 12.5, lineHeight: 1.85, color: "rgba(247,241,237,.55)" }}>
            <span style={{ color: "var(--rose)" }}>How it works:</span> Submit this form → I send you a quote on WhatsApp → you approve design + pay 50% → I start painting → balance paid on delivery.
          </div>
          <div onClick={submit} className="btn-wa" style={{ cursor: "pointer", textAlign: "center", padding: "18px 30px", fontSize: 11.5, letterSpacing: ".24em", textTransform: "uppercase", alignSelf: "flex-start" }}>Send custom request via WhatsApp</div>
        </div>
      )}
    </div>
  );
}
