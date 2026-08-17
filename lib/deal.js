import { prisma } from "@/lib/prisma";

// Banner colour themes for seasonal promotions.
export const DEAL_THEMES = {
  red:    { grad: "linear-gradient(100deg,#9B1B2A,#C4233D 60%,#9B1B2A)", text: "#ffffff", emoji: "⚡" },
  green:  { grad: "linear-gradient(100deg,#0A5C2E,#14833F 60%,#0A5C2E)", text: "#ffffff", emoji: "🇵🇰" },
  gold:   { grad: "linear-gradient(100deg,#8A6410,#C79A2E 55%,#8A6410)", text: "#1A0F0A", emoji: "🌙" },
  purple: { grad: "linear-gradient(100deg,#3D1163,#6B21A8 60%,#3D1163)", text: "#ffffff", emoji: "✨" },
};

export function dealTheme(theme) {
  return DEAL_THEMES[theme] || DEAL_THEMES.red;
}

const DEAL_SELECT = {
  dealActive: true, dealTitle: true, dealSubtitle: true, dealPercent: true,
  dealMaxOrders: true, dealStartAt: true, dealTheme: true,
};

/**
 * Resolves the currently-effective promotion.
 *
 * Honors an optional "first N orders" limit (dealMaxOrders): once that many
 * non-cancelled orders have been placed since the deal was switched on
 * (dealStartAt), the deal automatically ends and prices return to normal.
 *
 * Pass a pre-fetched SiteContent (with deal fields) to avoid an extra query,
 * or call with no argument to have it fetch what it needs.
 */
export async function getActiveDeal(content) {
  const c = content && content.dealActive !== undefined
    ? content
    : await prisma.siteContent.findUnique({ where: { id: 1 }, select: DEAL_SELECT });

  if (!c || !c.dealActive || !(c.dealPercent > 0)) {
    return { active: false, percent: 0 };
  }

  const max = c.dealMaxOrders || 0;
  let remaining = null;
  if (max > 0) {
    const since = c.dealStartAt || new Date(0);
    const used = await prisma.order.count({
      where: { createdAt: { gte: since }, status: { notIn: ["Rejected", "Cancelled"] } },
    });
    remaining = Math.max(0, max - used);
    if (remaining <= 0) return { active: false, percent: 0, soldOut: true };
  }

  return {
    active: true,
    percent: c.dealPercent,
    title: c.dealTitle || "Special Offer",
    subtitle: c.dealSubtitle || "",
    theme: c.dealTheme || "red",
    maxOrders: max,
    remaining, // null when unlimited
  };
}
