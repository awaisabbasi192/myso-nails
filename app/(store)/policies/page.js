import Link from "next/link";
import { waLink } from "@/lib/format";

export const metadata = {
  title: "Terms & Policies — Myso Nails Studio",
  description: "Payment, delivery, refund, exchange and privacy policy for Myso Nails Studio. All orders are paid in advance via JazzCash.",
};

const SECTIONS = [
  {
    id: "payment",
    title: "Payment Policy",
    points: [
      "All orders require 100% advance payment via JazzCash. We do not offer cash on delivery (COD).",
      "Send the exact order total to our JazzCash account: 0306 2451766 (Account title: Naseem).",
      "After sending payment, upload the JazzCash confirmation screenshot at checkout, or send it to us on WhatsApp.",
      "Your order is confirmed only after we verify your payment — usually within 30 minutes during working hours (Mon–Sat, 11am–9pm).",
      "Never send payment to any number other than the one shown at checkout. Myso Nails Studio is not responsible for money sent to incorrect accounts.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery & Shipping",
    points: [
      "A flat delivery charge of Rs 300 applies to every order.",
      "Delivery is FREE on all orders of Rs 5,000 or above.",
      "Ready sets are dispatched within 48 hours of payment confirmation. Custom and bridal sets take 4–7 days as agreed on WhatsApp.",
      "Nationwide delivery across Pakistan takes 2–4 working days after dispatch, depending on your city.",
      "A tracking number is shared on WhatsApp once your parcel is dispatched.",
    ],
  },
  {
    id: "refund",
    title: "Refund & Return Policy",
    points: [
      "Because each set is hand-painted and sized to you, we do not accept returns for change of mind.",
      "If your order arrives damaged or incorrect, contact us on WhatsApp within 24 hours of delivery with clear photos.",
      "Verified damaged/incorrect orders are eligible for a free replacement or a refund of the product amount.",
      "Refunds (where applicable) are processed to your original JazzCash number within 3–5 working days.",
      "Delivery charges are non-refundable once an order has been dispatched.",
    ],
  },
  {
    id: "exchange",
    title: "Sizing & Exchange",
    points: [
      "We size every set to the measurements you provide. Please measure carefully using our Size Guide.",
      "If a set doesn't fit due to a sizing error on our end, we re-size it once for free.",
      "If the sizing was entered incorrectly by the customer, a re-sizing fee plus delivery applies.",
    ],
  },
  {
    id: "cancellation",
    title: "Order Cancellation",
    points: [
      "Orders can be cancelled free of charge while the status is still Pending (before dispatch).",
      "Once an order is Confirmed or Shipped, it cannot be cancelled.",
      "Custom and bridal orders cannot be cancelled once painting has started, as materials and time are reserved for you.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    points: [
      "We collect only the details needed to process and deliver your order: name, phone, address and payment screenshot.",
      "Your information is never sold or shared with third parties, except the courier needed to deliver your order.",
      "Payment screenshots are used solely to verify your order and are stored securely.",
      "You may request deletion of your account and personal data by messaging us on WhatsApp.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 100px" }}>
      <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(227,183,166,.75)", marginBottom: 12 }}>Legal</div>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 48, lineHeight: 1.05, margin: "0 0 16px" }}>Terms &amp; Policies</h1>
      <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.55)", fontWeight: 300, marginBottom: 20 }}>
        Please read these policies before placing your order. By checking out you agree to the terms below. If anything is unclear, message us on{" "}
        <a href={waLink("Hi Myso Nails! I have a question about your policies.")} target="_blank" rel="noreferrer" style={{ color: "var(--rose)", borderBottom: "1px solid rgba(227,183,166,.4)" }}>WhatsApp</a>.
      </p>

      {/* Quick nav */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 44, paddingBottom: 30, borderBottom: "1px solid rgba(227,183,166,.14)" }}>
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", padding: "8px 14px", border: "1px solid rgba(227,183,166,.25)", color: "rgba(247,241,237,.65)" }}>{s.title}</a>
        ))}
      </div>

      {/* Highlight box */}
      <div style={{ border: "1px solid rgba(227,183,166,.3)", background: "var(--panel)", padding: "24px 28px", marginBottom: 44, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)" }}>At a glance</div>
        <div style={{ fontSize: 14, color: "rgba(247,241,237,.7)", lineHeight: 1.9 }}>
          ✔ 100% advance payment via JazzCash — no COD<br />
          ✔ JazzCash: <strong style={{ color: "var(--rose-light)" }}>0306 2451766</strong> (Naseem)<br />
          ✔ Rs 300 delivery — <strong style={{ color: "var(--rose-light)" }}>FREE over Rs 5,000</strong><br />
          ✔ Dispatch within 48 hours of payment confirmation
        </div>
      </div>

      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} style={{ marginBottom: 44, scrollMarginTop: 90 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 30, margin: "0 0 20px", color: "var(--ink)" }}>{s.title}</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            {s.points.map((p, i) => (
              <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, lineHeight: 1.85, color: "rgba(247,241,237,.6)", fontWeight: 300 }}>
                <span style={{ color: "var(--bronze)", flexShrink: 0, marginTop: 2 }}>—</span>{p}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div style={{ borderTop: "1px solid rgba(227,183,166,.14)", paddingTop: 30, marginTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "rgba(247,241,237,.4)" }}>Last updated: July 2026 · Myso Nails Studio, Lahore</div>
        <Link href="/shop" className="gradient-warm" style={{ padding: "13px 26px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>Back to shop</Link>
      </div>
    </div>
  );
}
