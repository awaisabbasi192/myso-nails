"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const FINGERS = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const LENGTHS = ["XS (very short)", "S (short)", "M (medium)", "L (long)", "XL (extra long)"];
const SHAPES = ["Square", "Round", "Oval", "Almond", "Stiletto", "Coffin/Ballerina"];
const OCCASIONS = ["Bridal", "Party", "Birthday", "Eid", "Everyday", "Other"];

const inp = { background: "var(--bg)", border: "1px solid var(--card-b)", color: "var(--ink)", padding: "13px 16px", fontSize: 13.5, outline: "none", width: "100%" };
const lab = { fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8, display: "block" };

export default function CustomOrderPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", occasion: "Bridal", deadline: "",
    length: "M (medium)", shape: "Square",
    sizes: { Thumb: "", Index: "", Middle: "", Ring: "", Pinky: "" },
    colorPrefs: "", designNotes: "", refImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSize = (finger) => (e) => setForm((f) => ({ ...f, sizes: { ...f.sizes, [finger]: e.target.value } }));

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    if (!file || form.refImages.length >= 3) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.path) setForm((f) => ({ ...f, refImages: [...f.refImages, data.path] }));
  }

  function removeImage(i) {
    setForm((f) => ({ ...f, refImages: f.refImages.filter((_, idx) => idx !== i) }));
  }

  async function submit() {
    if (!form.name || !form.phone || !form.designNotes) { setError("Name, phone and design description are required."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sizes: form.sizes, refImages: form.refImages }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Error"); setLoading(false); return; }
      setDone(true);
    } catch { setError("Network error"); setLoading(false); }
  }

  if (done) return (
    <div style={{ maxWidth: 580, margin: "80px auto", padding: "0 24px 100px" }}>
      <div style={{ border: "1px solid var(--card-b)", padding: "44px 36px", background: "var(--panel)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--script)", fontSize: 48, color: "var(--rose)" }}>done!</div>
        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 28, margin: "12px 0 16px" }}>Request received 🌸</h2>
        <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--ink-muted)", marginBottom: 28 }}>
          Aapki custom nail request mil gayi! Hum aapko WhatsApp pe 1-2 ghante mein quote bhejenge.
        </p>
        <Link href="/shop" className="shimmer" style={{ display: "inline-block", padding: "14px 30px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase" }}>Browse ready sets</Link>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 100px" }}>
      <Link href="/shop" style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 24, display: "inline-block" }}>← Back to shop</Link>
      <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 10 }}>Custom orders</div>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 46, lineHeight: 1.05, margin: "0 0 12px" }}>Design your dream nails</h1>
      <p style={{ fontSize: 14.5, lineHeight: 1.9, color: "var(--ink-muted)", marginBottom: 36, maxWidth: 580 }}>
        Coin method se apni nail size measure karein — phir design details bataiye. Hum 1-2 ghante mein WhatsApp pe quote bhejenge.
      </p>

      {/* Step indicators */}
      <div className="custom-steps" style={{ display: "flex", gap: 8, marginBottom: 36 }}>
        {["Measurement", "Design", "Contact"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: step > i + 1 ? "var(--rose)" : step === i + 1 ? "var(--rose)" : "var(--card-b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{step > i + 1 ? "✓" : i + 1}</div>
            <span style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: step === i + 1 ? "var(--ink)" : "var(--ink-faint)" }}>{s}</span>
            {i < 2 && <div className="step-connector" style={{ width: 32, height: 1, background: "var(--card-b)" }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Measurement */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Coin method instructions */}
          <div style={{ border: "1px solid var(--card-b)", padding: "24px 28px", background: "var(--panel)" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 20, marginBottom: 14 }}>🪙 Coin method — how to measure</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, fontSize: 13, lineHeight: 1.85, color: "var(--ink-muted)" }}>
              <div><strong style={{ color: "var(--ink)", display: "block", marginBottom: 6 }}>Step 1</strong>Place a 5-rupee coin flat on a table.</div>
              <div><strong style={{ color: "var(--ink)", display: "block", marginBottom: 6 }}>Step 2</strong>Put your finger on top of the coin, nail side down.</div>
              <div><strong style={{ color: "var(--ink)", display: "block", marginBottom: 6 }}>Step 3</strong>Note how much of the coin your nail covers using the guide below.</div>
            </div>
            <div className="coin-grid" style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, textAlign: "center" }}>
              {[["XS", "< ¼ coin"], ["S", "¼ coin"], ["M", "⅓ coin"], ["L", "½ coin"], ["XL", "⅔ coin"], ["XXL", "> ⅔ coin"]].map(([sz, desc]) => (
                <div key={sz} style={{ border: "1px solid var(--card-b)", padding: "10px 6px" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--rose)", marginBottom: 4 }}>{sz}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-muted)", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Finger sizes */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, color: "var(--ink)" }}>Enter size for each finger (dominant hand):</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {FINGERS.map((f) => (
                <div key={f}>
                  <span style={lab}>{f}</span>
                  <select value={form.sizes[f]} onChange={setSize(f)} style={{ ...inp, background: "var(--bg)", padding: "11px 10px" }}>
                    <option value="">—</option>
                    {["XS", "S", "M", "L", "XL", "XXL"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Length & Shape */}
          <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={lab}>Preferred length</span>
              <select value={form.length} onChange={set("length")} style={{ ...inp, background: "var(--bg)" }}>
                {LENGTHS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <span style={lab}>Nail shape</span>
              <select value={form.shape} onChange={set("shape")} style={{ ...inp, background: "var(--bg)" }}>
                {SHAPES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div onClick={() => setStep(2)} className="shimmer" style={{ cursor: "pointer", padding: "14px 32px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase" }}>Next — Design →</div>
          </div>
        </div>
      )}

      {/* Step 2: Design */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={lab}>Occasion</span>
              <select value={form.occasion} onChange={set("occasion")} style={{ ...inp, background: "var(--bg)" }}>
                {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <span style={lab}>I need it by (optional)</span>
              <input type="date" value={form.deadline} onChange={set("deadline")} style={{ ...inp, background: "var(--bg)" }} />
            </div>
          </div>

          <div>
            <span style={lab}>Color preferences</span>
            <input value={form.colorPrefs} onChange={set("colorPrefs")} placeholder="e.g. Nude pinks, deep reds, no glitter..." style={inp} />
          </div>

          <div>
            <span style={lab}>Describe your dream design *</span>
            <textarea rows={5} value={form.designNotes} onChange={set("designNotes")} placeholder="e.g. Almond shaped, nude base with hand-painted 3D roses on ring fingers, gold foil accents, glossy finish..." style={{ ...inp, resize: "vertical" }} />
          </div>

          {/* Reference images */}
          <div>
            <span style={lab}>Reference photos (up to 3)</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {form.refImages.map((img, i) => (
                <div key={i} style={{ position: "relative", width: 80, height: 80 }}>
                  <img src={img} alt="" style={{ width: 80, height: 80, objectFit: "cover", border: "1px solid var(--card-b)" }} />
                  <div onClick={() => removeImage(i)} style={{ position: "absolute", top: -8, right: -8, width: 20, height: 20, borderRadius: "50%", background: "var(--rose)", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>×</div>
                </div>
              ))}
              {form.refImages.length < 3 && (
                <div onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, border: "1px dashed var(--card-b)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4, color: "var(--ink-muted)", fontSize: 11 }}>
                  <span style={{ fontSize: 22 }}>+</span>Photo
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadImage} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            <div onClick={() => setStep(1)} style={{ cursor: "pointer", padding: "14px 24px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", color: "var(--ink-muted)" }}>← Back</div>
            <div onClick={() => { if (!form.designNotes) { setError("Please describe your design."); return; } setError(""); setStep(3); }} className="shimmer" style={{ cursor: "pointer", padding: "14px 32px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase" }}>Next — Contact →</div>
          </div>
          {error && <div style={{ fontSize: 12, color: "#E39B9B", paddingLeft: 12, borderLeft: "2px solid rgba(200,90,90,.6)" }}>{error}</div>}
        </div>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={lab}>Your name *</span>
              <input value={form.name} onChange={set("name")} placeholder="Areeba Khan" style={inp} />
            </div>
            <div>
              <span style={lab}>WhatsApp number *</span>
              <input value={form.phone} onChange={set("phone")} placeholder="0300 1234567" style={inp} />
            </div>
          </div>
          <div>
            <span style={lab}>Email (for order updates, optional)</span>
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" style={inp} />
          </div>

          {/* Summary */}
          <div style={{ border: "1px solid var(--card-b)", padding: "20px 24px", background: "var(--panel)", fontSize: 13, lineHeight: 1.9 }}>
            <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 12 }}>Your request summary</div>
            <div style={{ color: "var(--ink-muted)" }}>
              <div><strong style={{ color: "var(--ink)" }}>Shape:</strong> {form.shape} · <strong style={{ color: "var(--ink)" }}>Length:</strong> {form.length}</div>
              <div><strong style={{ color: "var(--ink)" }}>Sizes:</strong> {Object.entries(form.sizes).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ") || "Not specified"}</div>
              {form.colorPrefs && <div><strong style={{ color: "var(--ink)" }}>Colors:</strong> {form.colorPrefs}</div>}
              <div><strong style={{ color: "var(--ink)" }}>Design:</strong> {form.designNotes.slice(0, 120)}{form.designNotes.length > 120 ? "…" : ""}</div>
            </div>
          </div>

          {error && <div style={{ fontSize: 12, color: "#E39B9B", paddingLeft: 12, borderLeft: "2px solid rgba(200,90,90,.6)" }}>{error}</div>}

          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            <div onClick={() => setStep(2)} style={{ cursor: "pointer", padding: "14px 24px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", color: "var(--ink-muted)" }}>← Back</div>
            <div onClick={submit} className="shimmer" style={{ cursor: "pointer", padding: "14px 36px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", opacity: loading ? 0.6 : 1 }}>{loading ? "Sending…" : "Submit request 🌸"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
