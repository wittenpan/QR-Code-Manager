// app/service-worker.ts
/// <reference lib="webworker" />

const CACHE_NAME = "qr-menu-cache-v1";

self.addEventListener("install", ((event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/offline.html", "/styles/main.css"]);
    }),
  );
}) as EventListener);

self.addEventListener("fetch", ((event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        return caches.match("/offline.html") as Promise<Response>;
      });
    }),
  );
}) as EventListener);

export {};
