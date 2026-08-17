export function rs(n) {
  return "Rs " + Number(n || 0).toLocaleString("en-PK");
}

export function stars(rating) {
  const f = Math.round(rating);
  return "★★★★★".slice(0, f) + "☆☆☆☆☆".slice(0, 5 - f);
}

export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "923020909786";
export function waLink(text) {
  return `https://wa.me/${WHATSAPP}${text ? "?text=" + encodeURIComponent(text) : ""}`;
}

/**
 * Applies a site-wide promotion to a product's price.
 *
 * mode "real"  → actually reduce the price by `percent` (real discount).
 *                Rs 1,500 at 50% → sells for Rs 750, shows Rs 1,500 struck.
 * mode "inflate" → keep the real selling price and show an inflated original
 *                so it reads as `percent`% OFF (marketing).
 *                Rs 1,500 at 50% → still sells for Rs 1,500, shows Rs 3,000 struck.
 *
 * Percent <= 0 returns the product unchanged.
 */
export function applyFlashSale(product, percent, mode = "real") {
  const pct = Number(percent) || 0;
  if (!product || pct <= 0 || !product.price) return product;
  if (mode === "inflate") {
    const inflated = Math.round((product.price / (1 - pct / 100)) / 10) * 10; // round to nearest 10
    return { ...product, wasPrice: inflated };
  }
  const discounted = Math.round(product.price * (1 - pct / 100));
  return { ...product, price: discounted, wasPrice: product.wasPrice || product.price };
}
