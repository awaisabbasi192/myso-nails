import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const NEW_PRODUCTS = [
  {
    name: "Scarlet Rose", image: "/assets/myso-red-rose.jpeg",
    price: 3600, wasPrice: 4200, shape: "Almond", finish: "Cat-eye", occasion: "Bridal", length: "Long",
    badge: "New", colorway: "Scarlet · Deep red · Gold rose",
    blurb: "A show-stopping bridal set — molten red cat-eye shimmer paired with hand-sculpted 3D gold roses and marbled nude accents. Made for the main event.",
    rating: 5, reviewsCount: 7, stock: 8, featured: true,
  },
  {
    name: "Crystal Bow", image: "/assets/myso-nude-bow.jpeg",
    price: 3200, wasPrice: null, shape: "Square", finish: "Glossy", occasion: "Party", length: "Short",
    badge: null, colorway: "Nude · Milky white · Silver crystals",
    blurb: "Dainty and dazzling. Soft nude French finished with a delicate line of silver rhinestones and a sparkling crystal bow on the accent nail.",
    rating: 5, reviewsCount: 4, stock: 10, featured: false,
  },
  {
    name: "Wild Cocoa", image: "/assets/myso-leopard.jpeg",
    price: 2900, wasPrice: null, shape: "Almond", finish: "Glossy", occasion: "Everyday", length: "Medium",
    badge: "Best seller", colorway: "Cocoa · Caramel · Gold leopard",
    blurb: "Everyday luxe. Warm cocoa and caramel leopard print with a slim gold chain accent — neutral enough for work, bold enough for brunch.",
    rating: 5, reviewsCount: 12, stock: 10, featured: true,
  },
  {
    name: "Blush Petal", image: "/assets/myso-blush-floral.jpeg",
    price: 3000, wasPrice: null, shape: "Almond", finish: "Glossy", occasion: "Everyday", length: "Medium",
    badge: null, colorway: "Blush · Milky pink · White florals",
    blurb: "Soft, romantic and barely-there. A milky blush base with a whisper-thin French edge and tiny hand-painted white daisies. Bridal-shower ready.",
    rating: 5, reviewsCount: 6, stock: 10, featured: false,
  },
  {
    name: "Merlot French", image: "/assets/myso-maroon-french.jpeg",
    price: 3300, wasPrice: 3800, shape: "Almond", finish: "Glossy", occasion: "Party", length: "Medium",
    badge: null, colorway: "Merlot · Burgundy · Gold foil",
    blurb: "A modern twist on the classic French — deep merlot tips over a nude base, finished with a hand-drawn gold foil line. Rich, glossy, timeless.",
    rating: 5, reviewsCount: 5, stock: 9, featured: false,
  },
  {
    name: "Golden Hour", image: "/assets/myso-gold-glam.jpeg",
    price: 3800, wasPrice: 4400, shape: "Almond", finish: "Glitter", occasion: "Bridal", length: "Long",
    badge: "Limited", colorway: "Champagne gold · Pearl · Crystal",
    blurb: "Pure glamour. Champagne gold glitter loaded with pearls, crystals and a 3D gold bow charm. The set brides save to their inspo board.",
    rating: 5, reviewsCount: 9, stock: 6, featured: true,
  },
];

async function main() {
  // 1) Update live site content: Miso -> Myso across all text fields
  const content = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (content) {
    const data = {};
    for (const [k, v] of Object.entries(content)) {
      if (typeof v === "string" && v.includes("Miso")) data[k] = v.replaceAll("Miso", "Myso");
    }
    if (Object.keys(data).length) {
      await prisma.siteContent.update({ where: { id: 1 }, data });
      console.log("Updated SiteContent fields:", Object.keys(data).join(", "));
    } else {
      console.log("No 'Miso' text found in SiteContent.");
    }
  }

  // 2) Add the new products (skip if slug already exists)
  const count = await prisma.product.count();
  let added = 0;
  for (let i = 0; i < NEW_PRODUCTS.length; i++) {
    const p = NEW_PRODUCTS[i];
    let slug = slugify(p.name);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) { console.log(`Skipped (exists): ${p.name}`); continue; }
    await prisma.product.create({
      data: {
        slug,
        name: p.name,
        image: p.image,
        images: JSON.stringify([p.image]),
        price: p.price,
        wasPrice: p.wasPrice,
        shape: p.shape,
        finish: p.finish,
        occasion: p.occasion,
        length: p.length,
        badge: p.badge,
        colorway: p.colorway,
        blurb: p.blurb,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        stock: p.stock,
        featured: p.featured,
        sortOrder: count + i + 1,
      },
    });
    added++;
    console.log(`Added: ${p.name} (${slug})`);
  }
  console.log(`\nDone. ${added} product(s) added.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
