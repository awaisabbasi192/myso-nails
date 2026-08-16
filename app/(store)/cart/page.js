import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CartCheckout from "@/components/CartCheckout";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await getCurrentUser();
  let prefill = null;
  if (user) {
    const [addr, customer] = await Promise.all([
      prisma.address.findFirst({ where: { customerId: user.id, isDefault: true } }),
      prisma.customer.findUnique({ where: { id: user.id }, select: { nailSizes: true, points: true } }),
    ]);
    prefill = {
      name: user.name,
      phone: user.phone || addr?.phone || "",
      address: addr?.line1 || "",
      city: user.city || addr?.city || "",
      nailSizes: customer?.nailSizes || "",
      points: customer?.points || 0,
      userId: user.id,
    };
  }
  return <CartCheckout prefill={prefill} />;
}
