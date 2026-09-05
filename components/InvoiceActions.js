"use client";

import Link from "next/link";

/** Print / back controls — hidden when the sheet actually prints. */
export default function InvoiceActions({ code }) {
  return (
    <div className="inv-actions no-print">
      <Link href="/account" className="btn-outline inv-btn">← Back to my account</Link>
      <button onClick={() => window.print()} className="shimmer inv-btn inv-btn-primary">
        🖨 Print / Save as PDF
      </button>
    </div>
  );
}
