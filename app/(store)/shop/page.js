import { prisma } from "@/lib/prisma";
import { applyFlashSale } from "@/lib/format";
import { getActiveDeal } from "@/lib/deal";
import ShopClient from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop all sets — Myso Nails Studio",
  description: "Browse hand-painted press-on nail sets. Bridal, party and everyday styles, sized to your nails. Shipped nationwide from Lahore.",
  openGraph: { title: "Shop all sets — Myso Nails Studio", description: "Hand-painted press-on nails sized to you. Free delivery over Rs 5,000." },
};

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const cat = typeof sp?.cat === "string" ? sp.cat : null;
  const q = typeof sp?.q === "string" ? sp.q : "";

  const [products, deal] = await Promise.all([
    prisma.product.findMany({ orderBy: { sortOrder: "asc" }, include: { category: true } }),
    getActiveDeal(),
  ]);

  const plain = products.map((p) => applyFlashSale({
    slug: p.slug, name: p.name, image: p.image, price: p.price, wasPrice: p.wasPrice,
    shape: p.shape, finish: p.finish, occasion: p.occasion, length: p.length,
    colorway: p.colorway, blurb: p.blurb, rating: p.rating, reviewsCount: p.reviewsCount,
    stock: p.stock, sortOrder: p.sortOrder, categorySlug: p.category?.slug || null,
  }, deal.percent, deal.mode));

  return <ShopClient products={plain} initialCat={cat} initialSearch={q} />;
}
