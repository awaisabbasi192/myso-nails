import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { applyFlashSale } from "@/lib/format";
import { getActiveDeal } from "@/lib/deal";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, blurb: true, image: true, price: true } });
  if (!product) return {};
  return {
    title: `${product.name} — Myso Nails Studio`,
    description: product.blurb?.slice(0, 160) || `Hand-painted press-on nail set — ${product.name}. Rs ${product.price}.`,
    openGraph: { title: product.name, description: product.blurb?.slice(0, 160), images: [product.image] },
  };
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { reviews: { where: { verified: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!product) notFound();

  const [relatedRaw, deal] = await Promise.all([
    prisma.product.findMany({ where: { slug: { not: slug } }, orderBy: { sortOrder: "asc" }, take: 3 }),
    getActiveDeal(),
  ]);

  const plain = applyFlashSale({
    id: product.id, slug: product.slug, name: product.name, image: product.image, images: product.images,
    price: product.price, wasPrice: product.wasPrice, shape: product.shape, finish: product.finish,
    occasion: product.occasion, length: product.length, badge: product.badge, colorway: product.colorway,
    blurb: product.blurb, rating: product.rating, reviewsCount: product.reviewsCount, stock: product.stock,
  }, deal.percent);
  const reviews = product.reviews.map((r) => ({
    id: r.id, name: r.name, rating: r.rating, body: r.body, image: r.image, image2: r.image2, date: fmtDate(r.createdAt),
  }));
  const related = relatedRaw.map((p) => applyFlashSale({ slug: p.slug, name: p.name, image: p.image, price: p.price, wasPrice: p.wasPrice }, deal.percent));

  return <ProductDetail product={plain} reviews={reviews} related={related} />;
}
