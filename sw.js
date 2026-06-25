/* KoalaSave Service Worker — cache static assets for offline use */
const CACHE = 'koalasave-v2';
const STATIC_URLS = [
    '/',
    '/favicon.png',
    '/blog/',
    '/index.html',
    '/travel/',
    '/housing/',
    '/debt-payoff-calculator/',
    '/subscription-cost-calculator/',
    '/best-high-yield-savings-accounts/',
    '/blog/emergency-fund-guide/',
    '/blog/how-to-save-for-a-house-down-payment/',
    '/blog/how-to-save-for-a-trip-to-japan/',
    '/blog/how-to-save-for-a-dream-vacation/',
    '/blog/debt-snowball-vs-avalanche-calculator/'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE).then(function(cache) {
            return cache.addAll(STATIC_URLS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(r) {
            return r || fetch(e.request).then(function(resp) {
                // Cache successful same-origin responses
                if (resp && resp.ok && e.request.url.startsWith(self.location.origin)) {
                    var cacheResp = resp.clone();
                    caches.open(CACHE).then(function(cache) { cache.put(e.request, cacheResp); });
                }
                return resp;
            });
        })
    );
});
