const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysonails.com";

export default async function sitemap() {
  const staticPages = [
    { url: baseUrl, changefreq: "weekly", priority: 1.0 },
    { url: `${baseUrl}/shop`, changefreq: "daily", priority: 0.9 },
    { url: `${baseUrl}/bridal`, changefreq: "weekly", priority: 0.8 },
    { url: `${baseUrl}/custom`, changefreq: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/size-guide`, changefreq: "monthly", priority: 0.6 },
  ];

  // Fetch products for dynamic URLs (if needed in future)
  try {
    const res = await fetch(`${baseUrl}/api/products`, { cache: "force-cache" });
    if (res.ok) {
      const products = await res.json();
      const productPages = products.map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        changefreq: "weekly",
        priority: 0.7,
      }));
      return [...staticPages, ...productPages];
    }
  } catch (e) {
    console.warn("Could not fetch products for sitemap:", e.message);
  }

  return staticPages;
}
