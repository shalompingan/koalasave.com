/* KoalaSave Service Worker — cache static assets for offline use */
const CACHE = 'koalasave-v2';
const OFFLINE_URL = '/offline';
const STATIC_URLS = [
    '/',
    '/favicon.png',
    '/offline',
    '/logo-32.webp',
    '/about/',
    '/blog/',
    '/index.html',
    '/travel/',
    '/housing/',
    '/debt-payoff-calculator/',
    '/subscription-cost-calculator/',
    '/best-high-yield-savings-accounts/',
    '/tools/saving-calculators/',
    '/tools/budget-planners/',
    '/blog/emergency-fund-guide/',
    '/blog/how-to-save-for-a-house-down-payment/',
    '/blog/how-to-save-for-a-trip-to-japan/',
    '/blog/how-to-save-for-a-dream-vacation/',
    '/blog/debt-snowball-vs-avalanche-calculator/'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE).then(function(cache) {
            // Cache each URL individually — one failure won't block the rest
            return Promise.allSettled(
                STATIC_URLS.map(function(url) {
                    return fetch(url).then(function(resp) {
                        if (resp && resp.ok) return cache.put(url, resp);
                    }).catch(function() {});
                })
            );
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
    // Always try network first for navigation requests (fresh content)
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).then(function(resp) {
                var cacheResp = resp.clone();
                caches.open(CACHE).then(function(cache) { cache.put(e.request, cacheResp); });
                return resp;
            }).catch(function() {
                return caches.match(e.request).then(function(r) {
                    return r || caches.match(OFFLINE_URL);
                });
            })
        );
        return;
    }

    // Static assets: cache-first
    e.respondWith(
        caches.match(e.request).then(function(r) {
            return r || fetch(e.request).then(function(resp) {
                if (resp && resp.ok && e.request.url.startsWith(self.location.origin)) {
                    var cacheResp = resp.clone();
                    caches.open(CACHE).then(function(cache) { cache.put(e.request, cacheResp); });
                }
                return resp;
            }).catch(function() {
                return caches.match(OFFLINE_URL);
            });
        })
    );
});
