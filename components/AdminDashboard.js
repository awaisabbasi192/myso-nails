"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rs } from "@/lib/format";

const TABS = ["Overview", "Orders", "Products", "Categories", "Customers", "Reviews", "Coupons", "Gift Cards", "Messages", "Media", "Analytics", "Bundle Deals", "Custom Orders", "Drops", "Settings", "Homepage"];
const ORDER_FILTERS = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Rejected"];
const ASSET_IMAGES = ["/assets/p1-french.jpeg", "/assets/p2-maroon.jpeg", "/assets/p3-leopard.jpeg", "/assets/p4-nude.jpeg", "/assets/g1.jpeg", "/assets/g2.jpeg", "/assets/g3.jpeg"];

export default function AdminDashboard({ adminEmail, kpis, orders, products, customers, coupons, categories, content, messages, subscribers, reviews, giftCards }) {
  const router = useRouter();
  const [tab, setTab] = useState("Overview");
  const [busy, setBusy] = useState(false);
  const [shot, setShot] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [orderFilter, setOrderFilter] = useState("All");
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [orderSearch, setOrderSearch] = useState("");
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkStocks, setBulkStocks] = useState({});
  const [trackingInputs, setTrackingInputs] = useState({});
  const [customerDetail, setCustomerDetail] = useState(null);
  const [orderPage, setOrderPage] = useState(1);
  const ORDERS_PER_PAGE = 15;
  const [waTpls, setWaTpls] = useState({
    Confirmed: content?.waConfirmed || "Assalam o Alaikum {name}! 🎉 Aapka order *{code}* confirm ho gaya hai. — Myso Nails Studio",
    Shipped:   content?.waShipped   || "Assalam o Alaikum {name}! 📦 Aapka order *{code}* ship ho gaya! — Myso Nails Studio",
    Delivered: content?.waDelivered || "Assalam o Alaikum {name}! ✅ Aapka order *{code}* deliver ho gaya. — Myso Nails Studio",
    Rejected:  content?.waRejected  || "Assalam o Alaikum {name}! Aapka order *{code}* ke baray mein kuch masla hai. — Myso Nails Studio",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function call(url, method, body) {
    setBusy(true);
    try {
      const res = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) alert(data.error || "Something went wrong");
      else router.refresh();
      return res.ok;
    } finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function toggleSelectOrder(id) {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== "All" && o.status !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.trim().toLowerCase();
      if (!o.code.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q) && !o.phone.includes(q)) return false;
    }
    return true;
  });
  const totalOrderPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE);
  const shownOrders = paginatedOrders;

  function toggleAllOrders() {
    if (selectedOrders.size === shownOrders.length) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(shownOrders.map((o) => o.id)));
  }

  async function deleteSelected() {
    if (!selectedOrders.size || busy) return;
    if (!confirm(`Delete ${selectedOrders.size} order(s)? This cannot be undone.`)) return;
    setBusy(true);
    try {
      for (const id of selectedOrders) await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      setSelectedOrders(new Set());
      router.refresh();
    } finally { setBusy(false); }
  }

  async function updateStatus(order, newStatus) {
    const ok = await call(`/api/admin/orders/${order.id}`, "PATCH", { status: newStatus });
    if (ok) {
      const url = waStatusMsg(order.phone, newStatus, order.code, order.customerName, waTpls);
      if (url) window.open(url, "_blank");
    }
  }

  return (
    <div data-r="admin" style={{ display: "grid", gridTemplateColumns: "214px 1fr", minHeight: "100vh", background: "var(--bg)" }}>
      {mobileMenuOpen && <div className="admin-drawer-overlay" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar${mobileMenuOpen ? " admin-sidebar-open" : ""}`} style={{ borderRight: "1px solid var(--card-b)", background: "var(--panel-2)", padding: "30px 0" }}>
        <div className="admin-drawer-close" onClick={() => setMobileMenuOpen(false)}>×</div>
        <div style={{ fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase", color: "var(--ink-muted)", padding: "0 24px 18px" }}>Studio admin</div>
        {TABS.map((t) => (
          <div key={t} className="admin-tab" onClick={() => { setTab(t); setMobileMenuOpen(false); }} style={{ cursor: "pointer", padding: "13px 24px", fontSize: 12.5, letterSpacing: ".1em", color: tab === t ? "var(--rose)" : "var(--ink-muted)", background: tab === t ? "rgba(155,27,42,.08)" : "transparent", borderLeft: `2px solid ${tab === t ? "var(--rose)" : "transparent"}` }}>{t}</div>
        ))}
        <div className="admin-side-foot" style={{ margin: "26px 24px 0", paddingTop: 20, borderTop: "1px solid var(--card-b)", fontSize: 11.5, lineHeight: 1.9, color: "var(--ink-muted)" }}>
          Signed in as<br /><span style={{ color: "var(--rose)" }}>{adminEmail}</span>
          <a href="/" style={{ display: "block", marginTop: 14, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "10px 12px", textAlign: "center" }}>↗ Visit site</a>
          <div onClick={logout} style={{ cursor: "pointer", marginTop: 10, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "9px 12px", textAlign: "center", color: "var(--ink-muted)" }}>Sign out</div>
        </div>
      </aside>

      {/* Content */}
      <div style={{ padding: "34px 34px 80px" }}>
        {/* Mobile top bar */}
        <div className="admin-mobile-topbar">
          <button className="admin-hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">☰</button>
          <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 300, color: "var(--ink)" }}>{tab}</div>
        </div>
        {tab === "Overview" && <Overview kpis={kpis} orders={orders} products={products} />}

        {tab === "Orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 14 }}>
              <h1 style={{ ...h1, marginBottom: 0 }}>Orders</h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                {selectedOrders.size > 0 && (
                  <div onClick={deleteSelected} style={{ cursor: "pointer", border: "1px solid rgba(200,90,90,.45)", color: "#E39B9B", padding: "10px 18px", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" }}>
                    {busy ? "Deleting…" : `Delete (${selectedOrders.size})`}
                  </div>
                )}
                <a href={`/api/admin/orders/export?status=${orderFilter}`} download style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "10px 16px", color: "var(--ink-muted)" }}>Export CSV</a>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, margin: "0 0 14px", flexWrap: "wrap", alignItems: "center" }}>
              <input value={orderSearch} onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }} placeholder="Search by code, name or phone…" style={{ ...adminInput, width: 250, padding: "9px 14px" }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ORDER_FILTERS.map((f) => (
                  <div key={f} onClick={() => { setOrderFilter(f); setSelectedOrders(new Set()); setOrderPage(1); }} className="pill" style={{ cursor: "pointer", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", padding: "9px 13px", border: `1px solid ${orderFilter === f ? "var(--rose)" : "var(--card-b)"}`, color: orderFilter === f ? "var(--rose)" : "var(--ink-muted)", whiteSpace: "nowrap" }}>{f}</div>
                ))}
              </div>
            </div>
            <div data-scroll-x="1" style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
              <div style={{ minWidth: 1060, display: "grid", gridTemplateColumns: "40px 110px 1.4fr 1fr 110px 160px auto", gap: 14, padding: "16px 22px", borderBottom: "1px solid var(--card-b)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-faint)", alignItems: "center" }}>
                <input type="checkbox" checked={shownOrders.length > 0 && selectedOrders.size === shownOrders.length} onChange={toggleAllOrders} style={{ cursor: "pointer", accentColor: "#9B1B2A", width: 14, height: 14 }} />
                <div>Order</div><div>Customer</div><div>Items</div><div>Total</div><div>Status</div><div>Action</div>
              </div>
              {shownOrders.map((o) => (
                <div key={o.id} style={{ minWidth: 1060, display: "grid", gridTemplateColumns: "40px 110px 1.4fr 1fr 110px 160px auto", gap: 14, padding: "18px 22px", borderBottom: "1px solid var(--card-b)", alignItems: "start", fontSize: 12.5, background: selectedOrders.has(o.id) ? "rgba(155,27,42,.06)" : "transparent" }}>
                  <input type="checkbox" checked={selectedOrders.has(o.id)} onChange={() => toggleSelectOrder(o.id)} style={{ cursor: "pointer", accentColor: "#9B1B2A", width: 14, height: 14, marginTop: 3 }} />
                  <div><div style={{ color: "var(--rose-light)" }}>{o.code}</div><div style={{ fontSize: 10.5, color: "var(--ink-faint)", marginTop: 3 }}>{o.date}</div></div>
                  <div><div>{o.customerName}</div><div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 3 }}>{o.city} · {o.phone}</div></div>
                  <div style={{ color: "var(--ink-muted)", fontSize: 11.5 }}>{o.items}</div>
                  <div>{rs(o.total)}{o.paymentMethod === "cod" ? <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 3 }}>COD</div> : null}</div>
                  <div>
                    <span style={statusBadge(o.status)}>{o.status}</span>
                    {o.status === "Shipped" && (
                      <div style={{ marginTop: 8 }}>
                        <input
                          value={trackingInputs[o.id] ?? (o.trackingNumber || "")}
                          onChange={(e) => setTrackingInputs((t) => ({ ...t, [o.id]: e.target.value }))}
                          onBlur={(e) => { if (e.target.value !== (o.trackingNumber || "")) call(`/api/admin/orders/${o.id}`, "PATCH", { trackingNumber: e.target.value }); }}
                          placeholder="Tracking no."
                          style={{ ...adminInput, padding: "5px 8px", fontSize: 11, width: "100%" }}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", paddingTop: 2 }}>
                    <div onClick={() => setShot(o)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "7px 9px", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>{o.paymentProof ? "Receipt" : "Details"}</div>
                    {(o.status === "Pending" || o.status === "Confirmed" || o.status === "Shipped") && (
                      <div onClick={() => updateStatus(o, nextStatus(o.status))} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "7px 10px", whiteSpace: "nowrap" }}>{advanceLabel(o.status)}</div>
                    )}
                    {(o.status === "Rejected" || o.status === "Cancelled") && (
                      <div onClick={() => updateStatus(o, "Pending")} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "7px 10px", whiteSpace: "nowrap" }}>Reopen</div>
                    )}
                    {(o.status === "Pending" || o.status === "Confirmed" || o.status === "Shipped") && (
                      <div onClick={() => updateStatus(o, "Rejected")} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.4)", color: "#E39B9B", padding: "7px 9px", whiteSpace: "nowrap" }}>Reject</div>
                    )}
                    <div onClick={() => confirm(`Delete order ${o.code}?`) && call(`/api/admin/orders/${o.id}`, "DELETE")} style={{ cursor: "pointer", fontSize: 13, color: "rgba(227,145,145,.5)", padding: "5px 9px", lineHeight: 1 }} title="Delete">✕</div>
                  </div>
                </div>
              ))}
              {shownOrders.length === 0 && <div style={{ padding: 30, color: "var(--ink-faint)", fontSize: 13 }}>No orders match.</div>}
            </div>
            {filteredOrders.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, fontSize: 12, color: "var(--ink-muted)" }}>
                <div>Showing {Math.min((orderPage - 1) * ORDERS_PER_PAGE + 1, filteredOrders.length)}–{Math.min(orderPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div onClick={() => setOrderPage((p) => Math.max(1, p - 1))} disabled={orderPage === 1} style={{ cursor: orderPage === 1 ? "not-allowed" : "pointer", border: "1px solid var(--card-b)", padding: "8px 12px", opacity: orderPage === 1 ? 0.5 : 1 }}>← Previous</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {Array.from({ length: totalOrderPages }, (_, i) => i + 1).filter(p => Math.abs(p - orderPage) <= 1 || p === 1 || p === totalOrderPages).map((p, i, arr) => (
                      <span key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && "…"}
                        <div onClick={() => setOrderPage(p)} style={{ cursor: "pointer", padding: "5px 8px", border: `1px solid ${orderPage === p ? "var(--rose)" : "var(--card-b)"}`, color: orderPage === p ? "var(--rose)" : "inherit", minWidth: 28, textAlign: "center" }}>{p}</div>
                      </span>
                    ))}
                  </div>
                  <div onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))} disabled={orderPage === totalOrderPages} style={{ cursor: orderPage === totalOrderPages ? "not-allowed" : "pointer", border: "1px solid var(--card-b)", padding: "8px 12px", opacity: orderPage === totalOrderPages ? 0.5 : 1 }}>Next →</div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "Products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
              <h1 style={{ ...h1, marginBottom: 0 }}>Products</h1>
              <div style={{ display: "flex", gap: 10 }}>
                <div onClick={() => { setBulkEdit((b) => !b); setBulkStocks(Object.fromEntries(products.map((p) => [p.id, p.stock]))); }} style={{ cursor: "pointer", border: "1px solid var(--card-b)", color: bulkEdit ? "var(--rose-light)" : "var(--ink-muted)", padding: "12px 20px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase" }}>{bulkEdit ? "Cancel bulk edit" : "Bulk edit stock"}</div>
                {bulkEdit && <div onClick={async () => { setBusy(true); try { for (const [id, stock] of Object.entries(bulkStocks)) { await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stock: Number(stock) }) }); } router.refresh(); setBulkEdit(false); } finally { setBusy(false); } }} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "12px 20px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase" }}>{busy ? "Saving…" : "Save all stock"}</div>}
                <div onClick={() => setEditProduct({})} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "12px 20px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase" }}>+ New product</div>
              </div>
            </div>
            {bulkEdit ? (
              <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 120px 110px", gap: 14, padding: "14px 22px", borderBottom: "1px solid var(--card-b)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                  <div></div><div>Product</div><div>Current stock</div><div>New stock</div>
                </div>
                {products.map((p) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "56px 1fr 120px 110px", gap: 14, padding: "12px 22px", borderBottom: "1px solid var(--card-b)", alignItems: "center", fontSize: 12.5 }}>
                    <img src={p.image} alt="" style={{ width: 40, height: 48, objectFit: "cover" }} />
                    <div><div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{rs(p.price)}</div></div>
                    <div style={{ color: p.stock <= 3 ? "#E39B9B" : "var(--ink-muted)" }}>{p.stock} units</div>
                    <input type="number" min="0" value={bulkStocks[p.id] ?? p.stock} onChange={(e) => setBulkStocks((s) => ({ ...s, [p.id]: e.target.value }))} style={{ ...adminInput, padding: "8px 10px", fontSize: 13, width: 90 }} />
                  </div>
                ))}
              </div>
            ) : (
              <div data-scroll-x="1" style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
                <div style={{ minWidth: 860, display: "grid", gridTemplateColumns: "70px 1.6fr 1fr 100px 90px 110px 140px", gap: 14, padding: "16px 22px", borderBottom: "1px solid var(--card-b)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                  <div></div><div>Product</div><div>Category</div><div>Price</div><div>Stock</div><div>Featured</div><div></div>
                </div>
                {products.map((p) => (
                  <div key={p.id} style={{ minWidth: 860, display: "grid", gridTemplateColumns: "70px 1.6fr 1fr 100px 90px 110px 140px", gap: 14, padding: "14px 22px", borderBottom: "1px solid var(--card-b)", alignItems: "center", fontSize: 12.5 }}>
                    <img src={p.image} alt={p.name} style={{ width: 48, height: 56, objectFit: "cover" }} />
                    <div><div style={{ fontFamily: "var(--serif)", fontSize: 19 }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 3 }}>{p.colorway}</div></div>
                    <div style={{ color: "var(--ink-muted)" }}>{p.categoryName}</div>
                    <div style={{ color: "var(--rose-light)" }}>{rs(p.price)}{p.wasPrice ? <span style={{ fontSize: 10, color: "var(--ink-faint)", textDecoration: "line-through", marginLeft: 6 }}>{rs(p.wasPrice)}</span> : null}</div>
                    <div style={{ color: p.stock <= 3 ? "#E39B9B" : "inherit" }}>{p.stock}{p.stock <= 3 ? " ⚠" : ""}</div>
                    <div style={{ color: "var(--rose)" }}>{p.featured ? "Featured" : "—"}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div onClick={() => setEditProduct(p)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "8px 11px", color: "var(--ink-muted)" }}>Edit</div>
                      <div onClick={() => confirm(`Delete "${p.name}"?`) && call(`/api/admin/products/${p.id}`, "DELETE")} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.35)", color: "#E39B9B", padding: "8px 11px" }}>Delete</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "Customers" && (
          <div>
            <h1 style={h1}>Customers <span style={{ fontSize: 14, color: "var(--ink-faint)", fontFamily: "var(--sans)" }}>— click a row for full order history</span></h1>
            <div data-scroll-x="1" style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
              <div style={{ minWidth: 720, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 100px 130px 130px", gap: 14, padding: "16px 22px", borderBottom: "1px solid var(--card-b)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                <div>Name</div><div>Email</div><div>Phone</div><div>Orders</div><div>Spent</div><div>City</div>
              </div>
              {customers.map((c) => (
                <div key={c.id} onClick={() => setCustomerDetail(c)} style={{ minWidth: 720, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 100px 130px 130px", gap: 14, padding: "16px 22px", borderBottom: "1px solid var(--card-b)", alignItems: "center", fontSize: 12.5, cursor: "pointer" }} className="admin-tab">
                  <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{c.name}</div>
                  <div style={{ color: "var(--ink-muted)", fontSize: 11.5 }}>{c.email}</div>
                  <div style={{ color: "var(--ink-muted)" }}>{c.phone}</div>
                  <div>{c.orders}</div>
                  <div style={{ color: "var(--rose-light)" }}>{rs(c.spent)}</div>
                  <div style={{ color: "var(--ink-muted)" }}>{c.city}</div>
                </div>
              ))}
              {customers.length === 0 && <div style={{ padding: 30, color: "var(--ink-faint)", fontSize: 13 }}>No customers yet.</div>}
            </div>
            {customerDetail && (
              <div onClick={() => setCustomerDetail(null)} style={modalWrap}>
                <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid var(--card-b)", maxWidth: 640, width: "100%", maxHeight: "88vh", overflowY: "auto", padding: 30 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 28 }}>{customerDetail.name}</div>
                    <div onClick={() => setCustomerDetail(null)} style={{ cursor: "pointer", fontSize: 22, color: "var(--ink-muted)" }}>×</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 6 }}>{customerDetail.email} · {customerDetail.phone} · {customerDetail.city}</div>
                  <div style={{ fontSize: 12, color: "var(--rose-light)", marginBottom: 22 }}>{customerDetail.orders} orders · {rs(customerDetail.spent)} lifetime spend</div>
                  <div style={{ border: "1px solid var(--card-b)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 130px", gap: 12, padding: "10px 18px", borderBottom: "1px solid var(--card-b)", fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                      <div>Order</div><div>Status</div><div>Total</div>
                    </div>
                    {(customerDetail.orderList || []).map((o) => (
                      <div key={o.code} style={{ display: "grid", gridTemplateColumns: "1fr 100px 130px", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--card-b)", alignItems: "center", fontSize: 12.5 }}>
                        <div><span style={{ color: "var(--rose-light)" }}>{o.code}</span><span style={{ color: "var(--ink-faint)", fontSize: 11, marginLeft: 10 }}>{o.date}</span></div>
                        <div><span style={statusBadge(o.status)}>{o.status}</span></div>
                        <div>{rs(o.total)}</div>
                      </div>
                    ))}
                    {(customerDetail.orderList || []).length === 0 && <div style={{ padding: 18, color: "var(--ink-faint)", fontSize: 13 }}>No orders.</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "Categories" && <Categories categories={categories} call={call} busy={busy} router={router} />}

        {tab === "Reviews" && <ReviewsTab reviews={reviews || []} call={call} router={router} />}
        {tab === "Analytics" && <AnalyticsTab />}
        {tab === "Bundle Deals" && <BundleDealsTab />}
        {tab === "Custom Orders" && <CustomOrdersTab />}
        {tab === "Drops" && <DropsTab />}

        {tab === "Messages" && <MessagesTab messages={messages} subscribers={subscribers} call={call} />}

        {tab === "Coupons" && <Coupons coupons={coupons} call={call} busy={busy} />}

        {tab === "Gift Cards" && <GiftCardsTab giftCards={giftCards} />}

        {tab === "Media" && <MediaTab />}

        {tab === "Settings" && <SettingsTab content={content} call={call} busy={busy} />}

        {tab === "Homepage" && <Homepage content={content} call={call} busy={busy} waTpls={waTpls} setWaTpls={setWaTpls} />}
      </div>

      {/* Payment proof modal */}
      {shot && (
        <div onClick={() => setShot(null)} style={modalWrap}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid var(--card-b)", maxWidth: 500, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)" }}>{shot.paymentMethod === "cod" ? "COD order" : "Payment screenshot"} · {shot.code}</div>
              <div onClick={() => setShot(null)} style={{ cursor: "pointer", fontSize: 20, color: "var(--ink-muted)" }}>×</div>
            </div>
            {shot.paymentProof ? (
              <img src={shot.paymentProof} alt="Payment proof" style={{ width: "100%", objectFit: "contain", background: "#000", display: "block" }} />
            ) : (
              <div style={{ padding: 30, textAlign: "center", color: "var(--ink-muted)", border: "1px dashed rgba(227,183,166,.25)", fontSize: 13 }}>{shot.paymentMethod === "cod" ? "Cash on delivery — no screenshot." : "No screenshot uploaded."}</div>
            )}
            <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--ink-muted)" }}>{shot.customerName} · {shot.phone} · {shot.city}<br />{shot.items} · <span style={{ color: "var(--rose-light)" }}>{rs(shot.total)}</span></div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <div onClick={() => { updateStatus(shot, "Confirmed"); setShot(null); }} style={{ cursor: "pointer", flex: 1, textAlign: "center", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: 14, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" }}>Confirm payment</div>
              <div onClick={() => { updateStatus(shot, "Rejected"); setShot(null); }} style={{ cursor: "pointer", border: "1px solid rgba(200,90,90,.4)", color: "#E39B9B", padding: "14px 18px", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase" }}>Reject</div>
            </div>
          </div>
        </div>
      )}

      {/* Product editor modal */}
      {editProduct && (
        <ProductEditor product={editProduct} categories={categories} onClose={() => setEditProduct(null)} onSaved={() => { setEditProduct(null); router.refresh(); }} />
      )}
    </div>
  );
}

/* ---------- Overview ---------- */
function Overview({ kpis, orders, products }) {
  const kpiCards = [
    { label: "Revenue this month", value: rs(kpis.revenue), delta: "Confirmed + delivered", color: "#8FD6A6" },
    { label: "Total orders", value: String(kpis.orders), delta: "All time", color: "#8FD6A6" },
    { label: "Customers", value: String(kpis.customers), delta: "Registered", color: "#8FD6A6" },
    { label: "Newsletter subscribers", value: String(kpis.subscribers || 0), delta: "Email list", color: "#8FD6A6" },
    { label: "Pending verification", value: String(kpis.pending), delta: kpis.pending ? "Review now →" : "All clear", color: kpis.pending ? "var(--rose)" : "#8FD6A6" },
    { label: "Low stock", value: `${kpis.lowStock} sets`, delta: kpis.lowStockName ? `${kpis.lowStockName} needs restock` : "Stock healthy", color: kpis.lowStock ? "#E39B9B" : "#8FD6A6" },
  ];

  const chart = kpis.revenueChart || [];
  const maxVal = Math.max(...chart.map((d) => d.total), 1);
  const alerts = [];
  if (kpis.pending) alerts.push({ title: `${kpis.pending} order${kpis.pending > 1 ? "s" : ""} pending payment verification`, meta: "Open Orders tab → check receipts", dot: "var(--rose)" });
  if (kpis.messages > 0) alerts.push({ title: `${kpis.messages} contact message${kpis.messages > 1 ? "s" : ""} received`, meta: "Open Messages tab → reply on WhatsApp", dot: "#d4a89a" });
  products.filter((p) => p.stock <= 3).forEach((p) => alerts.push({ title: `${p.name} — only ${p.stock} left`, meta: "Restock or hide from shop", dot: "#E39B9B" }));
  if (alerts.length === 0) alerts.push({ title: "Everything looks good", meta: "No urgent actions needed", dot: "#8FD6A6" });

  return (
    <div>
      <h1 style={{ ...h1, marginBottom: 6 }}>Overview</h1>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 26 }}>Live from your store</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
        {kpiCards.map((k) => (
          <div key={k.label} style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 20 }}>
            <div style={{ fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{k.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--ink)", margin: "10px 0 6px" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.color }}>{k.delta}</div>
          </div>
        ))}
      </div>
      <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, alignItems: "start" }}>
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)" }}>Revenue — last 14 days</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{rs(chart.reduce((s, d) => s + d.total, 0))} total</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 180, position: "relative" }}>
            {chart.map((d, i) => {
              const pct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
              const isMax = d.total === maxVal && d.total > 0;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }} title={`${d.date}: ${rs(d.total)}`}>
                  <div style={{ width: "100%", height: `${Math.max(pct, 2)}%`, background: isMax ? "linear-gradient(180deg,#C4233D,#9B1B2A)" : "linear-gradient(180deg,#9B1B2A,#620F1A)", borderRadius: "1px 1px 0 0", minHeight: 3 }} />
                  {i % 4 === 0 && <div style={{ fontSize: 8.5, color: "var(--ink-faint)", whiteSpace: "nowrap", transform: "rotate(-30deg)", transformOrigin: "top" }}>{d.date.slice(5)}</div>}
                </div>
              );
            })}
          </div>
          {maxVal === 1 && <div style={{ textAlign: "center", fontSize: 12, color: "var(--ink-faint)", marginTop: 10 }}>No revenue data yet — orders will appear here</div>}
        </div>
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 26 }}>
          <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 20 }}>Needs attention</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", borderBottom: "1px solid var(--card-b)", paddingBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: a.dot, marginTop: 5, flexShrink: 0 }} />
                <div><div style={{ fontSize: 13, color: "var(--ink)" }}>{a.title}</div><div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 4 }}>{a.meta}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Coupons ---------- */
function Coupons({ coupons, call, busy }) {
  const [form, setForm] = useState({ code: "", type: "percentage", value: "", expiresAt: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  async function create() {
    if (!form.code.trim() || busy) return;
    const detail = `${form.type === "percentage" ? form.value + "% off" : "Rs " + form.value + " off"}${form.expiresAt ? " · expires " + form.expiresAt : ""}`;
    const ok = await call("/api/admin/coupons", "POST", { ...form, detail });
    if (ok) setForm({ code: "", type: "percentage", value: "", expiresAt: "" });
  }
  return (
    <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start" }}>
      <div>
        <h1 style={h1}>Coupons</h1>
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
          {coupons.map((c) => (
            <div key={c.id} className="admin-flex-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "20px 22px", borderBottom: "1px solid var(--card-b)" }}>
              <div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, letterSpacing: ".12em", color: "var(--rose-light)" }}>{c.code}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 5 }}>{c.detail || (c.type === "percentage" ? `${c.value}% off` : `Rs ${c.value} off`)} · used {c.usedCount}×</div>
              </div>
              <div className="admin-flex-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.28)", padding: "6px 10px", color: c.active ? "#8FD6A6" : "var(--ink-faint)" }}>{c.active ? "Active" : "Off"}</span>
                <div onClick={() => call(`/api/admin/coupons/${c.id}`, "PATCH", { active: !c.active })} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.28)", padding: "8px 11px", color: "var(--ink-muted)" }}>{c.active ? "Disable" : "Enable"}</div>
                <div onClick={() => confirm(`Delete ${c.code}?`) && call(`/api/admin/coupons/${c.id}`, "DELETE")} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.35)", color: "#E39B9B", padding: "8px 11px" }}>Delete</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 26 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 20 }}>New coupon</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input value={form.code} onChange={set("code")} placeholder="CODE" style={{ ...adminInput, letterSpacing: ".16em" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select value={form.type} onChange={set("type")} style={{ ...adminInput, background: "var(--bg)" }}><option value="percentage">Percentage</option><option value="flat">Flat amount</option></select>
            <input value={form.value} onChange={set("value")} placeholder={form.type === "percentage" ? "15" : "500"} style={adminInput} />
          </div>
          <input type="date" value={form.expiresAt} onChange={set("expiresAt")} style={adminInput} />
          <div onClick={create} style={{ cursor: "pointer", textAlign: "center", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: 14, fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase" }}>{busy ? "…" : "Create coupon"}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Categories ---------- */
function Categories({ categories, call, busy, router }) {
  const [editCat, setEditCat] = useState(null);
  const [newForm, setNewForm] = useState({ name: "", image: ASSET_IMAGES[0] });
  const [uploading, setUploading] = useState(false);
  const setN = (k) => (e) => setNewForm((f) => ({ ...f, [k]: e.target.value }));

  async function uploadImg(e, setter) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setter(data.path);
    } finally { setUploading(false); }
  }

  async function createCat() {
    if (!newForm.name.trim() || busy) return;
    const ok = await call("/api/admin/categories", "POST", newForm);
    if (ok) setNewForm({ name: "", image: ASSET_IMAGES[0] });
  }

  return (
    <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22, alignItems: "start" }}>
      <div>
        <h1 style={h1}>Categories</h1>
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
          {categories.map((c) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 14, padding: "16px 22px", borderBottom: "1px solid var(--card-b)", alignItems: "center" }}>
              <img src={c.image} alt={c.name} style={{ width: 50, height: 60, objectFit: "cover" }} />
              <div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 19 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 3 }}>/{c.slug}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span onClick={() => call(`/api/admin/categories/${c.id}`, "PATCH", { showOnHome: !c.showOnHome })} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.28)", padding: "7px 10px", color: c.showOnHome ? "#8FD6A6" : "var(--ink-faint)" }}>{c.showOnHome ? "Shown" : "Hidden"}</span>
                <div onClick={() => setEditCat({ ...c })} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "7px 10px", color: "var(--ink-muted)" }}>Edit</div>
                <div onClick={() => confirm(`Delete "${c.name}"? Products will be uncategorised.`) && call(`/api/admin/categories/${c.id}`, "DELETE")} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.35)", color: "#E39B9B", padding: "7px 10px" }}>Delete</div>
              </div>
            </div>
          ))}
          {categories.length === 0 && <div style={{ padding: 30, color: "var(--ink-faint)", fontSize: 13 }}>No categories yet.</div>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 26 }}>
          <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 18 }}>New category</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={newForm.name} onChange={setN("name")} placeholder="Category name" style={adminInput} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ASSET_IMAGES.map((img) => <img key={img} src={img} onClick={() => setNewForm((f) => ({ ...f, image: img }))} alt="" style={{ width: 40, height: 48, objectFit: "cover", cursor: "pointer", border: `1px solid ${newForm.image === img ? "var(--rose)" : "transparent"}` }} />)}
            </div>
            <label style={{ cursor: "pointer", border: "1px dashed rgba(227,183,166,.4)", padding: "11px 14px", textAlign: "center", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
              {uploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/*" onChange={(e) => uploadImg(e, (p) => setNewForm((f) => ({ ...f, image: p })))} style={{ display: "none" }} />
            </label>
            <div onClick={createCat} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: 13, fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", textAlign: "center" }}>{busy ? "…" : "Create category"}</div>
          </div>
        </div>

        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 18, fontSize: 12, color: "rgba(247,241,237,.45)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--rose)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}>Tip</strong><br />
          "Shown" = category appears on homepage. "Hidden" = only visible in the Shop page.
        </div>
      </div>

      {editCat && (
        <CategoryEditor cat={editCat} onClose={() => setEditCat(null)} onSaved={() => { setEditCat(null); router.refresh(); }} uploading={uploading} setUploading={setUploading} />
      )}
    </div>
  );
}

function CategoryEditor({ cat, onClose, onSaved, uploading, setUploading }) {
  const [form, setForm] = useState({ name: cat.name, slug: cat.slug, image: cat.image, sortOrder: cat.sortOrder });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function upload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setForm((f) => ({ ...f, image: data.path }));
    } finally { setUploading(false); }
  }

  async function save() {
    if (busy) return; setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { alert("Could not save"); return; }
      onSaved();
    } finally { setBusy(false); }
  }

  return (
    <div onClick={onClose} style={modalWrap}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid var(--card-b)", maxWidth: 480, width: "100%", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 24 }}>Edit category</div>
          <div onClick={onClose} style={{ cursor: "pointer", fontSize: 22, color: "var(--ink-muted)" }}>×</div>
        </div>
        <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
          <img src={form.image} alt="" style={{ width: 72, height: 88, objectFit: "cover", border: "1px solid var(--card-b)" }} />
          <div style={{ flex: 1 }}>
            <label style={{ cursor: "pointer", display: "block", border: "1px dashed rgba(227,183,166,.4)", padding: 12, textAlign: "center", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
              {uploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
            </label>
            <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
              {ASSET_IMAGES.map((img) => <img key={img} src={img} onClick={() => setForm((f) => ({ ...f, image: img }))} alt="" style={{ width: 32, height: 38, objectFit: "cover", cursor: "pointer", border: `1px solid ${form.image === img ? "var(--rose)" : "transparent"}` }} />)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Labeled label="Name"><input value={form.name} onChange={set("name")} style={adminInput} /></Labeled>
          <Labeled label="Slug"><input value={form.slug} onChange={set("slug")} style={adminInput} /></Labeled>
          <Labeled label="Sort order"><input type="number" value={form.sortOrder} onChange={set("sortOrder")} style={adminInput} /></Labeled>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <div onClick={save} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "13px 28px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase" }}>{busy ? "Saving…" : "Save changes"}</div>
          <div onClick={onClose} style={{ cursor: "pointer", border: "1px solid var(--card-b)", padding: "13px 22px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-muted)" }}>Cancel</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Homepage ---------- */
function Homepage({ content, call, busy, waTpls, setWaTpls }) {
  const [form, setForm] = useState({
    heroHeadline: content?.heroHeadline || "", heroScript: content?.heroScript || "",
    heroImage: content?.heroImage || "/assets/p1-french.jpeg", announcement: content?.announcement || "",
    studioImage: content?.studioImage || "/assets/p4-nude.jpeg",
    studioHeadline: content?.studioHeadline || "", studioBody1: content?.studioBody1 || "",
    studioBody2: content?.studioBody2 || "", studioFounder: content?.studioFounder || "",
    studioRole: content?.studioRole || "",
    aboutImage1: content?.aboutImage1 || "/assets/p1-french.jpeg",
    aboutHeadline: content?.aboutHeadline || "", aboutBody1: content?.aboutBody1 || "",
    aboutBody2: content?.aboutBody2 || "", aboutArtistImg: content?.aboutArtistImg || "/assets/p4-nude.jpeg",
    aboutArtistName: content?.aboutArtistName || "", aboutArtistBio: content?.aboutArtistBio || "",
    aboutArtistSign: content?.aboutArtistSign || "",
    instagramHandle: content?.instagramHandle || "_myso.nails",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const [igPostsText, setIgPostsText] = useState(() => {
    try { return JSON.parse(content?.instagramPosts || "[]").join("\n"); } catch { return ""; }
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadStudio(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setForm((f) => ({ ...f, studioImage: data.path }));
    } finally { setUploading(false); }
  }

  async function save() {
    const igArr = igPostsText.split("\n").map((s) => s.trim()).filter((s) => s.includes("instagram.com/"));
    const payload = {
      ...form,
      waConfirmed: waTpls.Confirmed,
      waShipped: waTpls.Shipped,
      waDelivered: waTpls.Delivered,
      waRejected: waTpls.Rejected,
      instagramPosts: JSON.stringify(igArr),
    };
    const ok = await call("/api/admin/content", "PUT", payload);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ ...h1, marginBottom: 8 }}>Homepage content</h1>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 28 }}>Edit the live storefront without touching code.</div>

      {/* Hero */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 18 }}>Hero section</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Labeled label="Headline"><input value={form.heroHeadline} onChange={set("heroHeadline")} style={adminInput} /></Labeled>
          <Labeled label="Script line"><input value={form.heroScript} onChange={set("heroScript")} style={adminInput} /></Labeled>
          <Labeled label="Hero image">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {ASSET_IMAGES.slice(0, 4).map((img) => (
                <img key={img} src={img} onClick={() => setForm((f) => ({ ...f, heroImage: img }))} alt="" style={{ width: 68, height: 82, objectFit: "cover", border: `1px solid ${form.heroImage === img ? "var(--rose)" : "rgba(227,183,166,.3)"}`, cursor: "pointer" }} />
              ))}
            </div>
          </Labeled>
          <Labeled label="Announcement bar"><input value={form.announcement} onChange={set("announcement")} style={adminInput} /></Labeled>
        </div>
      </div>

      {/* Studio */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 18 }}>Studio section</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20, alignItems: "start" }}>
          <div>
            <img src={form.studioImage} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", border: "1px solid var(--card-b)", display: "block", marginBottom: 10 }} />
            <label style={{ cursor: "pointer", display: "block", border: "1px dashed rgba(227,183,166,.4)", padding: "10px 14px", textAlign: "center", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
              {uploading ? "Uploading…" : "Upload new photo"}
              <input type="file" accept="image/*" onChange={uploadStudio} style={{ display: "none" }} />
            </label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {ASSET_IMAGES.map((img) => <img key={img} src={img} onClick={() => setForm((f) => ({ ...f, studioImage: img }))} alt="" style={{ width: 36, height: 42, objectFit: "cover", cursor: "pointer", border: `1px solid ${form.studioImage === img ? "var(--rose)" : "transparent"}` }} />)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Labeled label="Headline"><input value={form.studioHeadline} onChange={set("studioHeadline")} style={adminInput} /></Labeled>
            <Labeled label="Paragraph 1"><textarea rows={3} value={form.studioBody1} onChange={set("studioBody1")} style={{ ...adminInput, resize: "vertical" }} /></Labeled>
            <Labeled label="Paragraph 2"><textarea rows={2} value={form.studioBody2} onChange={set("studioBody2")} style={{ ...adminInput, resize: "vertical" }} /></Labeled>
            <Labeled label="Founder name"><input value={form.studioFounder} onChange={set("studioFounder")} style={adminInput} /></Labeled>
            <Labeled label="Founder title"><input value={form.studioRole} onChange={set("studioRole")} style={adminInput} /></Labeled>
          </div>
        </div>
      </div>

      {/* About page */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 18 }}>About page — Our Story</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20, alignItems: "start" }}>
          <div>
            <img src={form.aboutImage1} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", border: "1px solid var(--card-b)", display: "block", marginBottom: 10 }} />
            <label style={{ cursor: "pointer", display: "block", border: "1px dashed rgba(227,183,166,.4)", padding: "10px 14px", textAlign: "center", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
              {uploading ? "Uploading…" : "Upload new photo"}
              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); const fd = new FormData(); fd.append("file", file); fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json()).then((d) => { if (d.path) setForm((f) => ({ ...f, aboutImage1: d.path })); }).finally(() => setUploading(false)); }} style={{ display: "none" }} />
            </label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {ASSET_IMAGES.map((img) => <img key={img} src={img} onClick={() => setForm((f) => ({ ...f, aboutImage1: img }))} alt="" style={{ width: 36, height: 42, objectFit: "cover", cursor: "pointer", border: `1px solid ${form.aboutImage1 === img ? "var(--rose)" : "transparent"}` }} />)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Labeled label="Headline"><input value={form.aboutHeadline} onChange={set("aboutHeadline")} style={adminInput} /></Labeled>
            <Labeled label="Paragraph 1"><textarea rows={3} value={form.aboutBody1} onChange={set("aboutBody1")} style={{ ...adminInput, resize: "vertical" }} /></Labeled>
            <Labeled label="Paragraph 2"><textarea rows={2} value={form.aboutBody2} onChange={set("aboutBody2")} style={{ ...adminInput, resize: "vertical" }} /></Labeled>
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 18 }}>About page — Meet the Artist</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20, alignItems: "start" }}>
          <div>
            <img src={form.aboutArtistImg} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", border: "1px solid var(--card-b)", display: "block", marginBottom: 10 }} />
            <label style={{ cursor: "pointer", display: "block", border: "1px dashed rgba(227,183,166,.4)", padding: "10px 14px", textAlign: "center", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
              {uploading ? "Uploading…" : "Upload new photo"}
              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); const fd = new FormData(); fd.append("file", file); fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json()).then((d) => { if (d.path) setForm((f) => ({ ...f, aboutArtistImg: d.path })); }).finally(() => setUploading(false)); }} style={{ display: "none" }} />
            </label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {ASSET_IMAGES.map((img) => <img key={img} src={img} onClick={() => setForm((f) => ({ ...f, aboutArtistImg: img }))} alt="" style={{ width: 36, height: 42, objectFit: "cover", cursor: "pointer", border: `1px solid ${form.aboutArtistImg === img ? "var(--rose)" : "transparent"}` }} />)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Labeled label="Name / title"><input value={form.aboutArtistName} onChange={set("aboutArtistName")} style={adminInput} /></Labeled>
            <Labeled label="Bio paragraph"><textarea rows={4} value={form.aboutArtistBio} onChange={set("aboutArtistBio")} style={{ ...adminInput, resize: "vertical" }} /></Labeled>
            <Labeled label="Script signature"><input value={form.aboutArtistSign} onChange={set("aboutArtistSign")} style={adminInput} /></Labeled>
          </div>
        </div>
      </div>

      {/* Instagram feed */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 6 }}>Instagram feed</div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 20, lineHeight: 1.7 }}>
          Paste the links of the Instagram posts you want to show on the homepage — <strong style={{ color: "var(--rose-light)" }}>one link per line</strong>. These display as real Instagram posts (not website product photos). Leave empty to show a "Follow us" card.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Labeled label="Instagram handle (without @)"><input value={form.instagramHandle} onChange={set("instagramHandle")} placeholder="_myso.nails" style={adminInput} /></Labeled>
          <Labeled label="Post links (one per line)">
            <textarea rows={5} value={igPostsText} onChange={(e) => setIgPostsText(e.target.value)} placeholder={"https://www.instagram.com/p/ABC123/\nhttps://www.instagram.com/reel/XYZ789/"} style={{ ...adminInput, resize: "vertical", fontSize: 12.5, lineHeight: 1.7 }} />
          </Labeled>
          <div style={{ fontSize: 11.5, color: "var(--ink-faint)", lineHeight: 1.7 }}>
            Tip: open a post on Instagram → tap the ⋯ menu → <strong style={{ color: "var(--rose-light)" }}>Copy link</strong> → paste here. Supports posts and reels.
          </div>
        </div>
      </div>

      {/* WhatsApp message templates */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 6 }}>WhatsApp order messages</div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 20 }}>Use <strong style={{ color: "var(--rose-light)" }}>{"{name}"}</strong> for customer name and <strong style={{ color: "var(--rose-light)" }}>{"{code}"}</strong> for order number.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "Confirmed", label: "Order Confirmed 🎉" },
            { key: "Shipped",   label: "Order Shipped 📦" },
            { key: "Delivered", label: "Order Delivered ✅" },
            { key: "Rejected",  label: "Order Rejected" },
          ].map(({ key, label }) => (
            <Labeled key={key} label={label}>
              <textarea
                rows={3}
                value={waTpls[key]}
                onChange={(e) => setWaTpls((t) => ({ ...t, [key]: e.target.value }))}
                style={{ ...adminInput, resize: "vertical", fontSize: 12.5, lineHeight: 1.6 }}
              />
            </Labeled>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div onClick={save} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "14px 32px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase" }}>{busy ? "…" : saved ? "Published ✓" : "Publish changes"}</div>
        <a href="/" style={{ border: "1px solid var(--card-b)", padding: "14px 24px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-muted)" }}>Preview storefront</a>
      </div>
    </div>
  );
}

/* ---------- Product editor ---------- */
function ProductEditor({ product, categories, onClose, onSaved }) {
  const isNew = !product.id;
  const parsedImages = (() => { try { return JSON.parse(product.images || "[]"); } catch { return []; } })();
  const [form, setForm] = useState({
    name: product.name || "", price: product.price || "", wasPrice: product.wasPrice || "",
    stock: product.stock ?? 10, shape: product.shape || "Almond", finish: product.finish || "Glossy",
    occasion: product.occasion || "Party", length: product.length || "Medium", badge: product.badge || "",
    colorway: product.colorway || "", blurb: product.blurb || "", image: product.image || "/assets/p1-french.jpeg",
    categoryId: product.categoryId || "", featured: !!product.featured, salePercent: "",
  });
  const [extraImages, setExtraImages] = useState(parsedImages);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setForm((f) => ({ ...f, image: data.path }));
    } finally { setUploading(false); }
  }

  async function uploadExtra(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingExtra(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setExtraImages((imgs) => [...imgs, data.path]);
    } finally { setUploadingExtra(false); }
  }

  async function save() {
    if (!form.name.trim() || busy) return;
    setBusy(true);
    try {
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${product.id}`;
      const payload = { ...form, images: JSON.stringify(extraImages) };
      if (form.salePercent && Number(form.salePercent) > 0 && Number(form.price) > 0) {
        payload.wasPrice = Number(form.price);
        payload.price = Math.round(Number(form.price) * (1 - Number(form.salePercent) / 100));
      }
      delete payload.salePercent;
      const res = await fetch(url, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || "Failed"); return; }
      onSaved();
    } finally { setBusy(false); }
  }

  return (
    <div onClick={onClose} style={modalWrap}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--panel)", border: "1px solid var(--card-b)", maxWidth: 640, width: "100%", maxHeight: "88vh", overflowY: "auto", padding: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26 }}>{isNew ? "New product" : "Edit product"}</div>
          <div onClick={onClose} style={{ cursor: "pointer", fontSize: 22, color: "var(--ink-muted)" }}>×</div>
        </div>
        {/* Cover image */}
        <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginBottom: 10 }}>Cover image</div>
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <img src={form.image} alt="" style={{ width: 90, height: 108, objectFit: "cover", border: "1px solid var(--card-b)" }} />
          <div style={{ flex: 1 }}>
            <label style={{ cursor: "pointer", display: "block", border: "1px dashed rgba(227,183,166,.4)", padding: 14, textAlign: "center", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
              {uploading ? "Uploading…" : "Upload photo"}
              <input type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
            </label>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {ASSET_IMAGES.map((img) => <img key={img} src={img} onClick={() => setForm((f) => ({ ...f, image: img }))} alt="" style={{ width: 34, height: 40, objectFit: "cover", cursor: "pointer", border: `1px solid ${form.image === img ? "var(--rose)" : "transparent"}` }} />)}
            </div>
          </div>
        </div>
        {/* Extra gallery images */}
        <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginBottom: 10 }}>Gallery images (optional)</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
          {extraImages.map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={img} alt="" style={{ width: 52, height: 62, objectFit: "cover", border: "1px solid var(--card-b)" }} />
              <div onClick={() => setExtraImages((imgs) => imgs.filter((_, j) => j !== i))} style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", background: "var(--rose)", color: "#fff", fontSize: 10, display: "grid", placeItems: "center", cursor: "pointer" }}>×</div>
            </div>
          ))}
          <label style={{ cursor: "pointer", width: 52, height: 62, border: "1px dashed rgba(227,183,166,.4)", display: "grid", placeItems: "center", fontSize: 18, color: "var(--ink-faint)" }}>
            {uploadingExtra ? "…" : "+"}
            <input type="file" accept="image/*" onChange={uploadExtra} style={{ display: "none" }} />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Labeled label="Name" span2><input value={form.name} onChange={set("name")} style={adminInput} /></Labeled>
          <Labeled label="Price (Rs)"><input value={form.price} onChange={set("price")} style={adminInput} /></Labeled>
          <Labeled label="Was price (manual)"><input value={form.wasPrice} onChange={set("wasPrice")} placeholder="Leave blank if using Sale %" style={adminInput} /></Labeled>
          <Labeled label="Sale % (auto wasPrice)"><input value={form.salePercent} onChange={set("salePercent")} placeholder="e.g. 20 for 20% off" style={adminInput} /></Labeled>
          <Labeled label="Stock"><input value={form.stock} onChange={set("stock")} style={adminInput} /></Labeled>
          <Labeled label="Badge (optional)"><input value={form.badge} onChange={set("badge")} placeholder="Best seller" style={adminInput} /></Labeled>
          <Labeled label="Shape"><select value={form.shape} onChange={set("shape")} style={{ ...adminInput, background: "var(--bg)" }}>{["Almond", "Coffin", "Square", "Stiletto"].map((o) => <option key={o}>{o}</option>)}</select></Labeled>
          <Labeled label="Length"><select value={form.length} onChange={set("length")} style={{ ...adminInput, background: "var(--bg)" }}>{["Short", "Medium", "Long"].map((o) => <option key={o}>{o}</option>)}</select></Labeled>
          <Labeled label="Finish"><input value={form.finish} onChange={set("finish")} style={adminInput} /></Labeled>
          <Labeled label="Occasion"><select value={form.occasion} onChange={set("occasion")} style={{ ...adminInput, background: "var(--bg)" }}>{["Bridal", "Party", "Everyday"].map((o) => <option key={o}>{o}</option>)}</select></Labeled>
          <Labeled label="Category"><select value={form.categoryId} onChange={set("categoryId")} style={{ ...adminInput, background: "var(--bg)" }}><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Labeled>
          <Labeled label="Colorway" span2><input value={form.colorway} onChange={set("colorway")} placeholder="Nude · White · Rose gold" style={adminInput} /></Labeled>
          <Labeled label="Description" span2><textarea rows={3} value={form.blurb} onChange={set("blurb")} style={{ ...adminInput, resize: "vertical" }} /></Labeled>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, fontSize: 12.5, color: "var(--ink-muted)", cursor: "pointer" }}>
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Feature on homepage
        </label>
        <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
          <div onClick={save} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "14px 30px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase" }}>{busy ? "Saving…" : isNew ? "Create product" : "Save changes"}</div>
          <div onClick={onClose} style={{ cursor: "pointer", border: "1px solid var(--card-b)", padding: "14px 24px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-muted)" }}>Cancel</div>
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, span2, children }) {
  return (
    <div style={{ gridColumn: span2 ? "span 2" : undefined, display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)" }}>{label}</span>
      {children}
    </div>
  );
}

/* ---------- Messages + Subscribers ---------- */
function MessagesTab({ messages, subscribers }) {
  const [view, setView] = useState("messages");

  function exportSubscriberCSV() {
    const rows = ["Email,Joined", ...subscribers.map((s) => `${s.email},${s.date}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="admin-flex-row" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <h1 style={{ ...h1, marginBottom: 0 }}>{view === "messages" ? "Messages" : "Newsletter subscribers"}</h1>
        <div className="admin-flex-actions" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <div onClick={() => setView("messages")} style={{ cursor: "pointer", fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", padding: "9px 16px", border: `1px solid ${view === "messages" ? "var(--bronze)" : "rgba(227,183,166,.25)"}`, color: view === "messages" ? "var(--rose-light)" : "var(--ink-muted)" }}>Messages ({messages.length})</div>
          <div onClick={() => setView("subscribers")} style={{ cursor: "pointer", fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", padding: "9px 16px", border: `1px solid ${view === "subscribers" ? "var(--bronze)" : "rgba(227,183,166,.25)"}`, color: view === "subscribers" ? "var(--rose-light)" : "var(--ink-muted)" }}>Subscribers ({subscribers.length})</div>
        </div>
      </div>

      {view === "messages" && (
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
          {messages.length === 0 && <div style={{ padding: 30, color: "var(--ink-faint)", fontSize: 13 }}>No messages yet.</div>}
          {messages.map((m) => (
            <div key={m.id} style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-b)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, marginBottom: 4 }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{m.phone || "No phone"}{m.topic ? " · " + m.topic : ""} · {m.date}</div>
                </div>
                {m.phone && (
                  <a href={`https://wa.me/92${m.phone.replace(/^\+?0*/, "").replace(/\D/g, "")}?text=${encodeURIComponent("Hi " + m.name + "! Thanks for reaching out to Myso Nails Studio.")}`} target="_blank" rel="noreferrer" className="btn-wa" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", padding: "8px 14px", whiteSpace: "nowrap" }}>Reply on WhatsApp</a>
                )}
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "var(--ink-muted)", margin: "12px 0 0", maxWidth: 680 }}>{m.body}</p>
            </div>
          ))}
        </div>
      )}

      {view === "subscribers" && (
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
          <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--card-b)", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-faint)", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center" }}>
            <div>Email</div><div>Joined</div>
            {subscribers.length > 0 && <div onClick={exportSubscriberCSV} style={{ cursor: "pointer", fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "5px 10px", color: "var(--ink-muted)" }}>Export CSV</div>}
          </div>
          {subscribers.length === 0 && <div style={{ padding: 30, color: "var(--ink-faint)", fontSize: 13 }}>No subscribers yet.</div>}
          {subscribers.map((s) => (
            <div key={s.id} style={{ padding: "14px 24px", borderBottom: "1px solid var(--card-b)", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", fontSize: 13 }}>
              <div style={{ color: "var(--rose-light)" }}>{s.email}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{s.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Reviews ---------- */
function ReviewsTab({ reviews }) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [editing, setEditing] = useState(null); // { id, body, rating, name }
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  async function patch(id, data) {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) setLocalReviews((prev) => prev.map((x) => x.id === id ? { ...x, ...data } : x));
    return res.ok;
  }

  async function del(id) {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) setLocalReviews((r) => r.filter((x) => x.id !== id));
  }

  async function saveEdit() {
    if (!editing) return;
    const ok = await patch(editing.id, { body: editing.body, rating: editing.rating, name: editing.name });
    if (ok) setEditing(null);
  }

  const shown = localReviews.filter((r) => r.verified).length;
  const hidden = localReviews.length - shown;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ ...h1, marginBottom: 0 }}>Reviews <span style={{ fontSize: 14, color: "var(--ink-faint)", fontFamily: "var(--sans)" }}>({localReviews.length})</span></h1>
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 20 }}>
        <span style={{ color: "#8FD6A6" }}>● {shown} shown on site</span> &nbsp;·&nbsp; <span style={{ color: "var(--ink-muted)" }}>● {hidden} hidden</span>
      </div>
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
        {localReviews.length === 0 && <div style={{ padding: 30, color: "var(--ink-faint)", fontSize: 13 }}>No reviews yet.</div>}
        {localReviews.map((r) => (
          <div key={r.id} style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-b)", opacity: r.verified ? 1 : 0.55 }}>
            {editing?.id === r.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input value={editing.name} onChange={(e) => setEditing((x) => ({ ...x, name: e.target.value }))} style={{ ...adminInput, width: 180 }} placeholder="Reviewer name" />
                  <select value={editing.rating} onChange={(e) => setEditing((x) => ({ ...x, rating: Number(e.target.value) }))} style={{ ...adminInput, width: 100 }}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{stars(n)}</option>)}
                  </select>
                </div>
                <textarea rows={4} value={editing.body} onChange={(e) => setEditing((x) => ({ ...x, body: e.target.value }))} style={{ ...adminInput, resize: "vertical" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <div onClick={saveEdit} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "9px 18px", fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase" }}>Save</div>
                  <div onClick={() => setEditing(null)} style={{ cursor: "pointer", border: "1px solid var(--card-b)", padding: "9px 16px", fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-muted)" }}>Cancel</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ color: "#C9A27E", fontSize: 13 }}>{stars(r.rating)}</span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 18 }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{r.date}</span>
                    {!r.verified && <span style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,130,0,.4)", color: "#C88200", padding: "3px 8px" }}>Hidden</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "rgba(227,183,166,.7)", marginBottom: 8 }}>on <span style={{ color: "var(--rose-light)" }}>{r.productName}</span></div>
                  <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--ink-muted)", margin: 0 }}>{r.body}</p>
                  {(r.image || r.image2) && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      {r.image && <img src={r.image} alt="" style={{ width: 60, height: 60, objectFit: "cover", border: "1px solid var(--card-b)" }} />}
                      {r.image2 && <img src={r.image2} alt="" style={{ width: 60, height: 60, objectFit: "cover", border: "1px solid var(--card-b)" }} />}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  <div onClick={() => patch(r.id, { verified: !r.verified })} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: `1px solid ${r.verified ? "rgba(143,214,166,.5)" : "rgba(227,183,166,.3)"}`, padding: "7px 11px", color: r.verified ? "#8FD6A6" : "var(--ink-muted)", whiteSpace: "nowrap" }}>
                    {r.verified ? "✓ Shown on site" : "Show on site"}
                  </div>
                  <div onClick={() => setEditing({ id: r.id, body: r.body, rating: r.rating, name: r.name })} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "7px 11px", color: "var(--ink-muted)" }}>Edit</div>
                  <div onClick={() => del(r.id)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.35)", color: "#E39B9B", padding: "7px 11px" }}>Delete</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Analytics ---------- */
function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/stats");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  function exportReport() {
    if (!data) return;
    const L = [];
    L.push("MYSO NAILS STUDIO — SALES REPORT");
    L.push(`Generated,${new Date().toLocaleString("en-GB")}`);
    L.push("");
    L.push("Summary,Revenue,Orders");
    L.push(`All time,${data.allTime.revenue},${data.allTime.orders}`);
    L.push(`This month,${data.thisMonth.revenue},${data.thisMonth.orders}`);
    L.push(`Last month,${data.lastMonth.revenue},${data.lastMonth.orders}`);
    L.push("");
    L.push("Month,Revenue");
    data.monthlyData.forEach((m) => L.push(`${m.month},${m.revenue}`));
    L.push("");
    L.push("Order status,Count");
    data.statusCounts.forEach((s) => L.push(`${s.status},${s._count}`));
    L.push("");
    L.push("Top product,Units sold");
    data.topProducts.forEach((p) => L.push(`"${String(p.name).replace(/"/g, '""')}",${p._sum?.qty || 0}`));

    const blob = new Blob([L.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myso-sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!data) return (
    <div>
      <h1 style={{ ...h1, marginBottom: 10 }}>Analytics</h1>
      <div onClick={load} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "13px 26px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", display: "inline-block" }}>{loading ? "Loading…" : "Load analytics"}</div>
    </div>
  );

  const maxRev = Math.max(...data.monthlyData.map((m) => m.revenue), 1);
  const statusColors = { Pending: "#C88200", Confirmed: "#1E8C3C", Shipped: "#1E8C3C", Delivered: "#8FD6A6", Rejected: "#C83232", Cancelled: "#9B1B2A" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ ...h1, marginBottom: 0 }}>Analytics</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <div onClick={exportReport} style={{ cursor: "pointer", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "9px 16px", color: "var(--ink-muted)" }}>↓ Sales report CSV</div>
          <div onClick={load} style={{ cursor: "pointer", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "9px 16px", color: "var(--ink-muted)" }}>Refresh</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "All-time revenue", val: `Rs ${data.allTime.revenue.toLocaleString()}`, sub: `${data.allTime.orders} orders` },
          { label: "This month", val: `Rs ${data.thisMonth.revenue.toLocaleString()}`, sub: `${data.thisMonth.orders} orders` },
          { label: "Last month", val: `Rs ${data.lastMonth.revenue.toLocaleString()}`, sub: `${data.lastMonth.orders} orders` },
        ].map((k) => (
          <div key={k.label} style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: "22px 24px" }}>
            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--rose)", marginBottom: 4 }}>{k.val}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 20 }}>Revenue — last 6 months</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {data.monthlyData.map((m) => (
            <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
              <div style={{ width: "100%", background: "linear-gradient(to top,#9B1B2A,#C4233D)", height: `${Math.max(4, (m.revenue / maxRev) * 100)}%`, minHeight: 4, transition: "height .4s" }} />
              <div style={{ fontSize: 9.5, color: "var(--ink-faint)", textAlign: "center", whiteSpace: "nowrap" }}>{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders by status + Top products */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 16 }}>Orders by status</div>
          {data.statusCounts.map((s) => (
            <div key={s.status} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--card-b)", fontSize: 13 }}>
              <span style={{ color: statusColors[s.status] || "var(--ink-muted)" }}>{s.status}</span>
              <span style={{ color: "var(--ink)" }}>{s._count}</span>
            </div>
          ))}
        </div>
        <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 16 }}>Top products</div>
          {data.topProducts.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--card-b)" }}>
              <img src={p.image} alt="" style={{ width: 36, height: 36, objectFit: "cover", border: "1px solid var(--card-b)" }} />
              <div style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--rose)", whiteSpace: "nowrap" }}>{p._sum?.qty || 0} sold</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Bundle Deals ---------- */
function BundleDealsTab() {
  const [rules, setRules] = useState(null);
  const [form, setForm] = useState({ name: "", minQty: "", discountPercent: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/bundle-rules");
    if (res.ok) setRules(await res.json());
  }

  async function add() {
    if (!form.name || !form.minQty || !form.discountPercent) return alert("Fill all fields");
    setBusy(true);
    const res = await fetch("/api/admin/bundle-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ name: "", minQty: "", discountPercent: "" }); load(); }
    setBusy(false);
  }

  async function toggle(rule) {
    await fetch(`/api/admin/bundle-rules/${rule.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !rule.active }) });
    load();
  }

  async function del(id) {
    if (!confirm("Delete this rule?")) return;
    await fetch(`/api/admin/bundle-rules/${id}`, { method: "DELETE" });
    load();
  }

  if (!rules) return (
    <div>
      <h1 style={{ ...h1, marginBottom: 10 }}>Bundle Deals</h1>
      <div onClick={load} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "13px 26px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", display: "inline-block" }}>Load rules</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ ...h1, marginBottom: 6 }}>Bundle Deals</h1>
      <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24, lineHeight: 1.7 }}>Agar customer X ya zyada items order kare to automatically Y% discount milega. Sabse bada matching rule apply hoga.</p>

      {/* Add rule */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 16 }}>Add new rule</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px auto", gap: 12, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 7 }}>Rule name</div>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Buy 2 Get Discount" style={adminInput} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 7 }}>Min items</div>
            <input type="number" min="2" value={form.minQty} onChange={(e) => setForm((f) => ({ ...f, minQty: e.target.value }))} placeholder="2" style={adminInput} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 7 }}>Discount %</div>
            <input type="number" min="1" max="90" value={form.discountPercent} onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))} placeholder="10" style={adminInput} />
          </div>
          <div onClick={add} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "13px 18px", fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{busy ? "…" : "Add"}</div>
        </div>
      </div>

      {/* Rules list */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
        {rules.length === 0 && <div style={{ padding: 28, color: "var(--ink-faint)", fontSize: 13 }}>No bundle rules yet.</div>}
        {rules.map((r) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid var(--card-b)", gap: 16, opacity: r.active ? 1 : 0.5 }}>
            <div>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Buy {r.minQty}+ items → <strong style={{ color: "var(--rose)" }}>{r.discountPercent}% off</strong></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div onClick={() => toggle(r)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: `1px solid ${r.active ? "rgba(143,214,166,.5)" : "rgba(227,183,166,.3)"}`, padding: "7px 12px", color: r.active ? "#8FD6A6" : "var(--ink-muted)", whiteSpace: "nowrap" }}>{r.active ? "✓ Active" : "Inactive"}</div>
              <div onClick={() => del(r.id)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.35)", color: "#E39B9B", padding: "7px 12px" }}>Delete</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Custom Orders ---------- */
function CustomOrdersTab() {
  const [reqs, setReqs] = useState(null);
  const [detail, setDetail] = useState(null);
  const STATUS_OPTS = ["New", "Quoted", "InProgress", "Done", "Cancelled"];
  const statusColor = { New: "var(--rose)", Quoted: "#C9A27E", InProgress: "#1E8C3C", Done: "#8FD6A6", Cancelled: "rgba(200,90,90,.7)" };

  async function load() {
    const res = await fetch("/api/admin/custom-requests");
    if (res.ok) setReqs(await res.json());
  }

  async function updateStatus(id, status) {
    await fetch(`/api/admin/custom-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setReqs((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    if (detail?.id === id) setDetail((d) => ({ ...d, status }));
  }

  async function del(id) {
    if (!confirm("Delete this request?")) return;
    await fetch(`/api/admin/custom-requests/${id}`, { method: "DELETE" });
    setReqs((prev) => prev.filter((r) => r.id !== id));
    if (detail?.id === id) setDetail(null);
  }

  if (!reqs) return (
    <div>
      <h1 style={{ ...h1, marginBottom: 10 }}>Custom Orders</h1>
      <div onClick={load} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "13px 26px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", display: "inline-block" }}>Load requests</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ ...h1, marginBottom: 0 }}>Custom Orders <span style={{ fontSize: 14, color: "var(--ink-faint)", fontFamily: "var(--sans)" }}>({reqs.length})</span></h1>
        <div onClick={load} style={{ cursor: "pointer", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "9px 16px", color: "var(--ink-muted)" }}>Refresh</div>
      </div>

      {detail && (
        <div style={{ ...modalWrap }}>
          <div style={{ background: "var(--panel)", border: "1px solid var(--card-b)", padding: 32, maxWidth: 620, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 26, margin: 0 }}>{detail.name}</h2>
              <div onClick={() => setDetail(null)} style={{ cursor: "pointer", fontSize: 20, color: "var(--ink-muted)", padding: "4px 8px" }}>×</div>
            </div>
            <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Phone</span><br />{detail.phone}</div>
                {detail.email && <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Email</span><br />{detail.email}</div>}
                {detail.occasion && <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Occasion</span><br />{detail.occasion}</div>}
                {detail.deadline && <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Deadline</span><br />{detail.deadline}</div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Shape</span><br />{detail.shape}</div>
                <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Length</span><br />{detail.length}</div>
              </div>
              {detail.sizes && (() => {
                try { const s = JSON.parse(detail.sizes); const entries = Object.entries(s).filter(([, v]) => v); if (!entries.length) return null; return <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Sizes</span><br /><div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>{entries.map(([f, v]) => <span key={f} style={{ fontSize: 12, border: "1px solid var(--card-b)", padding: "3px 8px" }}>{f}: {v}</span>)}</div></div>; } catch { return null; }
              })()}
              {detail.colorPrefs && <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Color preferences</span><br />{detail.colorPrefs}</div>}
              <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Design notes</span><br /><p style={{ margin: "6px 0 0", lineHeight: 1.7, color: "var(--ink-muted)" }}>{detail.designNotes}</p></div>
              {detail.refImages && (() => {
                try { const imgs = JSON.parse(detail.refImages); if (!imgs.length) return null; return <div><span style={{ color: "var(--ink-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em" }}>Reference images</span><div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>{imgs.map((img, i) => <img key={i} src={img} alt="" style={{ width: 80, height: 80, objectFit: "cover", border: "1px solid var(--card-b)" }} />)}</div></div>; } catch { return null; }
              })()}
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--ink-faint)", marginRight: 4 }}>Status:</span>
              {STATUS_OPTS.map((s) => (
                <div key={s} onClick={() => updateStatus(detail.id, s)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: `1px solid ${detail.status === s ? statusColor[s] : "var(--card-b)"}`, padding: "7px 10px", color: detail.status === s ? statusColor[s] : "var(--ink-muted)" }}>{s}</div>
              ))}
              <a href={`https://wa.me/92${detail.phone.replace(/^\+?0*/, "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${detail.name}! Aapki custom nail request ke baray mein baat karni thi 🌸`)}`} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid #25D366", color: "#25D366", padding: "7px 10px", whiteSpace: "nowrap" }}>WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
        {reqs.length === 0 && <div style={{ padding: 28, color: "var(--ink-faint)", fontSize: 13 }}>No custom nail requests yet.</div>}
        {reqs.map((r) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid var(--card-b)", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14 }}>{r.name}</span>
                <span style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", border: `1px solid ${statusColor[r.status] || "var(--card-b)"}`, padding: "3px 8px", color: statusColor[r.status] || "var(--ink-muted)" }}>{r.status}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{r.phone} · {r.shape} · {r.length} · {new Date(r.createdAt).toLocaleDateString("en-GB")}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div onClick={() => setDetail(r)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "7px 12px", color: "var(--ink-muted)" }}>View</div>
              <div onClick={() => del(r.id)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.35)", color: "#E39B9B", padding: "7px 12px" }}>Delete</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Drops ---------- */
function DropsTab() {
  const [drops, setDrops] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", launchAt: "", image: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/drops");
    if (res.ok) setDrops(await res.json());
  }

  async function add() {
    if (!form.name || !form.launchAt) return alert("Name and launch date required");
    setBusy(true);
    const res = await fetch("/api/admin/drops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ name: "", description: "", launchAt: "", image: "" }); load(); }
    setBusy(false);
  }

  async function toggle(drop) {
    await fetch(`/api/admin/drops/${drop.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !drop.active }) });
    load();
  }

  async function del(id) {
    if (!confirm("Delete this drop?")) return;
    await fetch(`/api/admin/drops/${id}`, { method: "DELETE" });
    load();
  }

  if (!drops) return (
    <div>
      <h1 style={{ ...h1, marginBottom: 10 }}>Drops</h1>
      <div onClick={load} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "13px 26px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", display: "inline-block" }}>Load drops</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ ...h1, marginBottom: 6 }}>Drops</h1>
      <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24, lineHeight: 1.7 }}>Upcoming collection drops <a href="/drops" target="_blank" style={{ color: "var(--rose)" }}>/drops</a> pe countdown ke saath dikh'te hain.</p>

      {/* Add drop */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 16 }}>Schedule new drop</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 7 }}>Collection name *</div>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Eid 2025 Collection" style={adminInput} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 7 }}>Launch date & time *</div>
            <input type="datetime-local" value={form.launchAt} onChange={(e) => setForm((f) => ({ ...f, launchAt: e.target.value }))} style={{ ...adminInput, background: "var(--bg)" }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 7 }}>Description</div>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description..." style={adminInput} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 7 }}>Cover image path (optional)</div>
            <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="/assets/p1-french.jpeg" style={adminInput} />
          </div>
        </div>
        <div onClick={add} style={{ cursor: "pointer", marginTop: 14, background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "12px 24px", fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", display: "inline-block" }}>{busy ? "Saving…" : "Schedule drop"}</div>
      </div>

      {/* Drops list */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
        {drops.length === 0 && <div style={{ padding: 28, color: "var(--ink-faint)", fontSize: 13 }}>No drops scheduled yet.</div>}
        {drops.map((d) => {
          const launched = new Date(d.launchAt) <= new Date();
          return (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid var(--card-b)", gap: 12, flexWrap: "wrap", opacity: d.active ? 1 : 0.5 }}>
              <div>
                <div style={{ fontSize: 14, marginBottom: 4 }}>{d.name}</div>
                <div style={{ fontSize: 11.5, color: launched ? "#8FD6A6" : "var(--rose)", marginBottom: 4 }}>{launched ? "✓ Live" : "⏳ Scheduled"} — {new Date(d.launchAt).toLocaleString("en-PK")}</div>
                {d.description && <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{d.description}</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div onClick={() => toggle(d)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: `1px solid ${d.active ? "rgba(143,214,166,.5)" : "rgba(227,183,166,.3)"}`, padding: "7px 12px", color: d.active ? "#8FD6A6" : "var(--ink-muted)" }}>{d.active ? "✓ Active" : "Hidden"}</div>
                <div onClick={() => del(d.id)} style={{ cursor: "pointer", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.35)", color: "#E39B9B", padding: "7px 12px" }}>Delete</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */
function SettingsTab({ content, call, busy }) {
  const [form, setForm] = useState({
    deliveryFee: content?.deliveryFee ?? 250,
    freeDeliveryOver: content?.freeDeliveryOver ?? 5000,
    codHandling: content?.codHandling ?? 100,
    storeClosed: content?.storeClosed ?? false,
    storeClosedMsg: content?.storeClosedMsg ?? "We're temporarily closed. Check back soon!",
    flashSalePercent: content?.flashSalePercent ?? 0,
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Change password (admin is a Customer record, so reuse /api/account/password)
  const [pw, setPw] = useState({ current: "", newPassword: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState(""); // "" | "saving" | "done"
  const [pwError, setPwError] = useState("");

  async function save() {
    const ok = await call("/api/admin/content", "PUT", form);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  }

  async function changePassword() {
    setPwError("");
    if (!pw.current || !pw.newPassword) { setPwError("Both fields are required"); return; }
    if (pw.newPassword !== pw.confirm) { setPwError("New passwords do not match"); return; }
    if (pw.newPassword.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    setPwStatus("saving");
    try {
      const res = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: pw.current, newPassword: pw.newPassword }) });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || "Could not change password"); setPwStatus(""); return; }
      setPwStatus("done"); setPw({ current: "", newPassword: "", confirm: "" });
      setTimeout(() => setPwStatus(""), 3000);
    } catch { setPwError("Network error"); setPwStatus(""); }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ ...h1, marginBottom: 8 }}>Store settings</h1>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 28 }}>Changes take effect immediately on the storefront.</div>

      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 20 }}>Store status</div>
        <label style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 18 }}>
          <div onClick={() => setForm((f) => ({ ...f, storeClosed: !f.storeClosed }))} style={{ width: 44, height: 24, borderRadius: 12, background: form.storeClosed ? "var(--rose)" : "var(--panel)", position: "relative", transition: "background .2s", border: "1px solid var(--card-b)", cursor: "pointer" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: form.storeClosed ? "#1A0F0A" : "var(--ink-muted)", position: "absolute", top: 2, left: form.storeClosed ? 22 : 2, transition: "left .2s" }} />
          </div>
          <span style={{ fontSize: 13, color: form.storeClosed ? "#E39B9B" : "#8FD6A6" }}>{form.storeClosed ? "Store is CLOSED" : "Store is OPEN"}</span>
        </label>
        <div>
          <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>Closed message (shown to visitors)</div>
          <input value={form.storeClosedMsg} onChange={set("storeClosedMsg")} style={adminInput} />
        </div>
      </div>

      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 20 }}>Delivery fees</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>Delivery fee (Rs)</div>
            <input type="number" value={form.deliveryFee} onChange={set("deliveryFee")} style={adminInput} />
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>Free delivery over (Rs)</div>
            <input type="number" value={form.freeDeliveryOver} onChange={set("freeDeliveryOver")} style={adminInput} />
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>COD handling fee (Rs)</div>
            <input type="number" value={form.codHandling} onChange={set("codHandling")} style={adminInput} />
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 10 }}>Flash sale</div>
        <div style={{ fontSize: 12, color: "rgba(247,241,237,.45)", marginBottom: 16 }}>Set a site-wide sale percentage. Products that already have a wasPrice will show both discounts.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <input type="number" min="0" max="90" value={form.flashSalePercent} onChange={set("flashSalePercent")} style={{ ...adminInput, width: 120 }} placeholder="0" />
          <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>% off (0 = no flash sale active)</span>
        </div>
        {Number(form.flashSalePercent) > 0 && <div style={{ marginTop: 12, fontSize: 12, color: "var(--rose)", padding: "10px 14px", border: "1px solid rgba(242,205,187,.3)" }}>Flash sale active — {form.flashSalePercent}% off displayed on all product pages</div>}
      </div>

      <div onClick={save} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "14px 34px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", display: "inline-block" }}>{busy ? "Saving…" : saved ? "Saved ✓" : "Save settings"}</div>

      {/* Change password */}
      <div style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 28, marginTop: 30 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 20 }}>Change admin password</div>
        {pwStatus === "done" && <div style={{ padding: "12px 16px", border: "1px solid rgba(143,214,166,.3)", color: "#8FD6A6", fontSize: 13, marginBottom: 16 }}>Password changed ✓</div>}
        <div style={{ display: "grid", gap: 14, maxWidth: 420 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>Current password</div>
            <input type="password" value={pw.current} onChange={(e) => { setPw((p) => ({ ...p, current: e.target.value })); setPwError(""); }} style={adminInput} />
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>New password</div>
            <input type="password" value={pw.newPassword} onChange={(e) => { setPw((p) => ({ ...p, newPassword: e.target.value })); setPwError(""); }} placeholder="Min. 8 characters" style={adminInput} />
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>Confirm new password</div>
            <input type="password" value={pw.confirm} onChange={(e) => { setPw((p) => ({ ...p, confirm: e.target.value })); setPwError(""); }} onKeyDown={(e) => e.key === "Enter" && changePassword()} style={adminInput} />
          </div>
          {pwError && <div style={{ fontSize: 12, color: "#E39B9B" }}>{pwError}</div>}
          <div onClick={changePassword} style={{ cursor: "pointer", border: "1px solid var(--card-b)", color: "var(--ink)", padding: "13px 26px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", justifySelf: "start" }}>{pwStatus === "saving" ? "Saving…" : "Change password"}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Media ---------- */
function GiftCardsTab({ giftCards = [] }) {
  const active = giftCards.filter((g) => g.active && g.balance > 0);
  const outstanding = active.reduce((s, g) => s + g.balance, 0);
  const issued = giftCards.reduce((s, g) => s + g.initialAmount, 0);

  function copyCode(code) { navigator.clipboard?.writeText(code); }

  return (
    <div>
      <h1 style={{ ...h1, marginBottom: 6 }}>Gift Cards</h1>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 22 }}>Cards are issued when a gift-card order is <strong>Confirmed</strong>. Redeemed at checkout like a coupon.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total issued", value: rs(issued) },
          { label: "Active cards", value: String(active.length) },
          { label: "Outstanding balance", value: rs(outstanding) },
        ].map((k) => (
          <div key={k.label} style={{ border: "1px solid var(--card-b)", background: "var(--panel)", padding: 20 }}>
            <div style={{ fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{k.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--ink)", marginTop: 8 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div data-scroll-x="1" style={{ border: "1px solid var(--card-b)", background: "var(--panel)" }}>
        <div style={{ minWidth: 820, display: "grid", gridTemplateColumns: "150px 1fr 110px 110px 1fr 100px", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--card-b)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
          <div>Code</div><div>Recipient / buyer</div><div>Value</div><div>Balance</div><div>Order</div><div>Status</div>
        </div>
        {giftCards.length === 0 && <div style={{ padding: 30, color: "var(--ink-faint)", fontSize: 13 }}>No gift cards issued yet.</div>}
        {giftCards.map((g) => (
          <div key={g.id} style={{ minWidth: 820, display: "grid", gridTemplateColumns: "150px 1fr 110px 110px 1fr 100px", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--card-b)", alignItems: "center", fontSize: 12.5 }}>
            <div onClick={() => copyCode(g.code)} title="Click to copy" style={{ cursor: "pointer", color: "var(--rose-light)", fontFamily: "var(--serif)", letterSpacing: ".04em" }}>{g.code}</div>
            <div style={{ color: "var(--ink-muted)", fontSize: 11.5 }}>{g.recipient || "—"}<div style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{g.buyerEmail || "guest"}</div></div>
            <div>{rs(g.initialAmount)}</div>
            <div style={{ color: g.balance > 0 ? "#8FD6A6" : "var(--ink-faint)" }}>{rs(g.balance)}</div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{g.orderCode || "—"} · {g.date}</div>
            <div><span style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", border: `1px solid ${g.active ? "rgba(143,214,166,.4)" : "var(--card-b)"}`, color: g.active ? "#8FD6A6" : "var(--ink-faint)", padding: "5px 9px" }}>{g.active ? (g.balance > 0 ? "Active" : "Used") : "Pending"}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaTab() {
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setFiles(data.files || []);
    } finally { setLoading(false); }
  }

  async function del(filename) {
    if (!confirm(`Delete ${filename}?`)) return;
    const res = await fetch(`/api/admin/media/${encodeURIComponent(filename)}`, { method: "DELETE" });
    if (res.ok) setFiles((f) => f.filter((x) => x.name !== filename));
  }

  if (files === null) {
    return (
      <div>
        <h1 style={{ ...h1, marginBottom: 10 }}>Media</h1>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 24 }}>Manage uploaded images in your store.</div>
        <div onClick={load} style={{ cursor: "pointer", background: "linear-gradient(100deg,#9B1B2A,#C4233D)", color: "#fff", padding: "13px 26px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", display: "inline-block" }}>{loading ? "Loading…" : "Load uploaded files"}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ ...h1, marginBottom: 0 }}>Media <span style={{ fontSize: 14, color: "var(--ink-faint)", fontFamily: "var(--sans)" }}>({files.length} files)</span></h1>
        <div onClick={load} style={{ cursor: "pointer", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", border: "1px solid var(--card-b)", padding: "9px 16px", color: "var(--ink-muted)" }}>Refresh</div>
      </div>
      {files.length === 0 ? (
        <div style={{ border: "1px dashed rgba(227,183,166,.25)", padding: 40, textAlign: "center", color: "var(--ink-muted)", fontSize: 13 }}>No uploaded files yet. Images appear here when you upload via product or category editors.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14 }}>
          {files.map((f) => (
            <div key={f.name} style={{ border: "1px solid var(--card-b)", background: "var(--panel)", overflow: "hidden" }}>
              <div style={{ aspectRatio: "1/1", overflow: "hidden", position: "relative" }}>
                <img src={f.path} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 10.5, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }}>{f.name}</div>
                <div style={{ fontSize: 10, color: "var(--ink-faint)", marginBottom: 10 }}>{(f.size / 1024).toFixed(0)} KB</div>
                <div onClick={() => del(f.name)} style={{ cursor: "pointer", fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", border: "1px solid rgba(200,90,90,.35)", color: "#E39B9B", padding: "6px 10px", textAlign: "center" }}>Delete</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- styles + helpers ---------- */
const h1 = { fontFamily: "var(--serif)", fontWeight: 300, fontSize: 38, margin: "0 0 24px" };
const adminInput = { background: "transparent", border: "1px solid var(--card-b)", color: "var(--ink)", padding: 13, fontSize: 13, outline: "none", width: "100%" };
const modalWrap = { position: "fixed", inset: 0, zIndex: 120, background: "rgba(4,4,5,.85)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 24 };

function statusBadge(status) {
  const map = {
    Pending:   ["rgba(200,130,0,.5)",   "#C88200"],
    Confirmed: ["rgba(30,140,60,.45)",  "#1E8C3C"],
    Shipped:   ["rgba(30,140,60,.45)",  "#1E8C3C"],
    Delivered: ["rgba(30,140,60,.45)",  "#1E8C3C"],
    Rejected:  ["rgba(200,50,50,.45)",  "#C83232"],
    Cancelled: ["rgba(155,27,42,.35)",  "#9B1B2A"],
  };
  const [border, color] = map[status] || ["rgba(155,27,42,.2)", "var(--rose)"];
  return { fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: `1px solid ${border}`, color, padding: "6px 9px" };
}
function nextStatus(s) {
  return { Pending: "Confirmed", Confirmed: "Shipped", Shipped: "Delivered" }[s] || "Confirmed";
}
function advanceLabel(s) {
  return { Pending: "Confirm", Confirmed: "Ship", Shipped: "Deliver" }[s] || "Confirm";
}

function waStatusMsg(phone, status, code, name, tpls = {}) {
  const template = tpls[status];
  if (!template || !phone) return null;
  const text = template.replace(/\{name\}/g, name).replace(/\{code\}/g, code);
  const intl = "92" + phone.replace(/^\+?0*/, "").replace(/\D/g, "");
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
