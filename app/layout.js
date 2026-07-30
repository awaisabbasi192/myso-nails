import { Cormorant_Garamond, Jost, Parisienne } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className={`${cormorant.variable} ${jost.variable} ${parisienne.variable}`}>
      <head>
        {/* Apply saved theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);})();` }} />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
