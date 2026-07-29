import { waLink } from "@/lib/format";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

const FAQS = [
  { q: "How long do they last?", a: "Two to three weeks with glue, four to five days with adhesive tabs." },
  { q: "Do you make custom designs?", a: "Yes — send any reference photo on WhatsApp for a quote. Bridal sets take four to six days." },
  { q: "What if the size is wrong?", a: "We re-size the affected nails free once. Send us a photo and we ship replacements." },
];
const SIZE_ROWS = [
  { label: "XS", mm: "7mm" }, { label: "S", mm: "8mm" }, { label: "M", mm: "9mm" }, { label: "L", mm: "10mm" }, { label: "XL", mm: "11mm" },
  { label: "Thumb", mm: "14–16" }, { label: "Index", mm: "11–13" }, { label: "Middle", mm: "12–14" }, { label: "Ring", mm: "10–12" }, { label: "Pinky", mm: "8–10" },
];

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 24px 100px" }}>
      <div style={{ maxWidth: 560, marginBottom: 44 }}>
        <div style={{ fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "rgba(227,183,166,.8)", marginBottom: 20 }}>Contact</div>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: "clamp(40px,4.6vw,60px)", lineHeight: 1.05, margin: "0 0 16px" }}>Talk to the studio</h1>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(247,241,237,.6)", fontWeight: 300 }}>WhatsApp is fastest — custom quotes, sizing help and order updates all happen there. Replies within an hour, 11am to 9pm.</p>
      </div>

      <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 14 }}>
          <a href={waLink("Hi M&S!")} target="_blank" rel="noreferrer" className="btn-wa" style={{ background: "var(--panel)", padding: 30, display: "block" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(247,241,237,.5)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#25D366", display: "inline-block" }} />WhatsApp Business</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 36, color: "var(--ink)", margin: "12px 0 6px", letterSpacing: ".03em" }}>0302 090 9786</div>
            <div style={{ fontSize: 12.5, color: "rgba(247,241,237,.45)" }}>Orders, custom quotes, sizing · tap to chat</div>
          </a>
          <a href="https://instagram.com/_myso.nails" target="_blank" rel="noreferrer" className="card-soft" style={{ background: "var(--panel)", padding: 24, display: "block" }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.45)" }}>Instagram</div>
            <div style={{ fontSize: 16, color: "var(--rose)", marginTop: 10 }}>@_myso.nails</div>
          </a>
          <div style={{ border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)", padding: 28 }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 16 }}>Studio</div>
            <div style={{ fontSize: 13.5, lineHeight: 2, color: "rgba(247,241,237,.6)", fontWeight: 300 }}>Johar Town, Lahore — by appointment only<br />Mon–Sat · 11am to 9pm · Sunday closed<br />Nationwide delivery 2–4 working days</div>
          </div>
          <div style={{ border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)", padding: 28 }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 16 }}>Quick answers</div>
            {FAQS.map((q) => (
              <div key={q.q} style={{ borderBottom: "1px solid rgba(227,183,166,.1)", padding: "14px 0" }}>
                <div style={{ fontSize: 13.5, color: "rgba(247,241,237,.85)" }}>{q.q}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.8, color: "rgba(247,241,237,.5)", marginTop: 6, fontWeight: 300 }}>{q.a}</div>
              </div>
            ))}
          </div>
          <div style={{ border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)", padding: 28 }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 16 }}>Nail size chart</div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(247,241,237,.55)", fontWeight: 300, marginTop: 0 }}>Measure the widest point of each nail in mm, then match to the closest size — round up if between two.</p>
            <div className="contact-size-chart" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: "rgba(227,183,166,.14)" }}>
              {SIZE_ROWS.map((r) => (
                <div key={r.label} className="csc-cell" style={{ background: "var(--bg)", padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,241,237,.4)" }}>{r.label}</div>
                  <div className="csc-mm" style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--rose-light)", marginTop: 6 }}>{r.mm}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)", padding: 36 }}>
          <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 8 }}>Send a message</div>
          <div style={{ fontSize: 13, color: "rgba(247,241,237,.45)", marginBottom: 24 }}>For custom designs, attach your reference on WhatsApp after sending this.</div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
