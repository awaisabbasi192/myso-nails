/* Seed the database with Myso Nails Studio's real starting data.
   Everything here is editable later from the admin panel. */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Myso Nails Studio…");

  // Wipe (order matters for FKs)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.message.deleteMany();
  await prisma.siteContent.deleteMany();

  // ---- Categories ----
  const cats = [
    { name: "French Tips", slug: "french-tips", image: "/assets/p1-french.jpeg", sortOrder: 1 },
    { name: "Chrome", slug: "chrome", image: "/assets/p2-maroon.jpeg", sortOrder: 2 },
    { name: "Glitter", slug: "glitter", image: "/assets/p1-french.jpeg", sortOrder: 3 },
    { name: "Matte", slug: "matte", image: "/assets/p4-nude.jpeg", sortOrder: 4 },
    { name: "Animal Print", slug: "animal-print", image: "/assets/p3-leopard.jpeg", sortOrder: 5 },
    { name: "Custom Bridal", slug: "custom-bridal", image: "/assets/p4-nude.jpeg", sortOrder: 6 },
    { name: "Seasonal", slug: "seasonal", image: "/assets/p2-maroon.jpeg", sortOrder: 7 },
  ];
  const catByName = {};
  for (const c of cats) {
    const created = await prisma.category.create({ data: c });
    catByName[c.name] = created.id;
  }

  // ---- Products ----
  const products = [
    {
      slug: "rose-gold-french", name: "Rose Gold French", image: "/assets/p1-french.jpeg",
      price: 2800, wasPrice: 3400, shape: "Almond", finish: "Glitter French", occasion: "Bridal",
      length: "Medium", badge: "Best seller", colorway: "Nude · White · Rose gold", rating: 4.9,
      reviewsCount: 214, stock: 18, featured: true, sortOrder: 1, categoryId: catByName["French Tips"],
      blurb: "A milk-white French tip traced with a fine line of rose-gold glitter over a warm nude base. The set that started the studio.",
      reviews: [
        { name: "Mahira S.", rating: 5, body: "Sizing was perfect straight off the chart and the glitter line is so neat it looks like gel work. Got compliments all week.", image: "/assets/p1-french.jpeg", image2: "/assets/p4-nude.jpeg" },
        { name: "Iqra A.", rating: 5, body: "Ordered for my walima, Maya sent progress photos on WhatsApp. Nails survived two days of pictures and a lot of hand-holding.", image: "/assets/p1-french.jpeg", image2: "/assets/p2-maroon.jpeg" },
        { name: "Sana T.", rating: 4, body: "Beautiful finish, thumb was slightly wide for me but they replaced it free. Packaging is so pretty I kept the box.", image: "/assets/p1-french.jpeg", image2: "/assets/p3-leopard.jpeg" },
      ],
    },
    {
      slug: "maroon-chrome-swirl", name: "Maroon Chrome Swirl", image: "/assets/p2-maroon.jpeg",
      price: 3200, wasPrice: 3800, shape: "Almond", finish: "Chrome", occasion: "Party",
      length: "Medium", badge: "New", colorway: "Oxblood · Gold chrome", rating: 4.8,
      reviewsCount: 96, stock: 11, featured: false, sortOrder: 2, categoryId: catByName["Chrome"],
      blurb: "Deep oxblood diagonals with a liquid gold chrome swirl painted freehand on every nail. Wedding-season favourite.",
      reviews: [
        { name: "Areeba K.", rating: 5, body: "Wore this for my sister's mayoun and three people asked which salon. Not one nail lifted in five days.", image: "/assets/p2-maroon.jpeg", image2: "/assets/p1-french.jpeg" },
      ],
    },
    {
      slug: "cocoa-leopard", name: "Cocoa Leopard", image: "/assets/p3-leopard.jpeg",
      price: 3400, wasPrice: 3900, shape: "Almond", finish: "Glossy", occasion: "Party",
      length: "Long", badge: "Limited", colorway: "Cocoa · Leopard · Gold beads", rating: 4.9,
      reviewsCount: 141, stock: 2, featured: false, sortOrder: 3, categoryId: catByName["Animal Print"],
      blurb: "Hand-spotted leopard print in three browns, with two accent nails beaded in tiny gold caviar pearls.",
      reviews: [
        { name: "Zoya R.", rating: 5, body: "Ordered on WhatsApp at midnight, delivered in two days, and the sizing was exact. Third set already.", image: "/assets/p3-leopard.jpeg", image2: "/assets/p4-nude.jpeg" },
      ],
    },
    {
      slug: "pearl-bloom-nude", name: "Pearl Bloom Nude", image: "/assets/p4-nude.jpeg",
      price: 3600, wasPrice: 4200, shape: "Almond", finish: "Matte + gloss", occasion: "Bridal",
      length: "Long", badge: "Bridal pick", colorway: "Mauve · Butter · Gold rim", rating: 5.0,
      reviewsCount: 78, stock: 6, featured: true, sortOrder: 4, categoryId: catByName["Custom Bridal"],
      blurb: "Mauve and butter-cream nails with painted 3D florals, gold-rimmed edges and micro flower charms. Made for nikkah day.",
      reviews: [
        { name: "Hafsa N.", rating: 5, body: "Maya matched my custom bridal set to my dupatta from a photo. The gold rims are hand painted, I still cannot believe it.", image: "/assets/p4-nude.jpeg", image2: "/assets/p1-french.jpeg" },
      ],
    },
    {
      slug: "scarlet-rose", name: "Scarlet Rose", image: "/assets/myso-red-rose.jpeg", images: JSON.stringify(["/assets/myso-red-rose.jpeg"]),
      price: 3600, wasPrice: 4200, shape: "Almond", finish: "Cat-eye", occasion: "Bridal", length: "Long",
      badge: "New", colorway: "Scarlet · Deep red · Gold rose", rating: 5, reviewsCount: 7, stock: 8, featured: true, sortOrder: 5, categoryId: catByName["Custom Bridal"],
      blurb: "A show-stopping bridal set — molten red cat-eye shimmer paired with hand-sculpted 3D gold roses and marbled nude accents. Made for the main event.",
      reviews: [],
    },
    {
      slug: "crystal-bow", name: "Crystal Bow", image: "/assets/myso-nude-bow.jpeg", images: JSON.stringify(["/assets/myso-nude-bow.jpeg"]),
      price: 3200, wasPrice: null, shape: "Square", finish: "Glossy", occasion: "Party", length: "Short",
      badge: null, colorway: "Nude · Milky white · Silver crystals", rating: 5, reviewsCount: 4, stock: 10, featured: false, sortOrder: 6, categoryId: catByName["French Tips"],
      blurb: "Dainty and dazzling. Soft nude French finished with a delicate line of silver rhinestones and a sparkling crystal bow on the accent nail.",
      reviews: [],
    },
    {
      slug: "wild-cocoa", name: "Wild Cocoa", image: "/assets/myso-leopard.jpeg", images: JSON.stringify(["/assets/myso-leopard.jpeg"]),
      price: 2900, wasPrice: null, shape: "Almond", finish: "Glossy", occasion: "Everyday", length: "Medium",
      badge: "Best seller", colorway: "Cocoa · Caramel · Gold leopard", rating: 5, reviewsCount: 12, stock: 10, featured: true, sortOrder: 7, categoryId: catByName["Animal Print"],
      blurb: "Everyday luxe. Warm cocoa and caramel leopard print with a slim gold chain accent — neutral enough for work, bold enough for brunch.",
      reviews: [],
    },
    {
      slug: "blush-petal", name: "Blush Petal", image: "/assets/myso-blush-floral.jpeg", images: JSON.stringify(["/assets/myso-blush-floral.jpeg"]),
      price: 3000, wasPrice: null, shape: "Almond", finish: "Glossy", occasion: "Everyday", length: "Medium",
      badge: null, colorway: "Blush · Milky pink · White florals", rating: 5, reviewsCount: 6, stock: 10, featured: false, sortOrder: 8, categoryId: catByName["French Tips"],
      blurb: "Soft, romantic and barely-there. A milky blush base with a whisper-thin French edge and tiny hand-painted white daisies. Bridal-shower ready.",
      reviews: [],
    },
    {
      slug: "merlot-french", name: "Merlot French", image: "/assets/myso-maroon-french.jpeg", images: JSON.stringify(["/assets/myso-maroon-french.jpeg"]),
      price: 3300, wasPrice: 3800, shape: "Almond", finish: "Glossy", occasion: "Party", length: "Medium",
      badge: null, colorway: "Merlot · Burgundy · Gold foil", rating: 5, reviewsCount: 5, stock: 9, featured: false, sortOrder: 9, categoryId: catByName["French Tips"],
      blurb: "A modern twist on the classic French — deep merlot tips over a nude base, finished with a hand-drawn gold foil line. Rich, glossy, timeless.",
      reviews: [],
    },
    {
      slug: "golden-hour", name: "Golden Hour", image: "/assets/myso-gold-glam.jpeg", images: JSON.stringify(["/assets/myso-gold-glam.jpeg"]),
      price: 3800, wasPrice: 4400, shape: "Almond", finish: "Glitter", occasion: "Bridal", length: "Long",
      badge: "Limited", colorway: "Champagne gold · Pearl · Crystal", rating: 5, reviewsCount: 9, stock: 6, featured: true, sortOrder: 10, categoryId: catByName["Glitter"],
      blurb: "Pure glamour. Champagne gold glitter loaded with pearls, crystals and a 3D gold bow charm. The set brides save to their inspo board.",
      reviews: [],
    },
  ];

  const prodBySlug = {};
  for (const p of products) {
    const { reviews, ...data } = p;
    const created = await prisma.product.create({
      data: { ...data, reviews: { create: reviews } },
    });
    prodBySlug[p.slug] = created;
  }

  // ---- Customers ----
  const adminPass = await bcrypt.hash("miso786", 10);
  const demoPass = await bcrypt.hash("password", 10);

  await prisma.customer.create({
    data: { name: "Maya Iqbal", email: "admin@mysonails.pk", phone: "0302 090 9786", password: adminPass, role: "admin", city: "Lahore" },
  });

  const areeba = await prisma.customer.create({
    data: {
      name: "Areeba Khan", email: "areeba.k@gmail.com", phone: "0300 1234567", password: demoPass, role: "customer", city: "Lahore",
      addresses: {
        create: [
          { label: "Home", line1: "House 24, Street 8, DHA Phase 5", line2: "Lahore, 54000", city: "Lahore", phone: "0300 1234567", isDefault: true },
          { label: "Office", line1: "Arfa Tower, 4th floor, Ferozepur Road", line2: "Lahore, 54600", city: "Lahore", phone: "0300 1234567", isDefault: false },
        ],
      },
    },
  });

  const otherCustomers = [
    { name: "Hafsa Nadeem", email: "hafsa.n@gmail.com", phone: "0321 9988776", city: "Karachi" },
    { name: "Zoya Riaz", email: "zoya.r@gmail.com", phone: "0345 4567890", city: "Islamabad" },
    { name: "Mahira Saeed", email: "mahira.s@gmail.com", phone: "0333 1122334", city: "Multan" },
    { name: "Iqra Aslam", email: "iqra.a@gmail.com", phone: "0302 7766554", city: "Lahore" },
  ];
  const custByName = { "Areeba Khan": areeba };
  for (const c of otherCustomers) {
    const created = await prisma.customer.create({ data: { ...c, password: demoPass, role: "customer" } });
    custByName[c.name] = created;
  }

  // ---- Orders ----
  function orderItem(slug, size, qty) {
    const p = prodBySlug[slug];
    return { productId: p.id, name: p.name, image: p.image, size, unitPrice: p.price, qty };
  }

  const orders = [
    { code: "MS-2609", cust: "Areeba Khan", city: "Lahore", phone: "0300 1234567", address: "House 24, Street 8, DHA Phase 5", status: "Pending", payment: "jazzcash", sub: 3200, ship: 0, date: "2026-07-27T21:41:00", proof: "/assets/g2.jpeg", items: [orderItem("maroon-chrome-swirl", "Medium set", 1)] },
    { code: "MS-2608", cust: "Hafsa Nadeem", city: "Karachi", phone: "0321 9988776", address: "Block 5, Clifton", status: "Pending", payment: "jazzcash", sub: 3600, ship: 0, date: "2026-07-27T20:10:00", proof: "/assets/g3.jpeg", items: [orderItem("pearl-bloom-nude", "Long set", 1)] },
    { code: "MS-2607", cust: "Zoya Riaz", city: "Islamabad", phone: "0345 4567890", address: "F-7 Markaz", status: "Confirmed", payment: "jazzcash", sub: 6800, ship: 0, date: "2026-07-26T15:00:00", proof: "/assets/g4.jpeg", items: [orderItem("cocoa-leopard", "Long set", 2)] },
    { code: "MS-2606", cust: "Mahira Saeed", city: "Multan", phone: "0333 1122334", address: "Cantt, Multan", status: "Pending", payment: "cod", sub: 2800, ship: 250, date: "2026-07-26T11:00:00", proof: null, items: [orderItem("rose-gold-french", "Medium set", 1)] },
    { code: "MS-2605", cust: "Iqra Aslam", city: "Lahore", phone: "0302 7766554", address: "Johar Town", status: "Shipped", payment: "jazzcash", sub: 5400, ship: 0, date: "2026-07-24T18:00:00", proof: "/assets/g5.jpeg", items: [{ productId: null, name: "Custom Bridal Set", image: "/assets/p4-nude.jpeg", size: "Custom sizes", unitPrice: 5400, qty: 1 }] },
    { code: "MS-2571", cust: "Areeba Khan", city: "Lahore", phone: "0300 1234567", address: "House 24, Street 8, DHA Phase 5", status: "Shipped", payment: "jazzcash", sub: 3600, ship: 0, date: "2026-07-14T12:00:00", proof: "/assets/g1.jpeg", items: [orderItem("pearl-bloom-nude", "Long set", 1)] },
    { code: "MS-2498", cust: "Areeba Khan", city: "Lahore", phone: "0300 1234567", address: "House 24, Street 8, DHA Phase 5", status: "Delivered", payment: "jazzcash", sub: 2800, ship: 0, date: "2026-06-02T12:00:00", proof: "/assets/g1.jpeg", items: [orderItem("rose-gold-french", "Medium set", 1)] },
  ];

  for (const o of orders) {
    const c = custByName[o.cust];
    await prisma.order.create({
      data: {
        code: o.code, customerId: c ? c.id : null, customerName: o.cust, phone: o.phone,
        address: o.address, city: o.city, status: o.status, paymentMethod: o.payment,
        paymentProof: o.proof, subtotal: o.sub, shipping: o.ship, total: o.sub + o.ship,
        createdAt: new Date(o.date), items: { create: o.items },
      },
    });
  }

  // ---- Coupons ----
  await prisma.coupon.createMany({
    data: [
      { code: "FIRST10", type: "percentage", value: 10, minSpend: 0, detail: "10% off your first order · no expiry", active: true, usedCount: 318 },
      { code: "EID10", type: "flat", value: 500, minSpend: 4000, detail: "Rs 500 off over Rs 4,000", expiresAt: new Date("2026-07-29"), active: true, usedCount: 62 },
      { code: "BRIDE15", type: "percentage", value: 15, minSpend: 0, detail: "15% off custom bridal", expiresAt: new Date("2026-12-31"), active: true, usedCount: 0 },
      { code: "WINTER5", type: "percentage", value: 5, minSpend: 0, detail: "5% off everything · ended 28 Feb", expiresAt: new Date("2026-02-28"), active: false, usedCount: 0 },
    ],
  });

  // ---- Site content ----
  await prisma.siteContent.create({
    data: {
      id: 1,
      heroHeadline: "Nails that finish the whole look.",
      heroScript: "effortlessly luxe",
      heroImage: "/assets/p1-french.jpeg",
      announcement: "Free delivery over Rs 5,000 · Handmade in Pakistan · Order on WhatsApp 0302 090 9786",
    },
  });

  console.log("Seed complete ✓");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
