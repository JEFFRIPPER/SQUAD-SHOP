// SQUAD SHOP service worker: repeat visits open from the cache and the shop
// still opens offline.
// - The page and shop.json come from the network first, so prices and fixes
//   are never stale; the saved copy answers offline or after 3 s of waiting.
// - Files with ?v= in the URL and fonts never change: the cache answers.
// - Other files (photos) answer from the cache and refresh in the background.
// Other sites (ЮMoney, GitHub, Web3Forms) are never touched.
var VERSION = '1';
var PAGES = 'squad-pages-' + VERSION;
var FILES = 'squad-files-' + VERSION;

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('squad-') === 0 && k !== PAGES && k !== FILES; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function keep(event, cacheName, key, res) {
  if (!res || !res.ok || res.type !== 'basic') return;
  var copy = res.clone();
  event.waitUntil(caches.open(cacheName).then(function (c) { return c.put(key, copy); }));
}

function networkFirst(event, key) {
  var net = fetch(event.request);
  // Registered before the page reads the body, so the copy is taken in time;
  // waitUntil here, not later: the page may already have the cached answer.
  event.waitUntil(net.then(function (res) {
    if (!res.ok || res.type !== 'basic') return;
    var copy = res.clone();
    return caches.open(PAGES).then(function (c) { return c.put(key, copy); });
  }).catch(function () { /* offline */ }));
  var saved = function () { return caches.match(key, { cacheName: PAGES }); };
  return new Promise(function (resolve) {
    var done = false;
    function give(res) { if (!done && res) { done = true; resolve(res); } }
    net.then(give, function () { saved().then(function (hit) { give(hit || Response.error()); }); });
    setTimeout(function () { saved().then(give); }, 3000);
  });
}

function cacheFirst(event, url) {
  return caches.match(event.request, { cacheName: FILES }).then(function (hit) {
    if (hit) return hit;
    return fetch(event.request).then(function (res) {
      keep(event, FILES, event.request, res);
      // A new ?v= replaces the old copy of the same file.
      if (url.search) event.waitUntil(caches.open(FILES).then(function (c) {
        return c.keys().then(function (keys) {
          keys.forEach(function (k) {
            var u = new URL(k.url);
            if (u.pathname === url.pathname && u.search !== url.search) c.delete(k);
          });
        });
      }));
      return res;
    });
  });
}

function staleWhileRevalidate(event) {
  return caches.match(event.request, { cacheName: FILES }).then(function (hit) {
    var net = fetch(event.request).then(function (res) { keep(event, FILES, event.request, res); return res; });
    if (!hit) return net;
    event.waitUntil(net.catch(function () { /* offline: the copy stays */ }));
    return hit;
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || url.pathname.indexOf(scope.pathname) !== 0) return;
  if (req.mode === 'navigate') { event.respondWith(networkFirst(event, scope.href)); return; }
  if (url.pathname === scope.pathname + 'shop.json') { event.respondWith(networkFirst(event, scope.href + 'shop.json')); return; }
  if (url.pathname === scope.pathname + 'sw.js') return;
  if (/[?&]v=/.test(url.search) || url.pathname.indexOf('/fonts/') >= 0) { event.respondWith(cacheFirst(event, url)); return; }
  event.respondWith(staleWhileRevalidate(event));
});
