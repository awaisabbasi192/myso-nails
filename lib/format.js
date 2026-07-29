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
