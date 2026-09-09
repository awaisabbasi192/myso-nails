import { Cormorant_Garamond, Jost, Parisienne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { CartProvider } from "@/components/CartContext";
import ScrollReveal from "@/components/ScrollReveal";
import Toast from "@/components/Toast";
import PageChrome from "@/components/PageChrome";

const PALETTES = ["blush", "mono", "emerald", "midnight", "rose"];

/** Admin-chosen site palette. Falls back to blush if the DB is unreachable. */
async function getSitePalette() {
  try {
    const c = await prisma.siteContent.findUnique({ where: { id: 1 }, select: { sitePalette: true } });
    return PALETTES.includes(c?.sitePalette) ? c.sitePalette : "blush";
  } catch {
    return "blush";
  }
}

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});
const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pressonsbymyra.pk"),
  title: {
    default: "Press-Ons by Myra — Hand-painted press-on nails, handmade with love",
    template: "%s — Press-Ons by Myra",
  },
  description:
    "Hand-painted press-on nail sets, custom bridal work and size-fitted reusable sets. Handmade with love, shipped nationwide from Lahore.",
  keywords: [
    "press on nails Pakistan", "press-ons by Myra", "bridal nails Lahore",
    "custom press on nails", "reusable nail sets", "hand painted nails Pakistan",
  ],
  appleWebApp: { capable: true, title: "Press-Ons by Myra", statusBarStyle: "default" },
  icons: { icon: "/assets/logo-myra.jpeg", apple: "/assets/logo-myra.jpeg" },
  openGraph: {
    type: "website",
    siteName: "Press-Ons by Myra",
    title: "Press-Ons by Myra — Handmade with love",
    description: "Hand-painted press-on nail sets, sized to your nails. Shipped nationwide from Lahore.",
    images: ["/assets/logo-myra.jpeg"],
  },
};

export const viewport = {
  themeColor: "#A87968",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  const palette = await getSitePalette();
  return (
    /* suppressHydrationWarning: the inline script below flips data-theme to
       "dark" before React hydrates, so the server/client attribute differs
       by design. Suppression is scoped to this element only. */
    <html lang="en" data-theme="light" data-palette={palette} suppressHydrationWarning className={`${cormorant.variable} ${jost.variable} ${parisienne.variable}`}>
      <head>
        {/* Apply saved dark theme before first paint — no fallback so default stays light */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body>
        <ScrollReveal />
        <PageChrome />
        <CartProvider>{children}</CartProvider>
        <Toast />
        <Analytics />
      </body>
    </html>
  );
}
