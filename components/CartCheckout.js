"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { rs, waLink } from "@/lib/format";

const FLOWERS = ["🌸", "🌺", "🌷", "✨", "💫", "🎀", "🌹", "💅", "🎉", "⭐", "🌼", "💝"];
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  emoji: FLOWERS[i % FLOWERS.length],
  x: (i * 2.6) % 100,
  dur: 2.6 + (i % 7) * 0.3,
  delay: (i % 10) * 0.16,
  size: 15 + (i % 4) * 7,
}));

const FREE_DELIVERY_OVER = 5000;
const DELIVERY_FEE = 300;

export default function CartCheckout({ prefill }) {
  const { cart, incItem, decItem, removeItem, clearCart, subtotal, ready } = useCart();
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({
    customerName: prefill?.name || "", phone: prefill?.phone || "",
    address: prefill?.address || "", city: prefill?.city || "", nailSizes: prefill?.nailSizes || "", notes: "",
  });
  const [payMethod, setPayMethod] = useState("jazzcash");
  const [proof, setProof] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [coupon, setCoupon] = useState({ code: "", applied: null, error: "" });
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [agreed, setAgreed] = useState(false);

  const set = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  const shipping = subtotal >= FREE_DELIVERY_OVER || subtotal === 0 ? 0 : DELIVERY_FEE;
  const discount = coupon.applied?.discount || 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  async function applyCoupon() {
    setCoupon((c) => ({ ...c, error: "" }));
    if (!coupon.code.trim()) return;
    try {
      const res = await fetch(`/api/coupon?code=${encodeURIComponent(coupon.code)}&subtotal=${subtotal}`);
      const data = await res.json();
      if (!res.ok) { setCoupon((c) => ({ ...c, applied: null, error: data.error })); return; }
      setCoupon((c) => ({ ...c, applied: data }));
    } catch { setCoupon((c) => ({ ...c, error: "Could not check code" })); }
  }

  async function uploadProof(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setProof({ path: data.path, name: file.name });
    } catch {} finally { setUploading(false); }
  }

  async function placeOrder() {
    if (placing) return;
    setErr("");
    if (!proof) { setErr("Please upload your JazzCash payment screenshot to place the order."); return; }
    if (!agreed) { setErr("Please accept the Terms & Refund Policy to continue."); return; }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          items: cart,
          paymentMethod: payMethod,
          couponCode: coupon.applied?.code || null,
          paymentProof: proof?.path || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Could not place order"); return; }
      setOrder(data);
      clearCart();
      setStep(4);
      window.scrollTo(0, 0);
    } catch { setErr("Network error"); } finally { setPlacing(false); }
  }

  function next() { setStep((s) => Math.min(4, s + 1)); window.scrollTo(0, 0); }
  function prev() { setStep((s) => Math.max(1, s - 1)); }

  const inputStyle = { background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: 14, fontSize: 13, outline: "none", width: "100%", minWidth: 0 };
  const lab = { fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)" };
  const STEP_LABELS = ["Bag", "Details", "Payment", "Done"];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 24px 100px" }}>
      {/* Steps nav */}
      <div style={{ display: "flex", gap: 26, alignItems: "center", marginBottom: 40, flexWrap: "wrap" }}>
        {STEP_LABELS.map((l, i) => {
          const n = i + 1, active = step === n, done = step > n;
          return (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 11, border: `1px solid ${active || done ? "var(--bronze)" : "rgba(227,183,166,.25)"}`, background: active ? "var(--bronze)" : "transparent", color: active ? "#1A0F0A" : done ? "var(--rose-light)" : "rgba(247,241,237,.4)" }}>{done ? "✓" : n}</span>
              <span style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: active ? "var(--rose-light)" : "rgba(247,241,237,.4)" }}>{l}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: BAG */}
      {step === 1 && (
        <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1.5fr .9fr", gap: 44, alignItems: "start" }}>
          <div>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 44, margin: "0 0 26px" }}>Your bag</h1>
            {ready && cart.length === 0 && (
              <div style={{ border: "1px dashed rgba(227,183,166,.25)", padding: 40, textAlign: "center", color: "rgba(247,241,237,.5)", fontSize: 13.5 }}>Your bag is empty. <Link href="/shop" style={{ color: "var(--rose)", borderBottom: "1px solid rgba(227,183,166,.4)" }}>Browse the sets</Link></div>
            )}
            {cart.map((c, i) => (
              <div key={c.slug + c.size + i} className="bag-item" style={{ display: "grid", gridTemplateColumns: "96px 1fr auto", gap: 20, alignItems: "center", borderTop: "1px solid rgba(227,183,166,.14)", padding: "22px 0" }}>
                <img src={c.image} alt={c.name} style={{ width: 96, height: 112, objectFit: "cover" }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 23 }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,241,237,.42)", margin: "7px 0 14px" }}>{c.size} · {rs(c.price)} each</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(227,183,166,.28)" }}>
                      <div onClick={() => decItem(i)} style={{ cursor: "pointer", padding: "5px 13px", color: "rgba(247,241,237,.6)" }}>−</div>
                      <div style={{ minWidth: 26, textAlign: "center", fontSize: 13 }}>{c.qty}</div>
                      <div onClick={() => incItem(i)} style={{ cursor: "pointer", padding: "5px 13px", color: "rgba(247,241,237,.6)" }}>+</div>
                    </div>
                    <div onClick={() => removeItem(i)} style={{ cursor: "pointer", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(247,241,237,.35)" }}>Remove</div>
                  </div>
                </div>
                <div style={{ fontSize: 15, color: "var(--rose-light)", whiteSpace: "nowrap" }}>{rs(c.price * c.qty)}</div>
              </div>
            ))}
          </div>
          <Summary {...{ subtotal, shipping, discount, total, coupon, setCoupon, applyCoupon }}>
            <div onClick={() => cart.length && next()} className="shimmer" style={{ cursor: cart.length ? "pointer" : "not-allowed", opacity: cart.length ? 1 : 0.5, textAlign: "center", marginTop: 22, padding: 17, fontSize: 11.5, letterSpacing: ".26em", textTransform: "uppercase" }}>Checkout</div>
            <a href={waLink("Hi! I want to order")} target="_blank" rel="noreferrer" className="btn-wa" style={{ display: "block", textAlign: "center", marginTop: 10, padding: 15, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>Order on WhatsApp instead</a>
          </Summary>
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {step === 2 && (
        <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1.4fr .9fr", gap: 44, alignItems: "start" }}>
          <div>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 42, margin: "0 0 28px" }}>Delivery details</h1>
            <div className="checkout-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Full name" style={lab} inputStyle={inputStyle} value={details.customerName} onChange={set("customerName")} placeholder="Areeba Khan" />
              <Field label="WhatsApp number" style={lab} inputStyle={inputStyle} value={details.phone} onChange={set("phone")} placeholder="0300 1234567" />
              <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Address</span><input value={details.address} onChange={set("address")} placeholder="House, street, area" style={inputStyle} /></div>
              <Field label="City" style={lab} inputStyle={inputStyle} value={details.city} onChange={set("city")} placeholder="Lahore" />
              <Field label="Nail sizes (optional)" style={lab} inputStyle={inputStyle} value={details.nailSizes} onChange={set("nailSizes")} placeholder="e.g. 9,7,8,8,6" />
              <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 8 }}><span style={lab}>Notes for Maya</span><textarea rows={3} value={details.notes} onChange={set("notes")} placeholder="Event date, design references, anything else" style={{ ...inputStyle, resize: "vertical" }} /></div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
              <div onClick={prev} style={{ cursor: "pointer", border: "1px solid rgba(227,183,166,.3)", padding: "16px 26px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.7)" }}>Back</div>
              <div onClick={() => (details.customerName && details.phone && details.address && details.city) ? next() : setErr("Please fill name, phone, address and city") } className="gradient-warm" style={{ cursor: "pointer", padding: "16px 34px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase" }}>Continue to payment</div>
            </div>
            {err && <div style={{ marginTop: 14, fontSize: 12, color: "#E39B9B" }}>{err}</div>}
          </div>
          <MiniSummary cart={cart} total={total} />
        </div>
      )}

      {/* STEP 3: PAYMENT */}
      {step === 3 && (
        <div style={{ maxWidth: 760 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 42, margin: "0 0 10px" }}>Payment</h1>
          <div style={{ fontSize: 13, color: "rgba(247,241,237,.5)", marginBottom: 24, lineHeight: 1.7 }}>
            We take <span style={{ color: "var(--rose)" }}>100% advance payment via JazzCash</span> to confirm every order. Cash on delivery is not available.
          </div>

          <div style={{ border: "1px solid rgba(227,183,166,.2)", padding: 30, background: "var(--panel)" }}>
            <div data-r="split" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 30, alignItems: "start" }}>
              <div style={{ width: 150, height: 150, background: "#fff", display: "grid", placeItems: "center", padding: 8, flexShrink: 0 }}>
                <img src="/assets/jazzcash-qr.png" alt="JazzCash QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                <div style={{ display: "none", width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#C08A72", fontSize: 10, textAlign: "center", letterSpacing: ".1em", textTransform: "uppercase" }}>
                  <span style={{ fontSize: 28 }}>⬡</span>QR here
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)" }}>Send exactly {rs(total)} to</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 34, margin: "10px 0 4px", letterSpacing: ".04em" }}>0306 2451766</div>
                <div style={{ fontSize: 12.5, color: "rgba(247,241,237,.5)" }}>JazzCash · <span style={{ color: "var(--rose-light)" }}>Naseem</span> · Myso Nails Studio</div>
                <div style={{ fontSize: 12, color: "rgba(247,241,237,.42)", marginTop: 8, lineHeight: 1.7 }}>Open JazzCash → Send Money → enter the number above → send the exact total → screenshot the confirmation.</div>
                <label style={{ cursor: "pointer", display: "block", marginTop: 18, border: `1px dashed ${proof ? "rgba(143,214,166,.5)" : "rgba(227,183,166,.4)"}`, padding: 20, textAlign: "center", fontSize: 11.5, letterSpacing: ".18em", textTransform: "uppercase", color: proof ? "var(--good)" : "rgba(247,241,237,.6)" }}>
                  {uploading ? "Uploading…" : proof ? `✓ ${proof.name} uploaded` : "+ Upload payment screenshot *"}
                  <input type="file" accept="image/*" onChange={uploadProof} style={{ display: "none" }} />
                </label>
                <div style={{ fontSize: 12, color: "rgba(247,241,237,.42)", marginTop: 12, lineHeight: 1.7 }}>Your order is placed as <span style={{ color: "var(--rose)" }}>Pending verification</span> until we confirm your JazzCash payment (usually within 30 minutes).</div>
              </div>
            </div>
          </div>

          {/* Terms agreement */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 11, marginTop: 22, cursor: "pointer", fontSize: 12.5, color: "rgba(247,241,237,.6)", lineHeight: 1.6 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: "#C08A72", width: 15, height: 15, flexShrink: 0 }} />
            <span>I have paid in advance via JazzCash and I agree to the <Link href="/policies" target="_blank" style={{ color: "var(--rose)", borderBottom: "1px solid rgba(227,183,166,.4)" }}>Terms &amp; Refund Policy</Link>.</span>
          </label>

          {err && <div style={{ marginTop: 16, fontSize: 12, color: "#E39B9B" }}>{err}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <div onClick={prev} style={{ cursor: "pointer", border: "1px solid rgba(227,183,166,.3)", padding: "16px 26px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.7)" }}>Back</div>
            <div onClick={placeOrder} className="shimmer" style={{ cursor: "pointer", padding: "16px 40px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase" }}>{placing ? "Placing…" : `Place order · ${rs(total)}`}</div>
          </div>
        </div>
      )}

      {/* STEP 4: CELEBRATION */}
      {step === 4 && order && (
        <>
          {/* Falling flowers confetti */}
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", overflow: "hidden" }}>
            {CONFETTI.map((p, i) => (
              <span
                key={i}
                className="confetti-particle"
                style={{
                  left: p.x + "%",
                  fontSize: p.size + "px",
                  animation: `confettiFall ${p.dur}s ease-in ${p.delay}s both`,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </div>

          {/* Thank you card */}
          <div className="celebration-card" style={{ maxWidth: 640, margin: "20px auto", textAlign: "center", padding: "64px 40px 52px", background: "var(--panel)", border: "1px solid var(--card-b)", borderRadius: 4, position: "relative", overflow: "hidden" }}>
            {/* Background glow */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(196,35,61,.13) 0%, transparent 65%)", pointerEvents: "none" }} />

            {/* Script headline */}
            <div className="text-gradient" style={{ fontFamily: "var(--script)", fontSize: 68, lineHeight: 1, position: "relative" }}>
              Thank you
            </div>

            {/* Customer name */}
            <div className="celebration-name" style={{ fontFamily: "var(--serif)", fontSize: 38, fontWeight: 300, margin: "10px 0 6px", color: "var(--ink)", position: "relative" }}>
              {details.customerName} 💅
            </div>

            <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 28 }}>
              Aapka order place ho gaya!
            </div>

            {/* Order code */}
            <div className="celebration-order" style={{ margin: "0 auto 28px", maxWidth: 340, border: "1px solid var(--card-b)", padding: "24px 0", background: "var(--bg)" }}>
              <div style={{ fontSize: 10, letterSpacing: ".34em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 10 }}>Order ID</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 36, color: "var(--rose-light)", letterSpacing: ".06em" }}>{order.code}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "7px 14px", color: "var(--rose)", borderRadius: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                Pending payment verification
              </div>
            </div>

            {/* Info text */}
            <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "var(--ink-muted)", maxWidth: 440, margin: "0 auto 16px" }}>
              Aapka JazzCash payment verify hone ke baad <strong style={{ color: "var(--ink)" }}>30 minutes</strong> mein WhatsApp confirmation aayega — phir <strong style={{ color: "var(--ink)" }}>48 hours</strong> mein dispatch! 🚀
            </p>
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--ink-faint)", maxWidth: 400, margin: "0 auto 32px", border: "1px solid var(--card-b)", padding: "12px 16px" }}>
              📧 Agar aapne account se order kiya hai, ek confirmation email bhi bheji gayi hai — inbox check karein, nahi ayi to <strong style={{ color: "var(--ink-muted)" }}>spam/junk folder</strong> zaroor dekhein.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href={waLink(`Assalam o Alaikum! Mera order ID hai ${order.code} — confirm karein please 🌸`)}
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #25D366", color: "var(--ink)", padding: "15px 26px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", borderRadius: 2 }}
              >
                <span style={{ fontSize: 16 }}>💬</span> WhatsApp se share karein
              </a>
              <Link href="/account" className="gradient-warm" style={{ display: "flex", alignItems: "center", gap: 8, padding: "15px 26px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", borderRadius: 2 }}>
                <span style={{ fontSize: 16 }}>📦</span> Track my order
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, style, inputStyle, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <span style={style}>{label}</span>
      <input style={inputStyle} {...props} />
    </div>
  );
}

function Summary({ subtotal, shipping, discount, total, coupon, setCoupon, applyCoupon, children }) {
  return (
    <div style={{ border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)", padding: 30 }}>
      <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 22 }}>Order summary</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13, fontSize: 13.5, color: "rgba(247,241,237,.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span style={{ color: "var(--ink)" }}>{rs(subtotal)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Delivery charges</span><span style={{ color: "var(--ink)" }}>{shipping === 0 ? (subtotal === 0 ? "—" : "Free") : rs(shipping)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Coupon</span><span style={{ color: discount ? "var(--rose-light)" : "rgba(247,241,237,.4)" }}>{discount ? "− " + rs(discount) : "—"}</span></div>
      </div>
      {subtotal > 0 && subtotal < 5000 && (
        <div style={{ fontSize: 11, color: "rgba(247,241,237,.42)", marginTop: 10, lineHeight: 1.6 }}>Add {rs(5000 - subtotal)} more for <span style={{ color: "var(--rose)" }}>free delivery</span> (orders Rs 5,000+).</div>
      )}
      <div style={{ display: "flex", gap: 8, margin: "20px 0" }}>
        <input value={coupon.code} onChange={(e) => setCoupon((c) => ({ ...c, code: e.target.value }))} placeholder="Coupon code" style={{ flex: 1, background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: 12, fontSize: 12.5, outline: "none" }} />
        <div onClick={applyCoupon} style={{ cursor: "pointer", border: "1px solid rgba(227,183,166,.3)", padding: "12px 16px", fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(247,241,237,.7)" }}>Apply</div>
      </div>
      {coupon.error && <div style={{ fontSize: 11.5, color: "#E39B9B", marginBottom: 12 }}>{coupon.error}</div>}
      {coupon.applied && <div style={{ fontSize: 11.5, color: "var(--good)", marginBottom: 12 }}>{coupon.applied.code} applied ✓</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid rgba(227,183,166,.16)", paddingTop: 18 }}>
        <span style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.55)" }}>Total</span>
        <span style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--rose-light)" }}>{rs(total)}</span>
      </div>
      {children}
    </div>
  );
}

function MiniSummary({ cart, total }) {
  return (
    <div style={{ border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)", padding: 28 }}>
      <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 20 }}>In your bag</div>
      {cart.map((c, i) => (
        <div key={c.slug + i} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
          <img src={c.image} alt={c.name} style={{ width: 52, height: 60, objectFit: "cover" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: "rgba(247,241,237,.42)", marginTop: 4 }}>{c.size} × {c.qty}</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--rose-light)" }}>{rs(c.price * c.qty)}</div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(227,183,166,.16)", paddingTop: 16, fontSize: 13.5 }}><span style={{ color: "rgba(247,241,237,.6)" }}>Total</span><span style={{ color: "var(--rose-light)", fontSize: 19 }}>{rs(total)}</span></div>
    </div>
  );
}
