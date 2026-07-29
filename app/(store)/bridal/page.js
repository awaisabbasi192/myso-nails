import Link from "next/link";
import { waLink } from "@/lib/format";

export const metadata = {
  title: "Bridal press-on nails — Myso Nails Studio",
  description: "Custom hand-painted bridal nail sets fitted to your nails. Mehndi, nikkah and walima looks. Book 2 weeks in advance.",
};

const PACKAGES = [
  {
    name: "Bridal Classic",
    price: "Rs 3,500",
    per: "10-nail set",
    features: ["One design across all nails", "Choice of shape & length", "Fitted to your nail sizes", "Glue tabs + nail glue included", "Dispatched in 4–6 days"],
    highlight: false,
  },
  {
    name: "Bridal Luxe",
    price: "Rs 5,500",
    per: "10-nail set",
    features: ["Mix of accent nails (3D / foil)", "Two design variations", "Extended length available", "Rhinestones / pearls / charms", "Fitted to your nail sizes", "Dispatched in 5–7 days"],
    highlight: true,
  },
  {
    name: "Full Set — 3 events",
    price: "Rs 12,000",
    per: "30 nails · 3 sets",
    features: ["Mehndi · Nikkah · Walima", "Coordinated palette", "Three designs", "Priority dispatch", "Free re-sizing once"],
    highlight: false,
  },
];

const TIMELINE = [
  { day: "Day 1", label: "Book & brief", body: "Send your reference photos and sizes on WhatsApp. I confirm the design and quote." },
  { day: "Day 2–3", label: "Design approval", body: "I sketch or share a mood board for your approval before painting starts." },
  { day: "Day 4–6", label: "Painting & curing", body: "Each nail is painted, cured, filed and quality-checked by hand." },
  { day: "Day 7", label: "Dispatch", body: "Packed and shipped. Arrives 1–2 days later with full application instructions." },
];

const GALLERY = ["/assets/p1-french.jpeg", "/assets/g1.jpeg", "/assets/p3-leopard.jpeg", "/assets/g2.jpeg"];

export default function BridalPage() {
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px 100px" }}>
      {/* Hero */}
      <div className="bridal-hero" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, minHeight: 580, marginBottom: 80 }}>
        <div className="bridal-hero-text" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 56px 80px 0" }}>
          <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(227,183,166,.75)", marginBottom: 18 }}>Bridal nails</div>
          <h1 className="bridal-h1" style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 58, lineHeight: 1.02, margin: "0 0 22px" }}>Your nails should be<br /><em>as perfect as the day</em></h1>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.55)", fontWeight: 300, maxWidth: 440, marginBottom: 36 }}>
            Every bridal set is hand-painted on press-ons fitted to your exact nail chart — so they look flawless in every photo, stay on through the mehndi and come off gently at the end of the week.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href={waLink("Hi Myso Nails! I'm interested in a bridal set")} target="_blank" rel="noreferrer" className="btn-wa" style={{ padding: "16px 30px", fontSize: 11.5, letterSpacing: ".22em", textTransform: "uppercase" }}>Book on WhatsApp</a>
            <Link href="/custom" style={{ padding: "16px 30px", fontSize: 11.5, letterSpacing: ".22em", textTransform: "uppercase", border: "1px solid rgba(227,183,166,.35)", color: "rgba(247,241,237,.75)" }}>Fill custom form</Link>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "40px 0" }}>
          {GALLERY.map((img, i) => (
            <div key={i} style={{ aspectRatio: "1/1", overflow: "hidden" }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Why press-ons for brides */}
      <div style={{ borderTop: "1px solid rgba(227,183,166,.14)", paddingTop: 70, marginBottom: 80 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 42, margin: "0 0 40px", textAlign: "center" }}>Why brides choose press-ons</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
          {[
            { icon: "💅", title: "No salon wait", body: "Done at home, on your timeline — not your salon's." },
            { icon: "⏱", title: "10-minute application", body: "Prep, press, done. No UV lamp, no fumes, no waiting." },
            { icon: "📸", title: "Photo-ready finish", body: "Even length, even shape — every single nail." },
            { icon: "🔁", title: "Re-wearable", body: "Remove gently after the events and wear again — up to 4 times." },
          ].map((f) => (
            <div key={f.title} style={{ border: "1px solid rgba(227,183,166,.14)", padding: "28px 24px", background: "var(--panel)" }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.8, color: "rgba(247,241,237,.55)", fontWeight: 300 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Packages */}
      <div style={{ marginBottom: 80 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 42, margin: "0 0 40px" }}>Bridal packages</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 20 }}>
          {PACKAGES.map((pkg) => (
            <div key={pkg.name} style={{ border: `1px solid ${pkg.highlight ? "rgba(227,183,166,.5)" : "rgba(227,183,166,.16)"}`, background: pkg.highlight ? "rgba(227,183,166,.06)" : "var(--panel)", padding: 30, position: "relative" }}>
              {pkg.highlight && <div style={{ position: "absolute", top: -12, left: 24, fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", background: "linear-gradient(100deg,#B87A62,#F2CDBB)", color: "#1A0F0A", padding: "5px 12px" }}>Most popular</div>}
              <div style={{ fontFamily: "var(--serif)", fontSize: 26, marginBottom: 6 }}>{pkg.name}</div>
              <div style={{ fontSize: 30, fontFamily: "var(--serif)", color: "var(--rose-light)", marginBottom: 4 }}>{pkg.price}</div>
              <div style={{ fontSize: 11, letterSpacing: ".16em", color: "rgba(247,241,237,.4)", marginBottom: 22 }}>{pkg.per}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {pkg.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "rgba(247,241,237,.65)" }}>
                    <span style={{ color: "var(--bronze)", flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <a href={waLink(`Hi Myso Nails! I'm interested in the ${pkg.name} package`)} target="_blank" rel="noreferrer" className="btn-wa" style={{ display: "block", textAlign: "center", padding: "14px 20px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>Book this package</a>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, fontSize: 12.5, color: "rgba(247,241,237,.4)", textAlign: "center" }}>All prices are for the nail set only. Nationwide shipping Rs 250 (free over Rs 5,000).</div>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: 80 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 42, margin: "0 0 40px" }}>Your order timeline</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 0, borderTop: "1px solid rgba(227,183,166,.14)" }}>
          {TIMELINE.map((t, i) => (
            <div key={t.day} style={{ padding: "28px 26px 28px 0", borderRight: i < TIMELINE.length - 1 ? "1px solid rgba(227,183,166,.12)" : "none" }}>
              <div style={{ fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 8 }}>{t.day}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 12 }}>{t.label}</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(247,241,237,.55)", fontWeight: 300 }}>{t.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bridal-cta" style={{ border: "1px solid rgba(227,183,166,.2)", background: "var(--panel)", padding: "52px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 28 }}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 36, marginBottom: 10 }}>Book at least 2 weeks early</div>
          <div style={{ fontSize: 13.5, color: "rgba(247,241,237,.55)", lineHeight: 1.8, maxWidth: 520 }}>Bridal slots fill up fast around Eid and wedding season. WhatsApp me now to check availability for your date.</div>
        </div>
        <a href={waLink("Hi Myso Nails! I'd like to book a bridal set. My wedding date is ")} target="_blank" rel="noreferrer" className="btn-wa bridal-cta-btn" style={{ padding: "18px 34px", fontSize: 11.5, letterSpacing: ".24em", textTransform: "uppercase", textAlign: "center" }}>Check availability on WhatsApp</a>
      </div>
    </div>
  );
}
