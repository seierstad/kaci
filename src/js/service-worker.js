var CACHE_NAME = "kaci-cache";
var urlsToCache = [
    "/",
    "/css/styles.css",
    "/js/kaci.js",
    "/js/libs.js",
    "/images/icon-144x144.png",
    "/images/icon-152x152.png",
    "/images/icon-16x16.png",
    "/images/icon-180x180.png",
    "/images/icon-192x192.png",
    "/images/icon-196x196.png",
    "/images/icon-32x32.png",
    "/images/icon-48x48.png",
    "/images/icon-64x64.png",
    "/images/icon-72x72.png",
    "/images/icon-96x96.png",
    "/images/icon.svg"
];

self.addEventListener("install", function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                // console.log("Opened cache");
                return cache.addAll(urlsToCache);
            })
    );
});


self.addEventListener('activate', function (event) {
    var cachePrefix = CACHE_NAME.substr(0, CACHE_NAME.lastIndexOf("-"));
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                    // console.log(cacheName);
                    return cacheName !== CACHE_NAME && cacheName.indexOf(cachePrefix) !== -1;
                }).map(function (cacheName) {
                    // console.log("delete ", cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});


self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function (response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});
