const cacheName = 'office-league-cache';
const dataCacheName = 'office-league-data-cache';
const swVersion = '{{appVersion}}/{{userKey}}';
const debugging = true;
const staticAssets = [
    '{{siteUrl}}'.slice(0, - 1),
    '{{siteUrl}}',
    '{{siteUrl}}manifest.json',
    '{{appUrl}}',
    '{{appUrl}}/',
    '{{appUrl}}?source=web_app_manifest',
    '{{assetUrl}}/css/critical.css',
    '{{assetUrl}}/img/logo.svg',
    '{{assetUrl}}/img/logo1.svg',
    '{{assetUrl}}/img/office-league-logo.svg',
    '{{assetUrl}}/icons/apple-touch-icon.png',
    '{{assetUrl}}/icons/favicon-16x16.png',
    '{{assetUrl}}/icons/favicon-32x32.png',
    '{{assetUrl}}/icons/safari-pinned-tab.svg',
    'https://fonts.googleapis.com/css?family=Roboto'
];
const dynamicAssets = [
    '{{assetUrl}}/fonts/',
    '{{assetUrl}}/img/flags/',
    'https://fonts.gstatic.com'
];

function consoleLog(message) {
    if (debugging) {
        console.log('[ServiceWorker]', message);
    }
}

function isRequestToDynamicAsset(url) {
    return dynamicAssets.some(asset => (url.indexOf(asset) > -1));
}

self.addEventListener('install', function(e) {

    consoleLog('Install');
    
    e.waitUntil(self.skipWaiting());

    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            consoleLog('Caching App Shell');
            if (debugging) {
                console.group();
                staticAssets.forEach(f => consoleLog(f));
                console.groupEnd();
            }
            return cache.addAll(staticAssets);
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

                return response || 
                       fetch(e.request)
                        .then(function (response) {
                            if (isRequestToDynamicAsset(e.request.url)) {
                                let clonedResponse = response.clone();
                                consoleLog('Caching dynamic asset: ' + e.request.url);
                                caches.open(cacheName).then(function(cache) {
                                    cache.put(e.request.url, clonedResponse);
                                });
                            }
                            return response;
                        });
            })
    );
});

self.addEventListener("message", function(e) {
    if (e.data.assets) {
        e.waitUntil(
            caches.open(cacheName).then(function(cache) {
                let firstAsset = true;

                return Promise.all(e.data.assets.map(
                    function(asset, index, arr) {
                        cache
                            .match(asset)
                            .then(function (response) {
                                    if (!response) {
                                        if (firstAsset) {
                                            consoleLog('Caching App Shell');
                                            if (debugging) {
                                                console.group();
                                            }
                                            firstAsset = false;
                                        }
                                        consoleLog(asset);
                                        if (debugging && index == arr.length - 1) {
                                            console.groupEnd();
                                        }
    
                                        return cache.add(asset);
                                    }
                            });
                    })
                );
            }).catch(function(err) {
                console.log(err);
            })
        );
    }
});
