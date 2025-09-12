import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Train Book App",
    short_name: "TrainBook",
    description:
      "Complete gym management system for owners and students. Manage classes, bookings, plans, and more with our modern PWA platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon-192.jpg",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.jpg",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable.jpg",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
