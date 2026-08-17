import { prisma } from "@/lib/prisma";
import { applyFlashSale } from "@/lib/format";
import { getActiveDeal } from "@/lib/deal";
import WishlistClient from "@/components/WishlistClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Wishlist — Myso Nails Studio",
  description: "Your saved press-on nail sets.",
};

export default async function WishlistPage() {
  let products = [];
  try {
    const [prods, deal] = await Promise.all([
      prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
      getActiveDeal(),
    ]);
    products = prods.map((p) =>
      applyFlashSale(
        {
          slug: p.slug, name: p.name, image: p.image, price: p.price, wasPrice: p.wasPrice,
          shape: p.shape, finish: p.finish, rating: p.rating, reviewsCount: p.reviewsCount,
          badge: p.badge, stock: p.stock,
        },
        deal.percent,
        deal.mode
      )
    );
  } catch (e) {
    console.error("Wishlist page error:", e.message);
  }

  return <WishlistClient products={products} />;
}
