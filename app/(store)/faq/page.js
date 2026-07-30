import Link from "next/link";
import { waLink } from "@/lib/format";

export const metadata = {
  title: "FAQ — Myso Nails Studio",
  description: "Common questions about press-on nails, sizing, delivery, JazzCash payment, custom orders and more.",
};

const FAQS = [
  {
    category: "Sizing & Fit",
    items: [
      {
        q: "How do I find my nail size?",
        a: "Use the free sizing kit we include with every first order — press each sticker onto your nail and note the number. You can also use a ruler to measure the widest part of each nail in millimetres. Once we have your sizes on file, future orders ship with zero measuring needed.",
      },
      {
        q: "What if the nails don't fit when they arrive?",
        a: "Every set is hand-filed to your submitted sizes before it leaves. If anything feels off, WhatsApp us within 48 hours of delivery and we'll sort it — a free replacement size or a full refund, your choice.",
      },
      {
        q: "Can I order a free sizing kit before buying?",
        a: "Yes! Just message us on WhatsApp and we'll send one out. You only pay delivery (Rs 250), which is credited back if you place a full order within 30 days.",
      },
    ],
  },
  {
    category: "The Nails",
    items: [
      {
        q: "How long do the nails last?",
        a: "With glue tabs: 1–3 days (perfect for events). With nail glue: 2–3 weeks. Avoid soaking in water (washing dishes, long showers) and they'll last much longer.",
      },
      {
        q: "Can I reuse them?",
        a: "Absolutely — up to 15+ times. Store them in the original box, clean gently with nail polish remover between wears, and they'll keep their shine for months.",
      },
      {
        q: "How do I remove press-on nails safely?",
        a: "Soak your nails in warm soapy water for 10–15 minutes. Gently wiggle from the side — never rip or peel from the tip. For glue tabs, they usually slide off on their own. Never force them off; if they resist, soak longer.",
      },
      {
        q: "What shapes and lengths do you offer?",
        a: "We currently offer Almond, Coffin, Stiletto, Oval, Square, and Squoval — in short, medium, long and extra-long lengths. Custom shapes and lengths are available on request via WhatsApp.",
      },
    ],
  },
  {
    category: "Orders & Payment",
    items: [
      {
        q: "Why is payment 100% advance via JazzCash?",
        a: "Every set is made by hand specifically for your nail sizes, so we can't resell it. Advance payment protects that work. Send to JazzCash 0302 090 9786, upload your screenshot at checkout, and we confirm within 30 minutes.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard sets ship within 48 hours and arrive in 2–4 working days nationwide. Bridal and fully custom sets take 5–7 working days to paint before dispatch.",
      },
      {
        q: "Do you ship outside Pakistan?",
        a: "Not yet — we're working on it. Currently we ship to all cities in Pakistan. Subscribe to our newsletter to be the first to know when international shipping launches.",
      },
      {
        q: "Can I cancel or change my order?",
        a: "Yes, if you message us within 2 hours of placing the order we can cancel or adjust it. After that, if we've already started painting, cancellations are at our discretion and may incur a 20% restocking fee.",
      },
    ],
  },
  {
    category: "Custom & Bridal",
    items: [
      {
        q: "Can I order a completely custom design?",
        a: "Yes — that's actually what we love most. Send a reference photo on WhatsApp, tell us your colours, and we'll quote you within an hour. If we can see it, we can paint it.",
      },
      {
        q: "How do I order a bridal set?",
        a: "WhatsApp us your wedding date, inspo photos and budget. We recommend ordering at least 3 weeks before the event for bridal sets. We'll match your outfit colour if you send a photo or fabric swatch.",
      },
    ],
  },
];

const label = { fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "var(--rose)" };

export default function FAQPage() {
  return (
    <div>
      {/* HERO */}
      <section style={{ background: "var(--panel)", borderBottom: "1px solid var(--card-b)", padding: "44px 24px 36px", textAlign: "center" }}>
        <div style={{ ...label, marginBottom: 12 }}>Got questions?</div>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: "clamp(32px,4.5vw,52px)", margin: "0 0 14px", lineHeight: 1.1 }}>
          Frequently asked questions
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--ink-muted)", maxWidth: 420, margin: "0 auto 22px" }}>
          Can&apos;t find your answer? WhatsApp us directly.
        </p>
        <a
          href={waLink("Hi! I have a question about Myso Nails.")}
          target="_blank"
          rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid #25D366", color: "var(--ink)", padding: "11px 22px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", borderRadius: 2 }}
        >
          <span style={{ fontSize: 16 }}>💬</span> Ask on WhatsApp
        </a>
      </section>

      {/* FAQ SECTIONS */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 60px" }}>
        {FAQS.map((section) => (
          <div key={section.category} style={{ marginBottom: 36 }}>
            <div style={{ ...label, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--card-b)" }}>{section.category}</div>
            {section.items.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <div className="faq-body">{item.a}</div>
              </details>
            ))}
          </div>
        ))}

        {/* CTA */}
        <div style={{ marginTop: 40, textAlign: "center", padding: "36px 32px", border: "1px solid var(--card-b)", borderRadius: 3, background: "var(--panel)" }}>
          <div style={{ fontFamily: "var(--script)", fontSize: 38, color: "var(--rose)", marginBottom: 8 }}>Still not sure?</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "var(--ink-muted)", maxWidth: 360, margin: "0 auto 20px" }}>
            I personally answer every WhatsApp message — design questions, sizing, custom quotes, anything.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={waLink("Hi! I have a question about my order.")} target="_blank" rel="noreferrer" className="shimmer" style={{ padding: "13px 28px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", borderRadius: 2 }}>
              WhatsApp Maya
            </a>
            <Link href="/shop" className="btn-outline" style={{ padding: "13px 28px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", borderRadius: 2 }}>
              Shop the sets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
