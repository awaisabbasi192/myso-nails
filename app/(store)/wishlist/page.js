import { prisma } from "@/lib/prisma";
import { applyFlashSale } from "@/lib/format";
import WishlistClient from "@/components/WishlistClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Wishlist — Myso Nails Studio",
  description: "Your saved press-on nail sets.",
};

export default async function WishlistPage() {
  let products = [];
  try {
    const [prods, content] = await Promise.all([
      prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.siteContent.findUnique({ where: { id: 1 }, select: { flashSalePercent: true } }),
    ]);
    const flashSalePercent = content?.flashSalePercent ?? 0;
    products = prods.map((p) =>
      applyFlashSale(
        {
          slug: p.slug, name: p.name, image: p.image, price: p.price, wasPrice: p.wasPrice,
          shape: p.shape, finish: p.finish, rating: p.rating, reviewsCount: p.reviewsCount,
          badge: p.badge, stock: p.stock,
        },
        flashSalePercent
      )
    );
  } catch (e) {
    console.error("Wishlist page error:", e.message);
  }

  return <WishlistClient products={products} />;
}
