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
    <html lang="en" data-theme="dark" className={`${cormorant.variable} ${jost.variable} ${parisienne.variable}`}>
      <head>
        {/* Apply saved theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();` }} />
        {/* Scroll-reveal: fade/slide sections as they enter viewport */}
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener('DOMContentLoaded',function(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target);}});},{threshold:0.07});document.querySelectorAll('.scroll-reveal,.reveal-left,.reveal-right').forEach(function(el){io.observe(el);});});` }} />
        {/* Google Analytics — set NEXT_PUBLIC_GA_ID in Vercel env vars */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');` }} />
          </>
        )}
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
