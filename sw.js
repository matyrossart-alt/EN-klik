/* Offline: aplikace se uloží do zařízení při prvním otevření. Při každé změně zvednout verzi V. */
const V = "2026-10-27-povaha";
const CACHE = "klikacka-" + V;
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon-48.png", "fonts/atkinson-hyperlegible-latin-400-italic.woff2", "fonts/atkinson-hyperlegible-latin-400-normal.woff2", "fonts/atkinson-hyperlegible-latin-700-normal.woff2", "fonts/atkinson-hyperlegible-latin-ext-400-italic.woff2", "fonts/atkinson-hyperlegible-latin-ext-400-normal.woff2", "fonts/atkinson-hyperlegible-latin-ext-700-normal.woff2", "fonts/lexend-latin-500-normal.woff2", "fonts/lexend-latin-600-normal.woff2", "fonts/lexend-latin-700-normal.woff2", "fonts/lexend-latin-ext-500-normal.woff2", "fonts/lexend-latin-ext-600-normal.woff2", "fonts/lexend-latin-ext-700-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const fresh = req.mode === "navigate" || /\.(html|webmanifest)$|\/sw\.js$|\/$/.test(url.pathname);
  if (fresh) {
    // stránka a manifest: nejdřív internet (nová verze), bez signálu uložená kopie
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req.mode === "navigate" ? "index.html" : req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else {
    // písma a ikony: z uložené kopie
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const c = n.clone(); caches.open(CACHE).then(x => x.put(req, c)); return n; })));
  }
});
