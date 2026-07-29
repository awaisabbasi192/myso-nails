import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our story — Myso Nails Studio",
  description: "How Myso Nails Studio started in a bedroom in Lahore and became Pakistan's favourite hand-painted press-on nail brand.",
  openGraph: { title: "Our story — Myso Nails Studio" },
};

const label = { fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "rgba(227,183,166,.8)" };

const STATS = [
  { value: "4 yrs", label: "Hand painting sets" },
  { value: "3,800+", label: "Orders shipped" },
  { value: "4.9", label: "Average rating" },
  { value: "48 hrs", label: "Dispatch time" },
];
const VALUES = [
  { title: "Fitted, not standard", body: "Every set is matched to your ten nail widths from the mm chart, or we send a free sizing kit before we paint." },
  { title: "Hand painted only", body: "No printed wraps, no stickers. Chrome, swirls, leopard spots and florals are drawn nail by nail." },
  { title: "Reusable up to 4 times", body: "Soak off gently, clean the underside, re-wear. One set can carry you through a whole wedding season." },
  { title: "Real people on WhatsApp", body: "Maya answers the number herself. Sizing questions, quotes and order updates in the same chat." },
];

export default async function AboutPage() {
  const content = await prisma.siteContent.findUnique({ where: { id: 1 } });

  const aboutImage1    = content?.aboutImage1    || "/assets/p1-french.jpeg";
  const aboutHeadline  = content?.aboutHeadline  || "One brush, one lamp, a lot of brides.";
  const aboutBody1     = content?.aboutBody1     || "Myso Nails Studio started in 2022 as a side table in Maya's bedroom in Lahore.";
  const aboutBody2     = content?.aboutBody2     || "Four years and thousands of sets later nothing about the process has changed.";
  const aboutArtistImg = content?.aboutArtistImg || "/assets/p4-nude.jpeg";
  const aboutArtistName= content?.aboutArtistName|| "Maya, founder";
  const aboutArtistBio = content?.aboutArtistBio || "I answer the WhatsApp myself, so when you send a reference photo at 1am you're talking to the person who will paint it.";
  const aboutArtistSign= content?.aboutArtistSign|| "Maya";

  return (
    <div>
      <section data-r="split" style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 24px 30px", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 56, alignItems: "center" }}>
        <div>
          <div style={{ ...label, marginBottom: 22 }}>Our story</div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: "clamp(40px,4.6vw,66px)", lineHeight: 1.05, margin: "0 0 20px" }}>{aboutHeadline}</h1>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.62)", fontWeight: 300, maxWidth: 500 }}>{aboutBody1}</p>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.62)", fontWeight: 300, maxWidth: 500 }}>{aboutBody2}</p>
        </div>
        <div style={{ position: "relative" }}>
          <img src={aboutImage1} alt="Our story" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: -14, border: "1px solid rgba(227,183,166,.22)", pointerEvents: "none" }} />
        </div>
      </section>

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "50px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ borderTop: "1px solid rgba(227,183,166,.25)", paddingTop: 20 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 38, color: "var(--rose-light)" }}>{s.value}</div>
              <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--panel)", borderTop: "1px solid rgba(227,183,166,.12)", borderBottom: "1px solid rgba(227,183,166,.12)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 40, margin: "0 0 40px" }}>What we promise</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 22 }}>
            {VALUES.map((v) => (
              <div key={v.title} style={{ border: "1px solid rgba(227,183,166,.16)", padding: 28, background: "var(--bg)" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 24, marginBottom: 12 }}>{v.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.85, color: "rgba(247,241,237,.55)", fontWeight: 300 }}>{v.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-r="split" style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 56, alignItems: "center" }}>
        <img src={aboutArtistImg} alt={aboutArtistName} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }} />
        <div>
          <div style={{ ...label, marginBottom: 18 }}>Meet the artist</div>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 44, lineHeight: 1.15, margin: "0 0 20px" }}>{aboutArtistName}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.62)", fontWeight: 300, maxWidth: 520 }}>{aboutArtistBio}</p>
          <div style={{ fontFamily: "var(--script)", fontSize: 38, color: "var(--rose)", marginTop: 22 }}>{aboutArtistSign}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <Link href="/contact" className="gradient-warm" style={{ padding: "16px 30px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase" }}>Get in touch</Link>
            <Link href="/shop" style={{ border: "1px solid rgba(227,183,166,.35)", padding: "16px 28px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(247,241,237,.8)" }}>Shop the sets</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
