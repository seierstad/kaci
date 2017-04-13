var CACHE_NAME = "kaci-cache-v1";
var urlsToCache = [
    "/",
    "/css/styles.css",
    "/js/kaci.js",
    "/js/libs.js"
];

self.addEventListener("install", function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log("Opened cache");
            return cache.addAll(urlsToCache);
        })
    );
});


self.addEventListener('fetch', function(event) {
    console.log(event.request.url);
});
