const CACHE_NAME = "travelsafe-cache-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "./",
        "index.html",
        "style.css",
        "script.js"
      ]);
    })
  );
});