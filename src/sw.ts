/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Ảnh — ưu tiên cache, chỉ gọi mạng khi chưa có (giống rule cũ trong vite.config.ts)
registerRoute(
  ({ url }) => /\.(png|jpg|jpeg|svg|gif|webp)$/.test(url.pathname),
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

// Endpoint tải file zip — luôn gọi mạng, không cache
registerRoute(
  ({ url }) => /\/api\/.*\/download-zip/.test(url.pathname),
  new NetworkOnly(),
);

// Các API khác — ưu tiên mạng, fallback cache khi mất mạng
registerRoute(
  ({ url }) => /\/api\//.test(url.pathname),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 5 })],
  }),
);

self.skipWaiting();
self.addEventListener("activate", () => {
  self.clients.claim();
});

// ─── Push notification ───────────────────────────────────────────────
// Nhận push từ server (VD: nhắc "còn 1 tiếng nữa buổi học") và hiển thị
// notification hệ thống trên thiết bị.
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload: { title: string; body: string; url?: string };
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Thông báo", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/logonguyen.png",
      badge: "/logonguyen.png",
      data: { url: payload.url || "/" },
    }),
  );
});

// Khi bấm vào notification: focus tab đang mở đúng trang đó, hoặc mở tab mới
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string })?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsList) => {
        for (const client of clientsList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});
