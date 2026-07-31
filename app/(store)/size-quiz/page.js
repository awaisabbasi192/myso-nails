"use client";
import { useState } from "react";
import Link from "next/link";

const QUESTIONS = [
  { q: "Aapki ring size kya hai?", opts: [["XS – bahut chhoti", 0], ["S – chhoti", 1], ["M – average", 2], ["L – thodi badi", 3], ["XL – badi", 4]] },
  { q: "Aapki nail ki width kaisi hai?", opts: [["Bahut patli (pencil jitni)", 0], ["Patli", 1], ["Average", 2], ["Chaudi", 3], ["Bahut chaudi", 4]] },
  { q: "Aapki nail ki shape kaisi hai?", opts: [["Bilkul flat", 0], ["Thodi si curve", 1], ["Medium curve", 2], ["Zyada curve", 3]] },
  { q: "Pehle koi press-on lagayi hai?", opts: [["Nahi, pehli baar", 0], ["Haan, bahut chhoti thi", 1], ["Haan, fit thi", 2], ["Haan, thodi badi thi", 3]] },
  { q: "Aap usually konsa ring size pehenti hain?", opts: [["5 ya kam", 0], ["6", 1], ["7", 2], ["8", 3], ["9 ya zyada", 4]] },
];

const SIZE_MAP = [
  { label: "XS (Extra Small)", range: [0, 5], desc: "Bahut chhoti, patli nails — Size A set perfect rahega." },
  { label: "S (Small)", range: [6, 9], desc: "Chhoti nails — Size B recommend kiya jaata hai." },
  { label: "M (Medium)", range: [10, 13], desc: "Average size — Size C/D sabse zyada popular hai." },
  { label: "L (Large)", range: [14, 17], desc: "Thodi badi nails — Size E best fit hoga." },
  { label: "XL (Extra Large)", range: [18, 100], desc: "Chaudi nails — Size F ya custom order consider karein." },
];

export default function SizeQuizPage() {
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);

  function answer(val) {
    const newAnswers = { ...answers, [current]: val };
    setAnswers(newAnswers);
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      const total = Object.values(newAnswers).reduce((a, b) => a + b, 0);
      const size = SIZE_MAP.find((s) => total >= s.range[0] && total <= s.range[1]) || SIZE_MAP[2];
      setResult(size);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "56px 24px 100px" }}>
      <Link href="/shop" style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 28, display: "inline-block" }}>← Back</Link>
      <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 10 }}>Size finder</div>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 44, lineHeight: 1.1, margin: "0 0 36px" }}>Find your nail size</h1>

      {!result ? (
        <div style={{ border: "1px solid var(--card-b)", padding: "36px 32px", background: "var(--panel)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, background: i <= current ? "var(--rose)" : "var(--card-b)", transition: "background .3s" }} />
            ))}
          </div>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 12 }}>Question {current + 1} of {QUESTIONS.length}</div>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 26, margin: "0 0 28px", lineHeight: 1.4 }}>{QUESTIONS[current].q}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {QUESTIONS[current].opts.map(([label, val]) => (
              <div key={label} onClick={() => answer(val)} style={{ cursor: "pointer", padding: "14px 20px", border: "1px solid var(--card-b)", fontSize: 14, color: "var(--ink)", transition: "border-color .2s, background .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--rose)"; e.currentTarget.style.background = "rgba(155,27,42,.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-b)"; e.currentTarget.style.background = "transparent"; }}>
                {label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--card-b)", padding: "44px 36px", background: "var(--panel)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--script)", fontSize: 52, color: "var(--rose)", marginBottom: 8 }}>your size</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 64, color: "var(--ink)", margin: "0 0 12px" }}>{result.label}</div>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: "var(--ink-muted)", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>{result.desc}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/shop" className="shimmer" style={{ display: "inline-block", padding: "14px 28px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase" }}>Shop now</Link>
            <div onClick={() => { setAnswers({}); setCurrent(0); setResult(null); }} style={{ cursor: "pointer", padding: "14px 28px", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", border: "1px solid var(--card-b)", color: "var(--ink-muted)" }}>Retake quiz</div>
          </div>
        </div>
      )}
    </div>
  );
}
