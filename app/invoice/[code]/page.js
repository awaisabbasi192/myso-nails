import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import InvoiceActions from "@/components/InvoiceActions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Invoice", robots: { index: false, follow: false } };

const rs = (n) => "Rs " + Number(n || 0).toLocaleString("en-PK");
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

export default async function InvoicePage({ params }) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/invoice/${encodeURIComponent(code)}`);

  const order = await prisma.order.findUnique({
    where: { code: decodeURIComponent(code) },
    include: { items: true, customer: { select: { id: true, email: true } } },
  });
  if (!order) notFound();

  // Only the customer who placed it — or an admin — may view an invoice.
  const isOwner = order.customerId && order.customerId === user.id;
  if (!isOwner && user.role !== "admin") notFound();

  const itemsTotal = order.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const discount = Math.max(0, itemsTotal - order.subtotal) || 0;
  const lines = [
    ["Items subtotal", rs(order.subtotal)],
    discount > 0 ? ["Discount", "− " + rs(discount)] : null,
    order.couponCode ? [`Coupon (${order.couponCode})`, "applied"] : null,
    order.giftCardUsed > 0 ? [`Gift card (${order.giftCardCode})`, "− " + rs(order.giftCardUsed)] : null,
    order.pointsRedeemed > 0 ? [`Loyalty points (${order.pointsRedeemed} pts)`, "− " + rs(order.pointsRedeemed)] : null,
    ["Delivery", order.shipping === 0 ? "Free" : rs(order.shipping)],
  ].filter(Boolean);

  return (
    <div className="invoice-page">
      <InvoiceActions code={order.code} />

      <div className="invoice-sheet">
        {/* Header */}
        <div className="inv-head">
          <div className="inv-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BRAND.logo} alt={BRAND.name} className="inv-logo" />
            <div>
              <div className="inv-brand-name">{BRAND.name}</div>
              <div className="inv-brand-meta">{BRAND.city}</div>
              <div className="inv-brand-meta">WhatsApp {BRAND.phoneDisplay}</div>
              <div className="inv-brand-meta">@{BRAND.instagramHandle}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-title">Invoice</div>
            <div className="inv-code">{order.code}</div>
            <div className="inv-brand-meta">Issued {fmt(order.createdAt)}</div>
            <div className={`inv-status inv-status-${order.status.toLowerCase()}`}>{order.status}</div>
          </div>
        </div>

        {/* Bill to */}
        <div className="inv-parties">
          <div>
            <div className="inv-label">Billed to</div>
            <div className="inv-strong">{order.customerName}</div>
            <div className="inv-brand-meta">{order.phone}</div>
            <div className="inv-brand-meta">{order.address}</div>
            <div className="inv-brand-meta">{order.city}</div>
            {order.customer?.email && <div className="inv-brand-meta">{order.customer.email}</div>}
          </div>
          <div>
            <div className="inv-label">Payment</div>
            <div className="inv-strong">{order.paymentMethod === "cod" ? "Cash on delivery" : "JazzCash — 100% advance"}</div>
            {order.trackingNumber && (
              <>
                <div className="inv-label" style={{ marginTop: 14 }}>Tracking</div>
                <div className="inv-strong">{order.trackingNumber}</div>
              </>
            )}
            {order.nailSizes && (
              <>
                <div className="inv-label" style={{ marginTop: 14 }}>Nail sizes</div>
                <div className="inv-brand-meta">{order.nailSizes}</div>
              </>
            )}
          </div>
        </div>

        {/* Items */}
        <table className="inv-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Set</th>
              <th>Size</th>
              <th style={{ textAlign: "right" }}>Unit</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="inv-strong">{i.name}</td>
                <td className="inv-brand-meta">{i.size}</td>
                <td style={{ textAlign: "right" }}>{rs(i.unitPrice)}</td>
                <td style={{ textAlign: "center" }}>{i.qty}</td>
                <td style={{ textAlign: "right" }}>{rs(i.unitPrice * i.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="inv-totals">
          {lines.map(([label, value]) => (
            <div key={label} className="inv-total-row">
              <span>{label}</span><span>{value}</span>
            </div>
          ))}
          <div className="inv-total-row inv-grand">
            <span>Total paid</span><span>{rs(order.total)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="inv-notes">
            <div className="inv-label">Notes</div>
            <div className="inv-brand-meta">{order.notes}</div>
          </div>
        )}

        <div className="inv-foot">
          <div className="inv-thanks">Thank you — handmade with love ♡</div>
          <div className="inv-brand-meta">
            Every set is hand-painted and filed to your nail chart. Questions? WhatsApp {BRAND.phoneDisplay}.
          </div>
        </div>
      </div>
    </div>
  );
}
