/* Appli de suivi Educ'Assure : ouverture hors-ligne.
 * - la page : réseau d'abord (toujours la dernière version), copie gardée si pas de réseau ;
 * - logo, icônes, polices : copie gardée (plus rapide en 3G) ;
 * - les données (script.google.com) ne passent jamais par ici. */
var V = 'ea-v30';
var BASE = ['./', 'index.html', 'logo.png', 'icon-192.png', 'icon-180.png', 'manifest.json'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || /script\.google(usercontent)?\.com$/.test(u.hostname) || u.hostname === 'api.qrserver.com') return;
  var page = r.mode === 'navigate' || (u.origin === self.location.origin && /\/(index\.html)?$/.test(u.pathname));
  if (page) {
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(V).then(function (c) { c.put('index.html', cp); }); return res; })
      .catch(function () { return caches.match('index.html'); }));
    return;
  }
  if (u.origin === self.location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res && (res.ok || res.type === 'opaque')) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); } return res; });
      return hit || net;
    }));
  }
});
