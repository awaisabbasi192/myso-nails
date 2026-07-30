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
 * Applies a site-wide flash-sale percentage to a product's price.
 * Returns a new object with the discounted `price`; keeps (or sets) `wasPrice`
 * so the original strikes through. Percent <= 0 returns the product unchanged.
 */
export function applyFlashSale(product, percent) {
  const pct = Number(percent) || 0;
  if (!product || pct <= 0 || !product.price) return product;
  const discounted = Math.round(product.price * (1 - pct / 100));
  return { ...product, price: discounted, wasPrice: product.wasPrice || product.price };
}
