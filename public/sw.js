const CACHE_NAME = "personal-wiki-v0-6-2";
const OFFLINE_URL = "/offline";
const PUBLIC_PATH_PREFIXES = ["/", "/library/", "/topics/", "/offline"];
const SKIP_PATH_PREFIXES = ["/author", "/auth", "/me"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL, "/"]);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName === CACHE_NAME) {
            return Promise.resolve();
          }

          return caches.delete(cacheName);
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (SKIP_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return;
  }

  if (request.mode === "navigate") {
    if (!PUBLIC_PATH_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix))) {
      return;
    }

    event.respondWith(networkFirstDocument(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/pwa/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function networkFirstDocument(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => undefined);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await networkPromise;
  return networkResponse || Response.error();
}
