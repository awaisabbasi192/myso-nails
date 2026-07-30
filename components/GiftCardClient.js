"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { rs } from "@/lib/format";

const AMOUNTS = [2000, 3000, 5000, 10000];
const GIFT_IMAGE = "/assets/myso-gold-glam.jpeg";
const label = { fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "var(--rose)" };
const inputStyle = { width: "100%", background: "transparent", border: "1px solid var(--card-b)", color: "var(--ink)", padding: "13px 15px", fontSize: 13.5, outline: "none", borderRadius: 2 };
const labelStyle = { fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8, display: "block" };

export default function GiftCardClient() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [amount, setAmount] = useState(3000);
  const [custom, setCustom] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");

  const finalAmount = custom ? Math.max(500, Number(custom) || 0) : amount;

  function addGiftCard() {
    if (finalAmount < 500) return;
    const parts = [];
    if (recipient.trim()) parts.push(`for ${recipient.trim()}`);
    addToCart(
      {
        slug: `giftcard-${Date.now()}`, // unique so cards never merge & no flash discount / stock touch
        name: `Gift Card — ${rs(finalAmount)}${parts.length ? " (" + parts.join(", ") + ")" : ""}`,
        image: GIFT_IMAGE,
        price: finalAmount,
        size: "Gift Card",
        giftMeta: { recipient: recipient.trim(), sender: sender.trim(), message: message.trim() },
      },
      1
    );
    router.push("/cart");
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 24px 90px" }}>
      <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 26 }}>
        Home / Gift Cards
      </div>

      <div data-r="split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>
        {/* Visual */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 6, overflow: "hidden", border: "1px solid var(--card-b)", boxShadow: "0 30px 70px rgba(0,0,0,.3)" }}>
            <img src={GIFT_IMAGE} alt="Myso Nails Gift Card" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,4,6,.92) 8%, transparent 55%)" }} />
            <div style={{ position: "absolute", bottom: 28, left: 28, right: 28 }}>
              <div style={{ fontFamily: "var(--script)", fontSize: 40, color: "#fff", lineHeight: 1 }}>Gift Card</div>
              <div style={{ fontSize: 11, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginTop: 8 }}>Myso Nails Studio</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 34, color: "var(--rose-light)", marginTop: 14 }}>{rs(finalAmount)}</div>
              {recipient.trim() && <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 6 }}>To: {recipient.trim()}</div>}
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          <div style={{ ...label, marginBottom: 14 }}>The perfect gift</div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: 46, margin: "0 0 14px", lineHeight: 1.05 }}>
            Give hand-painted nails
          </h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.8, color: "var(--ink-muted)", marginBottom: 30 }}>
            Perfect for birthdays, bridesmaids and Eid. They pick their own design and sizes — you just pick the amount.
          </p>

          {/* Amount */}
          <div style={{ marginBottom: 22 }}>
            <span style={labelStyle}>Choose amount</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {AMOUNTS.map((a) => (
                <div
                  key={a}
                  onClick={() => { setAmount(a); setCustom(""); }}
                  className="pill"
                  style={{ cursor: "pointer", padding: "13px 20px", border: `1px solid ${!custom && amount === a ? "var(--rose)" : "var(--card-b)"}`, color: !custom && amount === a ? "var(--rose-light)" : "var(--ink-muted)", fontSize: 14, borderRadius: 2, fontFamily: "var(--serif)" }}
                >
                  {rs(a)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <input
                type="number"
                min="500"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Or enter a custom amount (min Rs 500)"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Recipient + sender */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <span style={labelStyle}>Recipient name</span>
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Ayesha" style={inputStyle} />
            </div>
            <div>
              <span style={labelStyle}>Your name</span>
              <input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="e.g. Sara" style={inputStyle} />
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: 24 }}>
            <span style={labelStyle}>Message (optional)</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Happy birthday! Treat yourself 💅" style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div
            onClick={addGiftCard}
            className="shimmer"
            style={{ cursor: "pointer", textAlign: "center", padding: "17px 40px", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", borderRadius: 2 }}
          >
            Add gift card to bag — {rs(finalAmount)}
          </div>

          <p style={{ fontSize: 12, lineHeight: 1.7, color: "var(--ink-faint)", marginTop: 16 }}>
            After checkout we send the gift card code to your WhatsApp within 30 minutes. The recipient redeems it on any order — no expiry.
          </p>
        </div>
      </div>
    </div>
  );
}
