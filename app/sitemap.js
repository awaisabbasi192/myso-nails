import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysonails.store";

export default async function sitemap() {
  const staticPages = [
    { url: baseUrl, changefreq: "weekly", priority: 1.0 },
    { url: `${baseUrl}/shop`, changefreq: "daily", priority: 0.9 },
    { url: `${baseUrl}/bridal`, changefreq: "weekly", priority: 0.8 },
    { url: `${baseUrl}/custom`, changefreq: "weekly", priority: 0.7 },
    { url: `${baseUrl}/gift-cards`, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/size-guide`, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, changefreq: "monthly", priority: 0.5 },
  ];

  // Product pages — queried directly from the database
  try {
    const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });
    const productPages = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changefreq: "weekly",
      priority: 0.7,
    }));
    return [...staticPages, ...productPages];
  } catch (e) {
    console.warn("Sitemap: could not load products:", e.message);
    return staticPages;
  }
}
