const CACHE_NAME = "trainbook-v1";
const STATIC_CACHE_URLS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon-192.jpg",
  "/icon-512.jpg",
  "/icon-maskable.jpg",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker install failed:", error);
        // Continue with installation even if caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  try {
    const url = new URL(request.url);

    // Handle navigation requests
    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request).catch(() => {
          return caches.match("/offline").catch(() => {
            // If offline page is not cached, return a basic response
            return new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            });
          });
        })
      );
      return;
    }
  } catch (error) {
    console.error("Service Worker fetch error:", error);
    return;
  }

  // Handle static assets (cache-first strategy)
  if (
    request.destination === "image" ||
    request.destination === "script" ||
    request.destination === "style" ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Handle API requests and other dynamic content (network-first strategy)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // If no cache match, return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline");
          }
          // For other requests, return a basic response
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
