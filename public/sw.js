const CACHE_NAME = "train-book-v1";
const STATIC_CACHE_NAME = "train-book-static-v1";
const DYNAMIC_CACHE_NAME = "train-book-dynamic-v1";
const API_CACHE_NAME = "train-book-api-v1";

const STATIC_CACHE_URLS = [
  "/",
  "/offline",
  "/signin",
  "/onboarding",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-192x192-maskable.png",
  "/icons/icon-512x512-maskable.png",
];

// API endpoints to cache for offline functionality
const API_CACHE_PATTERNS = [
  /^.*\/api\/gyms$/,
  /^.*\/api\/classes$/,
  /^.*\/api\/bookings$/,
  /^.*\/api\/plans$/,
];

// Routes that should always try network first
const NETWORK_FIRST_PATTERNS = [/^.*\/api\/.*$/, /^.*\/auth\/.*$/];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Train Book Service Worker");
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log("[SW] Static assets cached, skipping waiting");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Train Book Service Worker");
  const currentCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Service Worker activated, claiming clients");
        return self.clients.claim();
      })
  );
});

// Utility functions
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url.href));
}

function isNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.href));
}

function isStaticAsset(request, url) {
  return (
    request.destination === "image" ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  );
}

// Cache-first strategy for static assets
function handleStaticAsset(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      return cachedResponse;
    }

    return fetch(request).then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(STATIC_CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    });
  });
}

// Network-first strategy for API requests
function handleApiRequest(request) {
  return fetch(request)
    .then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(API_CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    })
    .catch(() => {
      return caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Add a header to indicate this is from cache
          const response = cachedResponse.clone();
          response.headers.set("X-Served-From", "cache");
          return response;
        }
        return new Response(
          JSON.stringify({
            error: "Offline",
            message: "This request is not available offline",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      });
    });
}

// Network-first strategy for navigation
function handleNavigation(request) {
  return fetch(request).catch(() => {
    return caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return caches.match("/offline");
    });
  });
}

// Stale-while-revalidate for dynamic content
function handleDynamicContent(request) {
  const cachedResponsePromise = caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return response;
  });

  return cachedResponsePromise.then((cachedResponse) => {
    return cachedResponse || fetchPromise;
  });
}

// Main fetch event handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests that aren't API calls
  if (url.origin !== location.origin && !isApiRequest(url)) {
    return;
  }

  console.log("[SW] Handling request:", request.url);

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(request, url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle API requests with network-first strategy
  if (isApiRequest(url) || isNetworkFirst(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle other dynamic content with stale-while-revalidate
  event.respondWith(handleDynamicContent(request));
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync event:", event.tag);

  if (event.tag === "background-sync-bookings") {
    event.waitUntil(syncOfflineBookings());
  }
});

// Handle offline booking sync
async function syncOfflineBookings() {
  try {
    // This would sync any offline bookings stored in IndexedDB
    console.log("[SW] Syncing offline bookings");
    // Implementation would go here
  } catch (error) {
    console.error("[SW] Failed to sync offline bookings:", error);
  }
}

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: data.data,
    actions: data.actions || [],
    tag: data.tag || "train-book-notification",
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);

  event.notification.close();

  const data = event.notification.data;
  const action = event.action;

  let url = "/";
  if (data && data.url) {
    url = data.url;
  }

  // Handle notification actions
  if (action === "view") {
    url = data.viewUrl || url;
  } else if (action === "cancel") {
    // Handle cancel action
    url = data.cancelUrl || url;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }

      // Open new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
