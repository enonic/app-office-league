const cacheName = 'office-league-cache';
const dataCacheName = 'office-league-data-cache';
const swVersion = '{{appVersion}}';
const debugging = true;
const filesToCache = [
    '{{siteUrl}}',
    '{{siteUrl}}/',
    '{{appUrl}}',
    '{{appUrl}}/',
    '{{assetUrl}}/img/logo.svg',
    '{{assetUrl}}/img/office-league-logo.svg'
];

function consoleLog(message) {
    if (debugging) {
        console.log('[ServiceWorker]', message);
    }
}

self.addEventListener('install', function(e) {

    consoleLog('Install');
    
    e.waitUntil(self.skipWaiting());

    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            consoleLog('Caching App Shell');
            if (debugging) {
                console.group();
                filesToCache.forEach(f => consoleLog(f));
                console.groupEnd();
            }
            return cache.addAll(filesToCache);
        }).catch(function(err) {
            console.log(err);
        })
    );
});

self.addEventListener('activate', function(e) {
    consoleLog('Activate');

    e.waitUntil(self.clients.claim());

    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    consoleLog('Removing old cache ' + key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches
            .match(e.request, {
                ignoreVary: true
            })
            .then(function (response) {
                consoleLog((response ? 'Serving from cache' : 'Fetching from the server') + ': ' + e.request.url);

                return response || fetch(e.request);
            })
    );
});

self.addEventListener("message", function(e) {
    if (e.data.assets) {
        e.waitUntil(
            caches.open(cacheName).then(function(cache) {
                consoleLog('Caching App Shell');
                if (debugging) {
                    console.group();
                    e.data.assets.forEach(f => consoleLog(f));
                    console.groupEnd();
                }
                return cache.addAll(e.data.assets);
            }).catch(function(err) {
                console.log(err);
            })
        );
    }
});
