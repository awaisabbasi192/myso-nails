"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { rs } from "@/lib/format";

const STAGES = ["Pending", "Confirmed", "Shipped", "Delivered"];
const inp = { background: "transparent", border: "1px solid rgba(227,183,166,.25)", color: "var(--ink)", padding: "11px 14px", fontSize: 13, outline: "none", width: "100%" };
const modalWrap = { position: "fixed", inset: 0, zIndex: 150, background: "rgba(4,4,5,.88)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: "24px", overflowY: "auto" };

function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }

export default function AccountClient({ user: initUser, orders: initOrders, addresses: initAddresses, products }) {
  const router = useRouter();
  const [tab, setTab] = useState("Overview");
  const { wishlist, toggleWish, addToCart } = useCart();
  const [user, setUser] = useState(initUser);
  const [orders, setOrders] = useState(initOrders);
  const [addresses, setAddresses] = useState(initAddresses);

  // Order detail modal
  const [orderDetail, setOrderDetail] = useState(null);

  // Review from order
  const [reviewTarget, setReviewTarget] = useState(null); // { orderId, productId, productName }
  const [reviewForm, setReviewForm] = useState({ name: initUser.name || "", rating: 5, body: "" });
  const [reviewStatus, setReviewStatus] = useState("");

  // Address management
  const [addrForm, setAddrForm] = useState(null);
  const [addrBusy, setAddrBusy] = useState(false);

  // Password change
  const [pwForm, setPwForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState("");
  const [pwError, setPwError] = useState("");

  // Profile edit
  const [profileForm, setProfileForm] = useState({ name: initUser.name, phone: initUser.phone || "" });
  const [profileStatus, setProfileStatus] = useState("");
  const [profileError, setProfileError] = useState("");

  // Nail size profile (10 fingers)
  const parseSizes = (s) => { const a = (s || "").split(",").map((x) => x.trim()); return Array.from({ length: 10 }, (_, i) => a[i] || ""); };
  const [nailSizes, setNailSizes] = useState(() => parseSizes(initUser.nailSizes));
  const [nailStatus, setNailStatus] = useState("");

  const tabs = ["Overview", "Orders", "Wishlist", "Addresses", "Settings"];
  const wishProducts = products.filter((p) => wishlist.includes(p.slug));

  // Derived dashboard stats
  const activeOrders = orders.filter((o) => o.status !== "Cancelled" && o.status !== "Rejected");
  const totalSpent = activeOrders.reduce((s, o) => s + (o.total || 0), 0);
  const points = Math.floor(totalSpent / 100);
  const TIERS = [
    { name: "Bronze", min: 0, perk: "Welcome to Myso" },
    { name: "Silver", min: 5000, perk: "Early access to new sets" },
    { name: "Gold", min: 15000, perk: "Priority bridal slots + surprises" },
  ];
  const tierIdx = TIERS.reduce((idx, t, i) => (totalSpent >= t.min ? i : idx), 0);
  const tier = TIERS[tierIdx];
  const nextTier = TIERS[tierIdx + 1] || null;
  const tierProgress = nextTier ? Math.min(100, Math.round((totalSpent / nextTier.min) * 100)) : 100;
  const inProgressOrder = orders.find((o) => ["Pending", "Confirmed", "Shipped"].includes(o.status));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login"); router.refresh();
  }

  // Cancel order
  async function cancelOrder(order) {
    if (!confirm(`Cancel order ${order.code}? This cannot be undone.`)) return;
    const res = await fetch(`/api/account/orders/${order.id}/cancel`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "Cancelled" } : o));
      if (orderDetail?.id === order.id) setOrderDetail((d) => d ? { ...d, status: "Cancelled" } : null);
      if (data.waUrl) window.open(data.waUrl, "_blank");
    } else alert(data.error || "Could not cancel order");
  }

  // Submit review
  async function submitReview() {
    if (!reviewForm.body.trim() || reviewStatus === "submitting" || !reviewTarget) return;
    setReviewStatus("submitting");
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...reviewForm, productId: reviewTarget.productId }) });
      if (res.ok) { setReviewStatus("done"); }
      else setReviewStatus("error");
    } catch { setReviewStatus("error"); }
  }

  // Address CRUD
  function openNewAddr() { setAddrForm({ label: "Home", line1: "", line2: "", city: "", phone: "", isDefault: addresses.length === 0 }); }
  function openEditAddr(a) { setAddrForm({ ...a }); }
  async function saveAddr() {
    if (!addrForm.line1 || !addrForm.city || !addrForm.phone || addrBusy) return;
    setAddrBusy(true);
    try {
      const isEdit = !!addrForm.id;
      const res = await fetch(isEdit ? `/api/account/address/${addrForm.id}` : "/api/account/address", {
        method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addrForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || "Failed"); return; }
      router.refresh(); setAddrForm(null);
      if (isEdit) setAddresses((prev) => prev.map((a) => a.id === addrForm.id ? { ...a, ...addrForm } : addrForm.isDefault ? { ...a, isDefault: false } : a));
      else setAddresses((prev) => [...(addrForm.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev), data.address || { ...addrForm, id: Date.now().toString() }]);
    } finally { setAddrBusy(false); }
  }
  async function deleteAddr(id) {
    if (!confirm("Delete this address?")) return;
    const res = await fetch(`/api/account/address/${id}`, { method: "DELETE" });
    if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  // Password change
  async function changePassword() {
    if (pwStatus === "saving") return;
    if (!pwForm.current || !pwForm.newPassword) { setPwError("Both fields required"); return; }
    if (pwForm.newPassword !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
    if (pwForm.newPassword.length < 8) { setPwError("Min. 8 characters"); return; }
    setPwError(""); setPwStatus("saving");
    try {
      const res = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: pwForm.current, newPassword: pwForm.newPassword }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setPwError(data.error || "Failed"); setPwStatus(""); return; }
      setPwStatus("done"); setPwForm({ current: "", newPassword: "", confirm: "" });
    } catch { setPwError("Something went wrong"); setPwStatus(""); }
  }

  // Profile update
  async function saveProfile() {
    if (!profileForm.name.trim() || profileStatus === "saving") return;
    setProfileError(""); setProfileStatus("saving");
    try {
      const res = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileForm) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setProfileError(data.error || "Failed"); setProfileStatus(""); return; }
      setUser((u) => ({ ...u, name: profileForm.name, phone: profileForm.phone }));
      setProfileStatus("done");
    } catch { setProfileError("Something went wrong"); setProfileStatus(""); }
  }

  // Save nail size profile
  async function saveNailSizes() {
    if (nailStatus === "saving") return;
    setNailStatus("saving");
    const joined = nailSizes.map((x) => x.trim()).join(",");
    try {
      const res = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nailSizes: joined }) });
      if (!res.ok) { setNailStatus("error"); return; }
      setUser((u) => ({ ...u, nailSizes: joined }));
      setNailStatus("done");
      setTimeout(() => setNailStatus(""), 2500);
    } catch { setNailStatus("error"); }
  }

  // Print invoice
  function printInvoice(o) {
    const w = window.open("", "_blank");
    const itemRows = o.items.map((it) => `<tr><td>${it.name}</td><td>${it.size}</td><td>${it.qty}</td><td>Rs ${it.unitPrice * it.qty}</td></tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt ${o.code}</title><style>body{font-family:Georgia,serif;color:#111;padding:40px;max-width:600px;margin:auto}h1{font-size:28px;font-weight:300}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#888}strong{color:#B87A62}.total{font-size:18px;font-weight:600}</style></head><body><h1>Myso Nails Studio</h1><p style="color:#888">Order receipt</p><p><strong>Order:</strong> ${o.code}<br><strong>Date:</strong> ${o.date}<br><strong>Status:</strong> ${o.status}</p><table><tr><th>Item</th><th>Size</th><th>Qty</th><th>Price</th></tr>${itemRows}<tr><td colspan="3">Shipping</td><td>Rs ${o.shipping}</td></tr><tr><td colspan="3" class="total">Total</td><td class="total">Rs ${o.total}</td></tr></table><p><strong>Delivery to:</strong> ${o.address}, ${o.city}<br><strong>Payment:</strong> ${o.paymentMethod === "cod" ? "Cash on Delivery" : "JazzCash"}${o.trackingNumber ? `<br><strong>Tracking:</strong> ${o.trackingNumber}` : ""}</p><p style="color:#888;font-size:12px;margin-top:40px">Myso Nails Studio · Lahore, Pakistan · mysonails.pk</p></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
  }

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: "44px 24px 100px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 34 }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(227,183,166,.75)" }}>My account</div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 44, margin: "12px 0 0" }}>Hi, {user.name.split(" ")[0]}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "rgba(247,241,237,.45)" }}>{user.email}{user.phone ? " · " + user.phone : ""}</div>
          <div onClick={logout} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.25)", padding: "9px 14px", color: "rgba(247,241,237,.7)" }}>Sign out</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 26, borderBottom: "1px solid rgba(227,183,166,.14)", marginBottom: 34, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <div key={t} onClick={() => setTab(t)} style={{ cursor: "pointer", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", paddingBottom: 14, color: tab === t ? "var(--rose-light)" : "rgba(247,241,237,.45)", borderBottom: `2px solid ${tab === t ? "var(--bronze)" : "transparent"}` }}>
            {t}{t === "Wishlist" && wishlist.length ? ` (${wishlist.length})` : ""}
          </div>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Active order banner */}
          {inProgressOrder && (
            <div onClick={() => setOrderDetail(inProgressOrder)} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", border: "1px solid rgba(227,183,166,.35)", background: "linear-gradient(100deg,rgba(184,122,98,.14),rgba(242,205,187,.06))", padding: "18px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img src={inProgressOrder.items[0]?.image} alt="" style={{ width: 46, height: 54, objectFit: "cover", borderRadius: 2 }} />
                <div>
                  <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--rose)" }}>Order in progress</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 19, marginTop: 3 }}>{inProgressOrder.code} · {inProgressOrder.status}</div>
                </div>
              </div>
              <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.4)", padding: "10px 16px", color: "var(--rose-light)" }}>Track →</div>
            </div>
          )}

          {/* Stat cards */}
          <div className="acct-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { label: "Orders", value: orders.length },
              { label: "Total spent", value: rs(totalSpent) },
              { label: "Reward points", value: points },
              { label: "Wishlist", value: wishlist.length },
            ].map((s) => (
              <div key={s.label} style={{ border: "1px solid rgba(227,183,166,.16)", background: "var(--panel)", padding: "20px 18px" }}>
                <div style={{ fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.42)" }}>{s.label}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--ink)", marginTop: 8 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Loyalty tier */}
          <div style={{ border: "1px solid rgba(227,183,166,.2)", background: "var(--panel)", padding: "26px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)" }}>Myso rewards</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 26, marginTop: 6 }}>{tier.name} member <span style={{ fontSize: 15, color: "rgba(247,241,237,.45)" }}>· {points} pts</span></div>
              </div>
              <div style={{ fontSize: 12, color: "rgba(247,241,237,.5)", textAlign: "right", maxWidth: 220 }}>{tier.perk}</div>
            </div>
            {nextTier ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ height: 8, background: "rgba(227,183,166,.14)", borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ width: `${tierProgress}%`, height: "100%", background: "linear-gradient(100deg,#B87A62,#F2CDBB)" }} />
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(247,241,237,.45)", marginTop: 8 }}>Spend {rs(Math.max(0, nextTier.min - totalSpent))} more to reach <span style={{ color: "var(--rose-light)" }}>{nextTier.name}</span></div>
              </div>
            ) : (
              <div style={{ fontSize: 11.5, color: "var(--good)", marginTop: 14 }}>You've reached our top tier — thank you for the love ♥</div>
            )}
            <div style={{ fontSize: 11, color: "rgba(247,241,237,.35)", marginTop: 12 }}>Earn 1 point for every Rs 100 spent. Points unlock perks and surprise offers.</div>
          </div>

          {/* Recent orders */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.55)" }}>Recent orders</div>
              {orders.length > 2 && <div onClick={() => setTab("Orders")} style={{ cursor: "pointer", fontSize: 11, color: "var(--rose)", borderBottom: "1px solid rgba(227,183,166,.4)" }}>View all</div>}
            </div>
            {orders.length === 0 ? (
              <div style={{ border: "1px dashed rgba(227,183,166,.25)", padding: 34, textAlign: "center", color: "rgba(247,241,237,.5)", fontSize: 13.5 }}>No orders yet. <Link href="/shop" style={{ color: "var(--rose)" }}>Start shopping</Link></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orders.slice(0, 2).map((o) => (
                  <div key={o.id} onClick={() => setOrderDetail(o)} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, border: "1px solid rgba(227,183,166,.14)", background: "var(--panel)", padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <img src={o.items[0]?.image} alt="" style={{ width: 42, height: 50, objectFit: "cover", flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 18, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.items.map((it) => it.name).join(", ")}</div>
                        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginTop: 3 }}>{o.code} · {o.date}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.3)", padding: "7px 11px", color: o.status === "Cancelled" || o.status === "Rejected" ? "#E39B9B" : "var(--rose)", whiteSpace: "nowrap", flexShrink: 0 }}>{o.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="acct-quick" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Shop sets", href: "/shop", icon: "🛍" },
              { label: "Custom order", href: "/custom", icon: "🎨" },
              { label: "Size guide", href: "/size-guide", icon: "📏" },
              { label: "Bridal", href: "/bridal", icon: "💍" },
            ].map((q) => (
              <Link key={q.href} href={q.href} style={{ border: "1px solid rgba(227,183,166,.16)", background: "var(--panel)", padding: "20px 14px", textAlign: "center", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{q.icon}</span>
                <span style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(247,241,237,.7)" }}>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === "Orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {orders.length === 0 && <div style={{ border: "1px dashed rgba(227,183,166,.25)", padding: 40, textAlign: "center", color: "rgba(247,241,237,.5)", fontSize: 13.5 }}>No orders yet. <Link href="/shop" style={{ color: "var(--rose)" }}>Start shopping</Link></div>}
          {orders.map((o) => {
            const stage = STAGES.indexOf(o.status);
            const rejected = o.status === "Rejected" || o.status === "Cancelled";
            return (
              <div key={o.id} style={{ border: "1px solid rgba(227,183,166,.16)", background: "var(--panel)", padding: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <img src={o.items[0]?.image} alt="" style={{ width: 64, height: 74, objectFit: "cover" }} />
                    <div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>{o.items.map((it) => it.name).join(", ")}</div>
                      <div style={{ fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginTop: 6 }}>{o.code} · {o.date} · {rs(o.total)}</div>
                      {o.trackingNumber && <div style={{ fontSize: 12, color: "var(--bronze)", marginTop: 4 }}>Tracking: {o.trackingNumber}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.3)", padding: "9px 13px", color: rejected ? "#E39B9B" : "var(--rose)", whiteSpace: "nowrap" }}>{o.status}</div>
                    <div onClick={() => setOrderDetail(o)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", background: "rgba(227,183,166,.1)", border: "1px solid rgba(227,183,166,.3)", padding: "9px 13px" }}>Details</div>
                    <div onClick={() => { o.items.forEach((it) => it.slug && addToCart({ slug: it.slug, name: it.name, image: it.image, price: it.unitPrice, size: it.size }, it.qty)); router.push("/cart"); }} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", background: "rgba(227,183,166,.12)", border: "1px solid rgba(227,183,166,.3)", padding: "9px 13px" }}>Reorder</div>
                    {o.status === "Pending" && <div onClick={() => cancelOrder(o)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.4)", color: "#E39B9B", padding: "9px 13px" }}>Cancel</div>}
                    {o.status === "Delivered" && o.items.filter((it) => it.productId).map((it) => (
                      <div key={it.productId} onClick={() => { setReviewTarget({ orderId: o.id, productId: it.productId, productName: it.name }); setReviewForm({ name: user.name, rating: 5, body: "" }); setReviewStatus(""); }} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid rgba(143,214,166,.35)", color: "#8FD6A6", padding: "9px 13px", whiteSpace: "nowrap" }}>Review</div>
                    ))}
                  </div>
                </div>
                {!rejected && (
                  <div data-r="steps4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, marginTop: 26 }}>
                    {STAGES.map((label, i) => (
                      <div key={label} style={{ borderTop: `2px solid ${i <= stage ? "var(--bronze)" : "rgba(227,183,166,.15)"}`, paddingTop: 12 }}>
                        <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: i <= stage ? "var(--rose-light)" : "rgba(247,241,237,.35)" }}>{label}</div>
                        <div style={{ fontSize: 11, color: "rgba(247,241,237,.35)", marginTop: 5 }}>{i === 0 ? o.date : i <= stage ? "Done" : "—"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── WISHLIST ── */}
      {tab === "Wishlist" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 20 }}>
          {wishProducts.length === 0 && <div style={{ gridColumn: "1/-1", border: "1px dashed rgba(227,183,166,.25)", padding: 40, textAlign: "center", color: "rgba(247,241,237,.5)", fontSize: 13.5 }}>Your wishlist is empty. <Link href="/shop" style={{ color: "var(--rose)" }}>Find something you love</Link></div>}
          {wishProducts.map((p) => (
            <div key={p.slug} className="card" style={{ background: "var(--panel)" }}>
              <Link href={`/product/${p.slug}`} style={{ display: "block", aspectRatio: "1/1", overflow: "hidden", position: "relative" }}>
                <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div onClick={(e) => { e.preventDefault(); toggleWish(p.slug); }} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(10,10,11,.75)", border: "1px solid rgba(227,183,166,.28)", color: "var(--rose)" }}>♥</div>
              </Link>
              <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 19 }}>{p.name}</span>
                <div onClick={() => addToCart({ slug: p.slug, name: p.name, image: p.image, price: p.price, size: "Medium set" }, 1)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.3)", padding: "8px 12px" }}>Add</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADDRESSES ── */}
      {tab === "Addresses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div style={{ fontSize: 13, color: "rgba(247,241,237,.5)" }}>{addresses.length} saved address{addresses.length !== 1 ? "es" : ""}</div>
            <div onClick={openNewAddr} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", background: "linear-gradient(100deg,#B87A62,#F2CDBB)", color: "#1A0F0A", padding: "10px 20px" }}>+ Add address</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
            {addresses.map((a) => (
              <div key={a.id} style={{ border: `1px solid ${a.isDefault ? "rgba(227,183,166,.5)" : "rgba(227,183,166,.16)"}`, padding: 26, background: "var(--panel)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--rose)" }}>{a.label}</div>
                  {a.isDefault && <div style={{ fontSize: 9.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--bronze)", border: "1px solid rgba(227,183,166,.3)", padding: "4px 8px" }}>Default</div>}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.9, color: "rgba(247,241,237,.62)" }}>
                  {a.line1}<br />{a.line2 && <>{a.line2}<br /></>}{a.city}<br />{a.phone}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <div onClick={() => openEditAddr(a)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.3)", padding: "8px 14px", color: "rgba(247,241,237,.7)" }}>Edit</div>
                  <div onClick={() => deleteAddr(a.id)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.3)", padding: "8px 14px", color: "#E39B9B" }}>Delete</div>
                </div>
              </div>
            ))}
            {addresses.length === 0 && <div style={{ border: "1px dashed rgba(227,183,166,.28)", display: "grid", placeItems: "center", minHeight: 150, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)" }}>No saved addresses</div>}
          </div>
          {addrForm && (
            <div onClick={() => setAddrForm(null)} style={modalWrap}>
              <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid rgba(227,183,166,.3)", maxWidth: 480, width: "100%", padding: 30 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 26, marginBottom: 22 }}>{addrForm.id ? "Edit address" : "New address"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Label</div><select value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} style={{ ...inp, background: "var(--bg)" }}>{["Home", "Office", "Other"].map((l) => <option key={l}>{l}</option>)}</select></div>
                  <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Address line 1 *</div><input value={addrForm.line1} onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))} placeholder="Street / house no." style={inp} /></div>
                  <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Address line 2</div><input value={addrForm.line2 || ""} onChange={(e) => setAddrForm((f) => ({ ...f, line2: e.target.value }))} placeholder="Area / landmark" style={inp} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>City *</div><input value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} style={inp} /></div>
                    <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Phone *</div><input value={addrForm.phone} onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))} style={inp} /></div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "rgba(247,241,237,.7)", cursor: "pointer" }}><input type="checkbox" checked={!!addrForm.isDefault} onChange={(e) => setAddrForm((f) => ({ ...f, isDefault: e.target.checked }))} /> Set as default</label>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                  <div onClick={saveAddr} style={{ cursor: "pointer", background: "linear-gradient(100deg,#B87A62,#F2CDBB)", color: "#1A0F0A", padding: "14px 28px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase" }}>{addrBusy ? "Saving…" : addrForm.id ? "Save changes" : "Add address"}</div>
                  <div onClick={() => setAddrForm(null)} style={{ cursor: "pointer", border: "1px solid rgba(227,183,166,.3)", padding: "14px 22px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.7)" }}>Cancel</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === "Settings" && (
        <div style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Profile */}
          <div style={{ border: "1px solid rgba(227,183,166,.16)", background: "var(--panel)", padding: 28 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 24, margin: "0 0 22px" }}>Edit profile</h3>
            {profileStatus === "done" && <div style={{ padding: "12px 16px", border: "1px solid rgba(143,214,166,.3)", color: "#8FD6A6", fontSize: 13, marginBottom: 16 }}>Profile updated.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Full name</div><input value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} style={inp} /></div>
              <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Phone</div><input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0300 1234567" style={inp} /></div>
              {profileError && <div style={{ fontSize: 12, color: "#E39B9B" }}>{profileError}</div>}
              <div onClick={saveProfile} style={{ cursor: "pointer", background: "linear-gradient(100deg,#B87A62,#F2CDBB)", color: "#1A0F0A", padding: "13px 26px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", alignSelf: "flex-start" }}>{profileStatus === "saving" ? "Saving…" : "Save profile"}</div>
            </div>
          </div>

          {/* Nail size profile */}
          <div style={{ border: "1px solid rgba(227,183,166,.16)", background: "var(--panel)", padding: 28 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 24, margin: "0 0 6px" }}>Nail size profile</h3>
            <div style={{ fontSize: 12.5, color: "rgba(247,241,237,.45)", marginBottom: 20, lineHeight: 1.6 }}>Save your sizes once — we'll auto-fill them at checkout. <Link href="/size-guide" style={{ color: "var(--rose)" }}>How to measure →</Link></div>
            {nailStatus === "done" && <div style={{ padding: "12px 16px", border: "1px solid rgba(143,214,166,.3)", color: "#8FD6A6", fontSize: 13, marginBottom: 16 }}>Nail sizes saved.</div>}
            {["Left hand", "Right hand"].map((hand, h) => (
              <div key={hand} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 10 }}>{hand}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                  {["T", "I", "M", "R", "P"].map((fl, f) => {
                    const idx = h * 5 + f;
                    return (
                      <div key={f} style={{ textAlign: "center" }}>
                        <input value={nailSizes[idx]} onChange={(e) => setNailSizes((arr) => { const n = [...arr]; n[idx] = e.target.value; return n; })} placeholder="–" style={{ ...inp, textAlign: "center", padding: "10px 4px" }} />
                        <div style={{ fontSize: 9, letterSpacing: ".1em", color: "rgba(247,241,237,.35)", marginTop: 5 }}>{fl}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {nailStatus === "error" && <div style={{ fontSize: 12, color: "#E39B9B", marginBottom: 10 }}>Could not save — try again.</div>}
            <div onClick={saveNailSizes} style={{ cursor: "pointer", background: "linear-gradient(100deg,#B87A62,#F2CDBB)", color: "#1A0F0A", padding: "13px 26px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", display: "inline-block", marginTop: 4 }}>{nailStatus === "saving" ? "Saving…" : "Save sizes"}</div>
          </div>

          {/* Password */}
          <div style={{ border: "1px solid rgba(227,183,166,.16)", background: "var(--panel)", padding: 28 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 24, margin: "0 0 22px" }}>Change password</h3>
            {pwStatus === "done" && <div style={{ padding: "12px 16px", border: "1px solid rgba(143,214,166,.3)", color: "#8FD6A6", fontSize: 13, marginBottom: 16 }}>Password changed.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Current password</div><input type="password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} style={inp} /></div>
              <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>New password</div><input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 8 characters" style={inp} /></div>
              <div><div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Confirm new password</div><input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} style={inp} /></div>
              {pwError && <div style={{ fontSize: 12, color: "#E39B9B" }}>{pwError}</div>}
              <div onClick={changePassword} style={{ cursor: "pointer", background: "linear-gradient(100deg,#B87A62,#F2CDBB)", color: "#1A0F0A", padding: "13px 26px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", alignSelf: "flex-start" }}>{pwStatus === "saving" ? "Saving…" : "Change password"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDER DETAIL MODAL ── */}
      {orderDetail && (
        <div onClick={() => setOrderDetail(null)} style={modalWrap}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid rgba(227,183,166,.3)", maxWidth: 580, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)" }}>Order details</div><div style={{ fontFamily: "var(--serif)", fontSize: 28, marginTop: 4 }}>{orderDetail.code}</div></div>
              <div onClick={() => setOrderDetail(null)} style={{ cursor: "pointer", fontSize: 22, color: "rgba(247,241,237,.5)" }}>×</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.3)", padding: "6px 11px", color: "var(--rose)" }}>{orderDetail.status}</span>
              <span style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.2)", padding: "6px 11px", color: "rgba(247,241,237,.55)" }}>{orderDetail.date}</span>
              <span style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.2)", padding: "6px 11px", color: "rgba(247,241,237,.55)" }}>{orderDetail.paymentMethod === "cod" ? "Cash on Delivery" : "JazzCash"}</span>
            </div>
            {orderDetail.trackingNumber && <div style={{ padding: "11px 16px", border: "1px solid rgba(200,167,100,.3)", background: "rgba(200,167,100,.06)", color: "#C9A27E", fontSize: 13, marginBottom: 18 }}>Tracking number: <strong>{orderDetail.trackingNumber}</strong></div>}
            <div style={{ border: "1px solid rgba(227,183,166,.14)", marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 14, padding: "12px 16px", borderBottom: "1px solid rgba(227,183,166,.14)", fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.4)" }}>
                <div></div><div>Item</div><div>Price</div>
              </div>
              {orderDetail.items.map((it, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 14, padding: "12px 16px", borderBottom: "1px solid rgba(227,183,166,.08)", alignItems: "center", fontSize: 13 }}>
                  <img src={it.image} alt="" style={{ width: 48, height: 56, objectFit: "cover" }} />
                  <div><div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{it.name}</div><div style={{ fontSize: 11, color: "rgba(247,241,237,.42)", marginTop: 3 }}>{it.size} · qty {it.qty}</div></div>
                  <div style={{ color: "var(--rose-light)" }}>{rs(it.unitPrice * it.qty)}</div>
                </div>
              ))}
              <div style={{ padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(247,241,237,.5)" }}><span>Shipping</span><span>{orderDetail.shipping === 0 ? "Free" : rs(orderDetail.shipping)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--serif)", fontSize: 18, color: "var(--rose-light)", paddingTop: 8, borderTop: "1px solid rgba(227,183,166,.14)", marginTop: 4 }}><span>Total</span><span>{rs(orderDetail.total)}</span></div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(247,241,237,.55)", lineHeight: 1.8, marginBottom: 22 }}>
              <strong style={{ color: "rgba(247,241,237,.7)" }}>Delivery address:</strong><br />{orderDetail.address}, {orderDetail.city}
              {orderDetail.nailSizes && <><br /><strong style={{ color: "rgba(247,241,237,.7)" }}>Nail sizes:</strong> {orderDetail.nailSizes}</>}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div onClick={() => printInvoice(orderDetail)} style={{ cursor: "pointer", border: "1px solid rgba(227,183,166,.3)", padding: "12px 22px", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.7)" }}>Print receipt</div>
              {orderDetail.status === "Pending" && <div onClick={() => { cancelOrder(orderDetail); setOrderDetail(null); }} style={{ cursor: "pointer", border: "1px solid rgba(200,90,90,.4)", color: "#E39B9B", padding: "12px 22px", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" }}>Cancel order</div>}
              <div onClick={() => setOrderDetail(null)} style={{ cursor: "pointer", background: "linear-gradient(100deg,#B87A62,#F2CDBB)", color: "#1A0F0A", padding: "12px 22px", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" }}>Close</div>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEW MODAL ── */}
      {reviewTarget && (
        <div onClick={() => { setReviewTarget(null); setReviewStatus(""); }} style={modalWrap}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid rgba(227,183,166,.3)", maxWidth: 480, width: "100%", padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 26 }}>Review {reviewTarget.productName}</div>
              <div onClick={() => { setReviewTarget(null); setReviewStatus(""); }} style={{ cursor: "pointer", fontSize: 22, color: "rgba(247,241,237,.5)" }}>×</div>
            </div>
            {reviewStatus === "done" ? (
              <div style={{ padding: "16px 20px", border: "1px solid rgba(143,214,166,.3)", color: "#8FD6A6", fontSize: 13.5 }}>Thank you! Your review has been submitted.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
                  <div><div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Your name</div><input value={reviewForm.name} onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))} style={inp} /></div>
                  <div><div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Rating</div><select value={reviewForm.rating} onChange={(e) => setReviewForm((f) => ({ ...f, rating: e.target.value }))} style={{ ...inp, background: "var(--bg)", width: "auto" }}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{stars(n)}</option>)}</select></div>
                </div>
                <div><div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginBottom: 8 }}>Your review</div><textarea value={reviewForm.body} onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))} rows={4} placeholder="How did the set look? How long did it last?" style={{ ...inp, resize: "vertical" }} /></div>
                {reviewStatus === "error" && <div style={{ fontSize: 12, color: "#E39B9B" }}>Could not submit — please try again.</div>}
                <div onClick={submitReview} style={{ cursor: "pointer", background: "linear-gradient(100deg,#B87A62,#F2CDBB)", color: "#1A0F0A", padding: "14px 28px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", alignSelf: "flex-start" }}>{reviewStatus === "submitting" ? "Submitting…" : "Submit review"}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
