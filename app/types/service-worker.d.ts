// app/types/service-worker.d.ts
interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface ServiceWorkerGlobalScope {
  addEventListener(
    type: "install",
    listener: (event: ExtendableEvent) => void,
  ): void;
  addEventListener(type: "fetch", listener: (event: FetchEvent) => void): void;
  // Add other event types as needed
}
