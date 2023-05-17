const CACHE_NAME = "t9r-cache";
const urlsToCache = [];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.startsWith("chrome-extension://")) return;
  event.respondWith(fetch(event.request));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === CACHE_NAME) return;
          return caches.delete(key);
        })
      );
    })
  );
});
