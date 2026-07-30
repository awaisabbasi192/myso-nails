import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rs, waLink, applyFlashSale } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import NewsletterForm from "@/components/NewsletterForm";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", title: "Choose your design", body: "Pick a ready set or send a screenshot of anything you have saved — I quote custom work on WhatsApp within an hour." },
  { n: "02", title: "Send your sizes", body: "Measure with the mm chart or order a free sizing kit. Every set is filed to your ten nails before it ships." },
  { n: "03", title: "Pay in advance", body: "Send the total on JazzCash and upload your screenshot — quick, secure and confirmed within 30 minutes." },
  { n: "04", title: "Press on, go out", body: "Sets arrive with glue tabs, a mini file and a prep wipe. Ten minutes at your dressing table." },
];
const GALLERY = ["/assets/p1-french.jpeg", "/assets/g1.jpeg", "/assets/p3-leopard.jpeg", "/assets/g2.jpeg", "/assets/p2-maroon.jpeg", "/assets/g3.jpeg"];
const TESTIMONIALS = [
  { quote: "Wore the maroon chrome set for my sister’s mayoun and three people asked which salon. Not one nail lifted in five days.", name: "Areeba K.", city: "Lahore", img: "/assets/p2-maroon.jpeg" },
  { quote: "Maya matched my custom bridal set to my dupatta from a photo. The gold rims are hand painted, I still cannot believe it.", name: "Hafsa N.", city: "Karachi", img: "/assets/p4-nude.jpeg" },
  { quote: "Ordered on WhatsApp at midnight, delivered in two days, and the sizing was exact. Third set already.", name: "Zoya R.", city: "Islamabad", img: "/assets/p3-leopard.jpeg" },
];

const label = { fontSize: 11, letterSpacing: ".4em", textTransform: "uppercase", color: "var(--rose)" };
const h2 = { fontFamily: "var(--serif)", fontWeight: 300, margin: 0 };

export default async function HomePage() {
  let content = null, products = [], categories = [];
  try {
    [content, products, categories] = await Promise.all([
      prisma.siteContent.findUnique({ where: { id: 1 } }),
      prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.category.findMany({ where: { showOnHome: true }, orderBy: { sortOrder: "asc" } }),
    ]);
  } catch (e) {
    console.error("HomePage fetch error:", e.message);
  }

  // Apply admin flash-sale discount to displayed prices
  const flashSalePercent = content?.flashSalePercent ?? 0;
  products = products.map((p) => applyFlashSale(p, flashSalePercent));

  const heroImage = content?.heroImage || "/assets/p1-french.jpeg";
  const heroHeadline = content?.heroHeadline || "Nails that finish the whole look.";
  const heroScript = content?.heroScript || "effortlessly luxe";
  const studioImage = content?.studioImage || "/assets/p4-nude.jpeg";
  const studioHeadline = content?.studioHeadline || "Every set is painted by hand — mine.";
  const studioBody1 = content?.studioBody1 || "I started M&S in my bedroom with one brush and a lamp, because brides kept asking for nails that would last past the mehndi. Four years later every set still leaves my table finished, filed and fitted to a real nail chart — never mass-moulded.";
  const studioBody2 = content?.studioBody2 || "If you can send me a photo of it, I can paint it.";
  const studioFounder = content?.studioFounder || "Maya";
  const studioRole = content?.studioRole || "Founder & nail artist";
  const heroProduct = products.find((p) => p.image === heroImage) || products[0];
  const bestSellers = products.slice(0, 4);

  // Instagram — real post embeds from admin-managed URLs
  const igHandle = content?.instagramHandle || "_myso.nails";
  let igPosts = [];
  try { igPosts = JSON.parse(content?.instagramPosts || "[]"); } catch { igPosts = []; }
  const igEmbeds = igPosts
    .map((u) => { const m = String(u).match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/); return m ? `https://www.instagram.com/p/${m[1]}/embed/captioned` : null; })
    .filter(Boolean)
    .slice(0, 6);

  // Hero product image block (rendered in two spots: right column on desktop, inline on mobile)
  const heroMediaInner = (
    <>
      <div className="hero-frame" style={{ position: "absolute", inset: 14, border: "1px solid var(--card-b)", borderRadius: 3, transform: "rotate(-2deg)" }} />
      <img src={heroImage} alt={heroProduct?.name} className="float hero-img" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 3, position: "relative", boxShadow: "0 40px 90px rgba(0,0,0,.35)" }} />
      {heroProduct && (
        <div className="hero-card" style={{ position: "absolute", bottom: 26, left: -26, background: "var(--panel)", backdropFilter: "blur(10px)", border: "1px solid var(--card-b)", padding: "16px 22px", borderRadius: 2 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--ink)" }}>{heroProduct.name}</div>
          <div style={{ fontSize: 12, letterSpacing: ".14em", color: "var(--rose)", marginTop: 5 }}>{rs(heroProduct.price)}</div>
        </div>
      )}
    </>
  );

  return (
    <div>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-text">
          <div className="rise hero-label" style={{ ...label }}>Best Seller · Almond Collection</div>
          <h1 className="rise hero-headline" style={{ fontFamily: "var(--serif)", fontWeight: 300, fontSize: "clamp(40px,5.6vw,82px)", lineHeight: 1.02, letterSpacing: "-.01em" }}>{heroHeadline}</h1>
          <div className="rise text-gradient hero-script" style={{ fontFamily: "var(--script)", fontSize: "clamp(32px,4vw,44px)" }}>{heroScript}</div>
          <p className="rise hero-para" style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(247,241,237,.62)", fontWeight: 300 }}>Hand-painted press-on sets, made to your exact nail size. Salon-grade shine in ten minutes — no appointment, no damage, no drying time.</p>
          {/* image shows here on mobile only */}
          <div className="rise-slow hero-media hero-media-mobile">{heroMediaInner}</div>
          <div className="rise hero-btns">
            <Link href="/shop" className="shimmer" style={{ padding: "17px 40px", fontSize: 12, letterSpacing: ".26em", textTransform: "uppercase", borderRadius: 2 }}>Shop the sets</Link>
            <a href={waLink("Hi M&S! I want to order a custom set")} target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: "17px 34px", fontSize: 12, letterSpacing: ".26em", textTransform: "uppercase", borderRadius: 2 }}>Order on WhatsApp</a>
          </div>
          <div className="rise hero-stats">
            {[["4.9", "1,200+ reviews"], ["10 min", "Application"], ["3 weeks", "Wear time"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--rose-light)" }}>{v}</div>
                <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(247,241,237,.45)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* image on the right on desktop only */}
        <div className="rise-slow hero-media hero-media-desktop">{heroMediaInner}</div>
      </section>

      {/* TRUST STRIP — scrolling marquee on all sizes */}
      <div style={{ borderTop: "1px solid var(--card-b)", borderBottom: "1px solid var(--card-b)", background: "var(--panel)", padding: "13px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "announceScroll 22s linear infinite", width: "max-content" }}>
          {[...["FREE SIZING KIT", "NATIONWIDE DELIVERY", "HAND-PAINTED BY HAND", "REUSABLE 15+ TIMES", "100% ADVANCE — JAZZCASH", "WHATSAPP SUPPORT"],
            ...["FREE SIZING KIT", "NATIONWIDE DELIVERY", "HAND-PAINTED BY HAND", "REUSABLE 15+ TIMES", "100% ADVANCE — JAZZCASH", "WHATSAPP SUPPORT"]
          ].map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", fontSize: 10, letterSpacing: ".22em", color: "var(--rose)", padding: "0 22px", whiteSpace: "nowrap" }}>
              {t}<span style={{ marginLeft: 22, color: "var(--card-b)", fontSize: 16 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="scroll-reveal" style={{ maxWidth: 1240, margin: "0 auto", padding: "70px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 38, flexWrap: "wrap" }}>
          <div>
            <div style={{ ...label, marginBottom: 14 }}>Shop by category</div>
            <h2 style={{ ...h2, fontSize: 42 }}>Find your finish</h2>
          </div>
          <Link href="/shop" style={{ fontSize: 11.5, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--rose)", borderBottom: "1px solid var(--rose)", paddingBottom: 5 }}>View all {categories.length} collections</Link>
        </div>
        <div className="home-cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop?cat=${cat.slug}`} className="card-soft zoom-wrap home-cat-card" style={{ position: "relative", aspectRatio: "3/4", borderRadius: 2, overflow: "hidden", background: "#121214", display: "block" }}>
              <img src={cat.image} alt={cat.name} className="zoom" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.62 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,10,11,.9) 5%,transparent 65%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16 }}>
                <div className="home-cat-name" style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.15, color: "var(--ink)" }}>{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="scroll-reveal" style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ ...label, marginBottom: 14 }}>Best sellers</div>
          <h2 style={{ ...h2, fontSize: 44 }}>The four everyone orders</h2>
        </div>
        <div className="home-bestseller-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 22 }}>
          {bestSellers.map((p) => (
            <ProductCard key={p.id} p={{ slug: p.slug, name: p.name, image: p.image, price: p.price, wasPrice: p.wasPrice, shape: p.shape, finish: p.finish, rating: p.rating, reviewsCount: p.reviewsCount, badge: p.badge }} />
          ))}
        </div>
      </section>

      {/* STUDIO */}
      <section style={{ background: "var(--panel)", borderTop: "1px solid var(--card-b)", borderBottom: "1px solid var(--card-b)" }}>
        <div data-r="split" style={{ maxWidth: 1240, margin: "0 auto", padding: "90px 24px", display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 70, alignItems: "center" }}>
          <div className="reveal-left" style={{ position: "relative" }}>
            <img src={studioImage} alt="Studio" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 3 }} />
            <div style={{ position: "absolute", inset: -14, border: "1px solid var(--card-b)", borderRadius: 3, pointerEvents: "none" }} />
          </div>
          <div>
            <div style={{ ...label, marginBottom: 20 }}>The studio</div>
            <h2 style={{ ...h2, fontSize: 46, lineHeight: 1.15, marginBottom: 24 }}>{studioHeadline}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.6)", fontWeight: 300, maxWidth: 520 }}>{studioBody1}</p>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "rgba(247,241,237,.6)", fontWeight: 300, maxWidth: 520 }}>{studioBody2}</p>
            <div style={{ fontFamily: "var(--script)", fontSize: 38, color: "var(--rose)", marginTop: 26 }}>{studioFounder}</div>
            <div style={{ fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(247,241,237,.42)" }}>{studioRole}</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="scroll-reveal" style={{ maxWidth: 1240, margin: "0 auto", padding: "88px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={label}>How it works</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ borderTop: "1px solid var(--card-b)", paddingTop: 22 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--bronze)", letterSpacing: ".3em" }}>{s.n}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 26, margin: "12px 0 10px" }}>{s.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.8, color: "rgba(247,241,237,.55)", fontWeight: 300 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section style={{ padding: "20px 24px 80px", maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ ...h2, fontSize: 36 }}>On Instagram</h2>
          <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, letterSpacing: ".24em", textTransform: "uppercase" }}>@{igHandle}</a>
        </div>
        {igEmbeds.length > 0 ? (
          <div className="ig-embed-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
            {igEmbeds.map((src, i) => (
              <div key={i} style={{ background: "#000", borderRadius: 2, overflow: "hidden", border: "1px solid rgba(227,183,166,.14)" }}>
                <iframe src={src} title={`Instagram post ${i + 1}`} loading="lazy" scrolling="no" allowtransparency="true" style={{ width: "100%", height: 540, border: 0, display: "block" }} />
              </div>
            ))}
          </div>
        ) : (
          <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", padding: "60px 24px", border: "1px dashed var(--card-b)", borderRadius: 3, background: "var(--panel)" }}>
            <div style={{ fontSize: 40 }}>📸</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: "var(--ink)" }}>See our latest work on Instagram</div>
            <div style={{ fontSize: 13.5, color: "rgba(247,241,237,.5)", maxWidth: 420, lineHeight: 1.7 }}>Fresh sets, bridal reveals and behind-the-scenes — all on our feed.</div>
            <div className="gradient-warm" style={{ marginTop: 8, padding: "13px 28px", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase" }}>Follow @{igHandle}</div>
          </a>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: "var(--panel)", borderTop: "1px solid var(--card-b)", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <h2 style={{ ...h2, fontSize: 42, marginBottom: 44, textAlign: "center" }}>Loved in Lahore, Karachi &amp; beyond</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 22 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ border: "1px solid var(--card-b)", padding: 32, borderRadius: 2, background: "var(--bg)" }}>
                <div style={{ color: "var(--bronze)", letterSpacing: ".28em", fontSize: 13 }}>★★★★★</div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.6, fontStyle: "italic", color: "rgba(247,241,237,.86)", margin: "18px 0 24px" }}>“{t.quote}”</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={t.img} alt={t.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontSize: 13 }}>{t.name}</div>
                    <div style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(247,241,237,.4)", marginTop: 3 }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="scroll-reveal" style={{ padding: "90px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ ...label, marginBottom: 18 }}>Get 10% off your first set</div>
          <h2 style={{ ...h2, fontSize: 40, marginBottom: 26 }}>Join the M&amp;S list</h2>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
