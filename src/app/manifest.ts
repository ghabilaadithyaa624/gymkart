import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GymKart — Fitness Shopping",
    short_name: "GymKart",
    description: "Authentic supplements, fitness equipment and workout essentials for India.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#f6f6f7",
    theme_color: "#1a1a1a",
    orientation: "portrait-primary",
    categories: ["shopping", "fitness", "health"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
