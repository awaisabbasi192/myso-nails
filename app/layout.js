import { Cormorant_Garamond, Jost, Parisienne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import ScrollReveal from "@/components/ScrollReveal";

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
  title: "Myso Nails Studio — Hand-painted press-on nail sets",
  description:
    "Hand-painted press-on nail sets, custom bridal work and size-fitted reusable sets. Shipped nationwide from Lahore.",
  appleWebApp: { capable: true, title: "Myso Nails", statusBarStyle: "black-translucent" },
  icons: { apple: "/assets/logo.png" },
};

export const viewport = {
  themeColor: "#9B1B2A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className={`${cormorant.variable} ${jost.variable} ${parisienne.variable}`}>
      <head>
        {/* Apply saved dark theme before first paint — no fallback so default stays light */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body>
        <ScrollReveal />
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
