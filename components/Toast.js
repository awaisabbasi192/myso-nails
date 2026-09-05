"use client";

import { useEffect, useState } from "react";

/**
 * Global toast host. Anything on the page can raise one with:
 *   showToast("Added to bag", "success")
 * No provider/context needed — it listens for a window event, so server
 * components and plain onClick handlers can both fire it.
 */
export default function Toast() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    function onToast(e) {
      const { message, type = "success", icon } = e.detail || {};
      if (!message) return;
      const id = Date.now() + Math.random();
      setItems((list) => [...list, { id, message, type, icon }]);
      setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3200);
    }
    window.addEventListener("myra:toast", onToast);
    return () => window.removeEventListener("myra:toast", onToast);
  }, []);

  if (items.length === 0) return null;

  const tone = {
    success: { border: "rgba(78,140,106,.45)", accent: "var(--good)", fallbackIcon: "✓" },
    error:   { border: "rgba(180,87,75,.45)",  accent: "var(--danger)", fallbackIcon: "!" },
    info:    { border: "var(--card-b-h)",      accent: "var(--rose)", fallbackIcon: "♡" },
  };

  return (
    <div className="toast-host" aria-live="polite">
      {items.map((t) => {
        const s = tone[t.type] || tone.info;
        return (
          <div key={t.id} className="toast" style={{ borderColor: s.border }}>
            <span className="toast-icon" style={{ color: s.accent }}>{t.icon || s.fallbackIcon}</span>
            <span className="toast-msg">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Fire a toast from anywhere on the client. */
export function showToast(message, type = "success", icon) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("myra:toast", { detail: { message, type, icon } }));
}
