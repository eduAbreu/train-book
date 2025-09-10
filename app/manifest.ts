import type { MetadataRoute } from "next";
import { PWA_CONFIG } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PWA_CONFIG.APP_NAME,
    short_name: PWA_CONFIG.APP_SHORT_NAME,
    description: PWA_CONFIG.DESCRIPTION,
    start_url: "/",
    display: PWA_CONFIG.DISPLAY as "standalone",
    orientation: PWA_CONFIG.ORIENTATION as "portrait",
    background_color: PWA_CONFIG.BACKGROUND_COLOR,
    theme_color: PWA_CONFIG.THEME_COLOR,
    scope: "/",
    lang: "en",
    categories: ["fitness", "health", "productivity", "sports"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Book Class",
        short_name: "Book",
        description: "Quickly book a gym class",
        url: "/gym/classes",
        icons: [
          {
            src: "/icons/shortcut-book.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "My Bookings",
        short_name: "Bookings",
        description: "View your upcoming bookings",
        url: "/gym/bookings",
        icons: [
          {
            src: "/icons/shortcut-bookings.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Gym Dashboard",
        short_name: "Dashboard",
        description: "Manage your gym (owners only)",
        url: "/dashboard",
        icons: [
          {
            src: "/icons/shortcut-dashboard.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
