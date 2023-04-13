const CACHE_NAME = "t9r-cache";
const urlsToCache = [];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.startsWith("chrome-extension://")) return;
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(event.request);
        const cache = await caches.open("cache");
        cache.put(event.request.url, res.clone());
        return res;
      } catch (error) {
        return caches.match(event.request);
      }
    })()
  );
});
