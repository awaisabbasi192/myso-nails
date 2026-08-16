"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { rs, stars, waLink } from "@/lib/format";
import RecentlyViewed from "./RecentlyViewed";

const SHAPES = ["Almond", "Coffin", "Square", "Stiletto"];
const SIZES = ["Short set", "Medium set", "Long set", "Custom sizes"];
const ACCORDIONS = [
  { key: "apply", title: "How to apply", body: "Wipe each nail with the alcohol pad, buff lightly, pick the tab or glue that matches your nail width, press for 30 seconds from cuticle to tip. Avoid water for one hour." },
  { key: "care", title: "Care & re-wear", body: "Sets last two to three weeks with glue, five days with tabs. Soak in warm soapy water to remove, never pull. Clean the underside and re-wear up to four times." },
  { key: "ship", title: "Delivery & returns", body: "Dispatch within 48 hours from Lahore, 2–4 days nationwide. Free over Rs 5,000, otherwise Rs 250. Custom and bridal sets are non-returnable but we re-size free once." },
];

export default function ProductDetail({ product, reviews, related }) {
  const { addToCart, toggleWish, isWished } = useCart();
  const router = useRouter();
  const [shape, setShape] = useState(product.shape);
  const [size, setSize] = useState("Medium set");
  const [qty, setQty] = useState(1);
  const [gallery, setGallery] = useState(0);
  const [openAcc, setOpenAcc] = useState("apply");
  const extraImages = (() => { try { return JSON.parse(product.images || "[]"); } catch { return []; } })();
  const allImages = [product.image, ...extraImages.filter((x) => x && x !== product.image)];
  const wished = isWished(product.slug);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertStatus, setAlertStatus] = useState(""); // "" | "sending" | "done" | "error"
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, body: "", image: "", image2: "" });
  const [reviewStatus, setReviewStatus] = useState(""); // "" | "submitting" | "done" | "error"
  const [reviewVerified, setReviewVerified] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const setRF = (k) => (e) => setReviewForm((f) => ({ ...f, [k]: e.target.value }));

  async function uploadReviewPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    // Fill the first empty slot (image, then image2)
    const slot = !reviewForm.image ? "image" : !reviewForm.image2 ? "image2" : null;
    if (!slot) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.path) setReviewForm((f) => ({ ...f, [slot]: data.path }));
    } catch {}
    setPhotoUploading(false);
  }

  async function submitReview() {
    if (!reviewForm.name.trim() || !reviewForm.body.trim() || reviewStatus === "submitting") return;
    setReviewStatus("submitting");
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...reviewForm, productId: product.id }) });
      if (res.ok) { const d = await res.json().catch(() => ({})); setReviewVerified(!!d.verified); setReviewStatus("done"); setReviewForm({ name: "", rating: 5, body: "", image: "", image2: "" }); }
      else setReviewStatus("error");
    } catch { setReviewStatus("error"); }
  }

  async function subscribeAlert() {
    if (!alertEmail.trim() || alertStatus === "sending") return;
    setAlertStatus("sending");
    try {
      const res = await fetch("/api/stock-alert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, email: alertEmail.trim() }) });
      setAlertStatus(res.ok ? "done" : "error");
    } catch { setAlertStatus("error"); }
  }

  function add() {
    addToCart({ slug: product.slug, name: product.name, image: product.image, price: product.price, size }, qty);
    router.push("/cart");
  }
  const savePct = product.wasPrice ? Math.round((1 - product.price / product.wasPrice) * 100) : 0;

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "34px 24px 90px" }}>
      <Link href="/shop" style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 24, display: "inline-block" }}>← Back to shop</Link>

      <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 56, alignItems: "start" }}>
        {/* Gallery */}
        <div>
          <div className="zoom-wrap" style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(227,183,166,.16)" }}>
            <img src={allImages[gallery] || product.image} alt={product.name} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", transition: "opacity .4s ease" }} />
            {allImages.length > 1 && (
              <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(10,10,11,.8)", border: "1px solid rgba(227,183,166,.28)", fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", padding: "8px 12px", color: "rgba(247,241,237,.7)" }}>{gallery + 1} / {allImages.length}</div>
            )}
          </div>
          {allImages.length > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(allImages.length, 5)},1fr)`, gap: 10, marginTop: 12 }}>
              {allImages.map((img, i) => (
                <div key={i} onClick={() => setGallery(i)} style={{ cursor: "pointer", border: `1px solid ${i === gallery ? "var(--bronze)" : "rgba(227,183,166,.24)"}`, overflow: "hidden", aspectRatio: "1/1" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(227,183,166,.8)" }}>{product.badge} · {product.occasion}</div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 52, lineHeight: 1.05, margin: "14px 0 12px" }}>{product.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "rgba(247,241,237,.5)" }}><span style={{ color: "var(--bronze)" }}>{stars(product.rating)}</span> <span>{product.rating} · {product.reviewsCount} reviews</span></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "24px 0 18px" }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 36, color: "var(--rose-light)" }}>{rs(product.price)}</span>
            {product.wasPrice ? <span style={{ fontSize: 14, color: "rgba(247,241,237,.35)", textDecoration: "line-through" }}>{rs(product.wasPrice)}</span> : null}
            {savePct > 0 && <span style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.35)", padding: "5px 9px", color: "var(--rose)", whiteSpace: "nowrap" }}>Save {savePct}%</span>}
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.9, color: "rgba(247,241,237,.6)", fontWeight: 300, maxWidth: 480 }}>{product.blurb}</p>
          <div style={{ fontSize: 12, letterSpacing: ".16em", color: "rgba(247,241,237,.45)", marginBottom: product.stock > 0 && product.stock <= 5 ? 16 : 26 }}>{product.colorway}</div>
          {product.stock > 0 && product.stock <= 5 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 24, padding: "10px 16px", border: "1px solid rgba(196,35,61,.4)", background: "rgba(196,35,61,.08)", borderRadius: 2 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4233D", display: "inline-block", animation: "msPulse 1.6s ease-out infinite" }} />
              <span style={{ fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--rose-light)" }}>
                {product.stock === 1 ? "Last one left" : `Only ${product.stock} left`} — selling fast
              </span>
            </div>
          )}

          {/* Shape */}
          <div style={{ borderTop: "1px solid rgba(227,183,166,.14)", paddingTop: 22 }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.55)", marginBottom: 12 }}>Shape</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SHAPES.map((o) => (
                <div key={o} onClick={() => setShape(o)} style={{ cursor: "pointer", fontSize: 12, letterSpacing: ".14em", padding: "11px 18px", border: `1px solid ${o === shape ? "var(--bronze)" : "rgba(227,183,166,.25)"}`, color: o === shape ? "var(--rose-light)" : "rgba(247,241,237,.6)" }}>{o}</div>
              ))}
            </div>
          </div>
          {/* Size */}
          <div style={{ paddingTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.55)" }}>Size set</div>
              <Link href="/size-guide" style={{ fontSize: 11.5, color: "var(--rose)", borderBottom: "1px solid rgba(227,183,166,.4)" }}>Size guide →</Link>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SIZES.map((o) => (
                <div key={o} onClick={() => setSize(o)} style={{ cursor: "pointer", fontSize: 12, letterSpacing: ".14em", padding: "11px 18px", border: `1px solid ${o === size ? "var(--bronze)" : "rgba(227,183,166,.25)"}`, color: o === size ? "var(--rose-light)" : "rgba(247,241,237,.6)" }}>{o}</div>
              ))}
            </div>
          </div>

          {/* Qty + add */}
          <div style={{ display: "flex", gap: 12, alignItems: "stretch", marginTop: 30, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(227,183,166,.3)" }}>
              <div onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ cursor: "pointer", padding: "0 16px", fontSize: 17, color: "rgba(247,241,237,.6)" }}>−</div>
              <div style={{ minWidth: 34, textAlign: "center", fontSize: 14 }}>{qty}</div>
              <div onClick={() => setQty((q) => q + 1)} style={{ cursor: "pointer", padding: "0 16px", fontSize: 17, color: "rgba(247,241,237,.6)" }}>+</div>
            </div>
            {product.stock > 0 ? (
              <div onClick={add} className="shimmer" style={{ cursor: "pointer", flex: 1, minWidth: 190, textAlign: "center", padding: "18px 26px", fontSize: 11.5, letterSpacing: ".26em", textTransform: "uppercase" }}>Add to bag — {rs(product.price * qty)}</div>
            ) : (
              <div style={{ flex: 1, minWidth: 190, textAlign: "center", padding: "18px 26px", fontSize: 11.5, letterSpacing: ".26em", textTransform: "uppercase", background: "rgba(247,241,237,.06)", color: "rgba(247,241,237,.3)", border: "1px solid rgba(247,241,237,.1)" }}>Sold out</div>
            )}
            <a href={waLink("Hi M&S! I want to order this set: " + product.name)} target="_blank" rel="noreferrer" style={{ border: "1px solid #25D366", color: "var(--ink)", padding: "18px 24px", fontSize: 11.5, letterSpacing: ".18em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 9 }} className="btn-wa">✆ Order via WhatsApp</a>
          </div>
          {product.stock === 0 && (
            <div style={{ marginTop: 14, padding: "18px 20px", background: "rgba(200,90,90,.06)", border: "1px solid rgba(200,90,90,.25)" }}>
              <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#E39B9B", marginBottom: 12 }}>Sold out — notify me when back</div>
              {alertStatus === "done" ? (
                <div style={{ fontSize: 13, color: "#8FD6A6" }}>✓ Done! We'll email you as soon as it's back in stock.</div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && subscribeAlert()} type="email" placeholder="Your email address" style={{ flex: 1, minWidth: 200, background: "transparent", border: "1px solid rgba(227,183,166,.3)", color: "var(--ink)", padding: "11px 14px", fontSize: 13, outline: "none" }} />
                  <div onClick={subscribeAlert} style={{ cursor: "pointer", background: "rgba(200,90,90,.2)", border: "1px solid rgba(200,90,90,.4)", color: "#E39B9B", padding: "11px 18px", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{alertStatus === "sending" ? "…" : "Notify me"}</div>
                </div>
              )}
              {alertStatus === "error" && <div style={{ fontSize: 11.5, color: "#E39B9B", marginTop: 8 }}>Could not save — try again.</div>}
              <div style={{ fontSize: 11, color: "rgba(247,241,237,.35)", marginTop: 10 }}>No spam. One email, when it's back.</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 22, marginTop: 20, fontSize: 11.5, color: "rgba(247,241,237,.45)", flexWrap: "wrap" }}>
            <span>{product.stock > 0 ? `In stock (${product.stock} left) · ships in 48h` : "Sold out"}</span><span>·</span><span>Free delivery over Rs 5,000</span><span>·</span><span>Secure JazzCash payment</span>
          </div>

          {/* Accordions */}
          <div style={{ marginTop: 34, borderTop: "1px solid rgba(227,183,166,.14)" }}>
            {ACCORDIONS.map((a) => {
              const open = openAcc === a.key;
              return (
                <div key={a.key} style={{ borderBottom: "1px solid rgba(227,183,166,.14)" }}>
                  <div onClick={() => setOpenAcc(open ? "" : a.key)} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "19px 0", fontSize: 12.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,241,237,.8)" }}>{a.title} <span style={{ color: "var(--bronze)", fontSize: 16 }}>{open ? "−" : "+"}</span></div>
                  {open && <div style={{ fontSize: 13.5, lineHeight: 1.9, color: "rgba(247,241,237,.55)", fontWeight: 300, paddingBottom: 20, maxWidth: 520 }}>{a.body}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div style={{ marginTop: 80, borderTop: "1px solid rgba(227,183,166,.14)", paddingTop: 44 }}>
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 34, margin: "0 0 26px" }}>Reviews ({product.reviewsCount})</h3>
        {reviews.length === 0 ? (
          <div style={{ color: "rgba(247,241,237,.5)", fontSize: 13.5 }}>No written reviews yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ border: "1px solid rgba(227,183,166,.14)", padding: 24, background: "var(--panel)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: "var(--bronze)", letterSpacing: ".24em", fontSize: 12 }}>{stars(r.rating)}</div>
                  <div style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(247,241,237,.35)" }}>{r.date}</div>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "rgba(247,241,237,.68)", fontWeight: 300, margin: "14px 0 16px" }}>{r.body}</p>
                {(r.image || r.image2) && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {r.image && <img src={r.image} alt="" style={{ width: 56, height: 56, objectFit: "cover", border: "1px solid rgba(227,183,166,.2)" }} />}
                    {r.image2 && <img src={r.image2} alt="" style={{ width: 56, height: 56, objectFit: "cover", border: "1px solid rgba(227,183,166,.2)" }} />}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "rgba(247,241,237,.5)" }}>{r.name} · verified buyer</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write a review */}
      <div style={{ marginTop: 44, border: "1px solid rgba(227,183,166,.16)", background: "var(--panel)", padding: 28 }}>
        <h4 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 26, margin: "0 0 20px" }}>Write a review</h4>
        {reviewStatus === "done" ? (
          <div style={{ fontSize: 13.5, color: "#8FD6A6", padding: "16px 20px", border: "1px solid rgba(143,214,166,.3)" }}>{reviewVerified ? "Thank you! Your verified review is now live." : "Thank you! Your review has been submitted and will appear once approved."}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <div style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginBottom: 8 }}>Your name</div>
                <input value={reviewForm.name} onChange={setRF("name")} placeholder="Areeba K." style={{ background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: 13, fontSize: 13, outline: "none", width: "100%" }} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginBottom: 8 }}>Rating</div>
                <select value={reviewForm.rating} onChange={setRF("rating")} style={{ background: "var(--bg)", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: 13, fontSize: 13, outline: "none" }}>
                  {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginBottom: 8 }}>Your review</div>
              <textarea value={reviewForm.body} onChange={setRF("body")} rows={3} placeholder="How did the set look? How long did it last?" style={{ background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: 13, fontSize: 13, outline: "none", width: "100%", resize: "vertical" }} />
            </div>
            {/* Photo upload */}
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginBottom: 8 }}>Add photos <span style={{ textTransform: "none", letterSpacing: 0, color: "rgba(247,241,237,.3)" }}>(optional, up to 2)</span></div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {[reviewForm.image, reviewForm.image2].filter(Boolean).map((src, i) => (
                  <div key={i} style={{ position: "relative", width: 64, height: 64 }}>
                    <img src={src} alt="" style={{ width: 64, height: 64, objectFit: "cover", border: "1px solid rgba(227,183,166,.3)", borderRadius: 2 }} />
                    <div
                      onClick={() => setReviewForm((f) => (i === 0 ? { ...f, image: f.image2, image2: "" } : { ...f, image2: "" }))}
                      style={{ position: "absolute", top: -7, right: -7, width: 20, height: 20, borderRadius: "50%", background: "var(--rose)", color: "#fff", display: "grid", placeItems: "center", fontSize: 13, cursor: "pointer", lineHeight: 1 }}
                    >×</div>
                  </div>
                ))}
                {!(reviewForm.image && reviewForm.image2) && (
                  <label style={{ width: 64, height: 64, border: "1px dashed rgba(227,183,166,.4)", borderRadius: 2, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--rose)", fontSize: 22, background: "var(--bg)" }}>
                    {photoUploading ? "…" : "＋"}
                    <input type="file" accept="image/*" onChange={uploadReviewPhoto} style={{ display: "none" }} disabled={photoUploading} />
                  </label>
                )}
              </div>
            </div>
            {reviewStatus === "error" && <div style={{ fontSize: 12, color: "#E39B9B" }}>Could not submit — please try again.</div>}
            <div onClick={submitReview} className="shimmer" style={{ cursor: "pointer", textAlign: "center", padding: 14, fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", alignSelf: "flex-start", minWidth: 180 }}>{reviewStatus === "submitting" ? "Submitting…" : "Submit review"}</div>
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 70 }}>
          <h3 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 34, margin: "0 0 24px" }}>You may also like</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {related.map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="card" style={{ display: "block" }}>
                <div style={{ aspectRatio: "1/1", overflow: "hidden" }}><img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--ink)" }}>{p.name}</span>
                  <span style={{ fontSize: 13, color: "var(--rose-light)" }}>{rs(p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently viewed (client-side, from localStorage) */}
      <RecentlyViewed current={{ slug: product.slug, name: product.name, image: product.image, price: product.price }} />
    </div>
  );
}
