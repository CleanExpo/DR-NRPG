import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NRPG - National Restoration Professionals Group",
    short_name: "NRPG",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f2742",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
