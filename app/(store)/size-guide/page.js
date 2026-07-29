import Link from "next/link";
import { waLink } from "@/lib/format";

export const metadata = {
  title: "Nail size guide — Myso Nails Studio",
  description: "How to measure your nails for the perfect press-on fit. Finger size chart, mm ruler guide and free sizing kit.",
};

export default function SizeGuidePage() {
  const sizes = [
    { finger: "Pinky", mm: "11–13 mm", tip: "Smallest finger — measure carefully" },
    { finger: "Ring", mm: "14–16 mm", tip: "Usually 1–2mm wider than pinky" },
    { finger: "Middle", mm: "15–18 mm", tip: "Often widest on the hand" },
    { finger: "Index", mm: "14–17 mm", tip: "Usually similar to ring finger" },
    { finger: "Thumb", mm: "17–21 mm", tip: "Widest — don't skip this one" },
  ];
  const steps = [
    { n: "01", title: "Print the chart", body: "Download and print the PDF at 100% scale (no 'fit to page'). Place a ruler on the printed ruler to verify it printed correctly." },
    { n: "02", title: "Measure each nail", body: "Press the widest point of your nail (not your finger) against the mm markings. Write down all 10 measurements — left and right hands differ slightly." },
    { n: "03", title: "Send your chart", body: "Screenshot your measurements and send on WhatsApp, or type them in the notes field at checkout: T-18, I-15, M-17, R-15, P-12 (both hands)." },
    { n: "04", title: "We size every nail", body: "We file each press-on to your exact width before painting. Every set leaves fitted — never use a size chart that comes with the set." },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 110px" }}>
      <div style={{ fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "rgba(227,183,166,.75)", marginBottom: 14 }}>Sizing</div>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: "clamp(40px,5vw,66px)", margin: "0 0 16px" }}>Nail size guide</h1>
      <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.58)", fontWeight: 300, maxWidth: 600, marginBottom: 52 }}>Every set is filed to your measurements before it ships. Getting your sizes right means no gaps at the sides and no lifting — it takes two minutes.</p>

      {/* Size table */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 60 }}>
        {sizes.map((s) => (
          <div key={s.finger} style={{ border: "1px solid rgba(227,183,166,.18)", background: "var(--panel)", padding: 24 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--rose-light)", marginBottom: 8 }}>{s.finger}</div>
            <div style={{ fontSize: 22, fontFamily: "var(--serif)", color: "var(--ink)", marginBottom: 10 }}>{s.mm}</div>
            <div style={{ fontSize: 12.5, color: "rgba(247,241,237,.45)", lineHeight: 1.7 }}>{s.tip}</div>
          </div>
        ))}
      </div>

      {/* MM ruler visual */}
      <div style={{ border: "1px solid rgba(227,183,166,.2)", background: "var(--panel)", padding: "26px 30px", marginBottom: 52 }}>
        <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 16 }}>Ruler guide — print or measure on screen</div>
        <div style={{ display: "flex", gap: 0, alignItems: "flex-end", overflowX: "auto", paddingBottom: 8 }}>
          {Array.from({ length: 21 }, (_, i) => i + 10).map((mm) => (
            <div key={mm} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 42, flexShrink: 0 }}>
              <div style={{ height: mm % 5 === 0 ? 22 : 12, width: 1, background: mm % 5 === 0 ? "var(--bronze)" : "rgba(227,183,166,.3)" }} />
              {mm % 5 === 0 && <div style={{ fontSize: 9.5, color: "rgba(247,241,237,.5)", marginTop: 5, letterSpacing: ".06em" }}>{mm}</div>}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "rgba(247,241,237,.38)", marginTop: 8 }}>Numbers are in mm. Ruler is approximate on-screen — for exact sizing, measure with a physical ruler.</div>
      </div>

      {/* Steps */}
      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 38, margin: "0 0 32px" }}>How to measure</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginBottom: 52 }}>
        {steps.map((s) => (
          <div key={s.n} style={{ borderTop: "1px solid rgba(227,183,166,.25)", paddingTop: 20 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--bronze)", letterSpacing: ".3em", marginBottom: 10 }}>{s.n}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, marginBottom: 10 }}>{s.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.85, color: "rgba(247,241,237,.52)", fontWeight: 300 }}>{s.body}</div>
          </div>
        ))}
      </div>

      {/* Free sizing kit */}
      <div className="kit-cta" style={{ border: "1px solid rgba(227,183,166,.22)", background: "var(--panel)", padding: 34, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 30, marginBottom: 10 }}>Not sure? Get a free sizing kit.</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "rgba(247,241,237,.55)", maxWidth: 520, margin: 0 }}>We send a set of 10 sizing tabs — press, find the right number, send us the list. Free with any order or on request.</p>
        </div>
        <a href={waLink("Hi M&S! I'd like a free sizing kit please")} target="_blank" rel="noreferrer" className="btn-wa" style={{ padding: "15px 24px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Request on WhatsApp</a>
      </div>
    </div>
  );
}
