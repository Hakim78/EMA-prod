// EDRCF 6.0 — Service Worker
// Handles: PWA installability, push notifications, notification click routing

const SW_VERSION = "edrcf-sw-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// ── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "EDRCF 6.0", body: event.data.text() };
  }

  const options = {
    body: data.body || "Nouveau signal M&A détecté",
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: data.tag || "edrcf-signal",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    actions: [
      { action: "open", title: "Ouvrir" },
      { action: "dismiss", title: "Ignorer" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "EDRCF 6.0", options)
  );
});

// ── Notification Click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing tab if open
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open new tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ── Fetch: pass-through (don't intercept Next.js routing) ───────────────────
self.addEventListener("fetch", (event) => {
  // Only handle same-origin navigation requests for offline fallback
  if (
    event.request.mode === "navigate" &&
    event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return minimal offline page
        return new Response(
          `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EDRCF 6.0 — Hors ligne</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#050505;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:24px}.icon{width:64px;height:64px;background:#4f46e5;border-radius:16px;display:flex;align-items:center;justify-content:center}h1{font-size:24px;font-weight:900;letter-spacing:-0.05em}p{color:#6b7280;font-size:14px}</style></head><body><div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="32" height="32"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg></div><h1>EDRCF 6.0</h1><p>Connexion indisponible — rechargez quand vous êtes en ligne</p></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      })
    );
  }
});
