export default function manifest() {
  return {
    name: "Press-Ons by Myra",
    short_name: "Press-Ons by Myra",
    description:
      "Hand-painted press-on nail sets, sized to your nails. Shipped nationwide from Lahore.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FDFAF9",
    theme_color: "#A87968",
    icons: [
      { src: "/assets/logo-myra.jpeg", sizes: "192x192", type: "image/jpeg", purpose: "any" },
      { src: "/assets/logo-myra.jpeg", sizes: "512x512", type: "image/jpeg", purpose: "any" },
      { src: "/assets/logo-myra.jpeg", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
    ],
  };
}
