"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function Countdown({ target }) {
  const [t, setT] = useState(null);
  useEffect(() => {
    function calc() {
      const diff = new Date(target) - new Date();
      if (diff <= 0) return setT({ days: 0, hours: 0, mins: 0, secs: 0, launched: true });
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setT({ days, hours, mins, secs, launched: false });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!t) return null;
  if (t.launched) return <div style={{ fontSize: 13, color: "#8FD6A6", letterSpacing: ".15em", textTransform: "uppercase" }}>✓ Now live — shop now</div>;

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      {[["days", t.days], ["hours", t.hours], ["mins", t.mins], ["secs", t.secs]].map(([label, val]) => (
        <div key={label} style={{ textAlign: "center", minWidth: 54 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 36, color: "var(--rose)", lineHeight: 1 }}>{String(val).padStart(2, "0")}</div>
          <div style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginTop: 4 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function DropsClient({ drops }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 100px" }}>
      <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: "var(--rose)", marginBottom: 10 }}>Upcoming drops</div>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 50, lineHeight: 1.05, margin: "0 0 12px" }}>New collections</h1>
      <p style={{ fontSize: 14.5, lineHeight: 1.9, color: "var(--ink-muted)", marginBottom: 48, maxWidth: 520 }}>
        Har collection limited sets mein hoti hai — drop se pehle notify ho jao taake miss na ho.
      </p>

      {drops.length === 0 ? (
        <div style={{ border: "1px solid var(--card-b)", padding: "60px 40px", textAlign: "center", background: "var(--panel)" }}>
          <div style={{ fontFamily: "var(--script)", fontSize: 40, color: "var(--rose)", marginBottom: 12 }}>coming soon</div>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.8 }}>Koi upcoming drop abhi nahi hai — WhatsApp pe subscribe karo notification ke liye.</p>
          <a href={`https://wa.me/923020909786?text=${encodeURIComponent("Hi! Mujhe new collection drops ke notifications chahiye 🌸")}`} target="_blank" rel="noreferrer" className="btn-wa" style={{ display: "inline-block", marginTop: 24, padding: "13px 28px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>Notify me on WhatsApp</a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {drops.map((drop) => {
            const launched = new Date(drop.launchAt) <= new Date();
            return (
              <div key={drop.id} style={{ border: "1px solid var(--card-b)", background: "var(--panel)", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: drop.image ? "280px 1fr" : "1fr", minHeight: 220 }}>
                  {drop.image && <img src={drop.image} alt={drop.name} style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 220 }} />}
                  <div style={{ padding: "36px 40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase", color: launched ? "#8FD6A6" : "var(--rose)", marginBottom: 8 }}>{launched ? "Live now" : "Dropping soon"}</div>
                      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 32, margin: "0 0 10px" }}>{drop.name}</h2>
                      {drop.description && <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "var(--ink-muted)", margin: 0 }}>{drop.description}</p>}
                    </div>
                    <Countdown target={drop.launchAt} />
                    <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                      {new Date(drop.launchAt).toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {launched && <Link href="/shop" className="shimmer" style={{ alignSelf: "flex-start", display: "inline-block", padding: "12px 24px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase" }}>Shop now →</Link>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
