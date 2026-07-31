import { prisma } from "@/lib/prisma";
import DropsClient from "@/components/DropsClient";

export const revalidate = 60;

export default async function DropsPage() {
  const drops = await prisma.drop.findMany({ where: { active: true }, orderBy: { launchAt: "asc" } });
  return <DropsClient drops={drops.map((d) => ({ ...d, launchAt: d.launchAt.toISOString() }))} />;
}
