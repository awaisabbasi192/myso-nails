export default function manifest() {
  return {
    name: "Myso Nails Studio",
    short_name: "Myso Nails",
    description:
      "Hand-painted press-on nail sets, sized to your nails. Shipped nationwide from Lahore.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FDFAF9",
    theme_color: "#9B1B2A",
    icons: [
      { src: "/assets/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/assets/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/assets/logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
