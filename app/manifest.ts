import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nisab Tracker | Free Zakat Calculator",
    short_name: "Nisab",
    description:
      "Calculate your Zakat accurately with real-time Nisab values based on daily gold and silver prices. Free Islamic Zakat calculator for Muslims worldwide.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#007a55",
    icons: [
      {
        src: "/logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    dir: "ltr",
    lang: "en-US",
    categories: ["finance", "islam", "zakat"],
  };
}
