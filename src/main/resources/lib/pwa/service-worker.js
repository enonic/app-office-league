const cacheName = 'office-league-cache';
const dataCacheName = 'office-league-data-cache';
const swVersion = '{{appVersion}}/{{userKey}}';
const offlineUrl = '{{siteUrl}}offline';
const debugging = true;
const appUrl = '{{appUrl}}';
const APIUrl = '{{appUrl}}/api/graphql?etag';
const homePageUrl = '{{appUrl}}?source=web_app_manifest';
const staticAssets = [
    '{{siteUrl}}'.slice(0, - 1),
    '{{siteUrl}}',
    '{{appUrl}}/',
    '{{siteUrl}}manifest.json',
    '{{assetUrl}}/css/critical.css',
    '{{assetUrl}}/img/logo.svg',
    '{{assetUrl}}/img/office-league-logo.svg',
    '{{assetUrl}}/icons/apple-touch-icon.png',
    '{{assetUrl}}/icons/favicon-16x16.png',
    '{{assetUrl}}/icons/favicon-32x32.png',
    'https://fonts.googleapis.com/css?family=Roboto',
    offlineUrl
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

function isRequestToAppRoot(url) {
    return url.endsWith(appUrl) || url.endsWith(appUrl + '/') || url.endsWith(homePageUrl);
}

function isRequestToAppPage(url) {
    return url.indexOf(appUrl) > -1;
}

function isRequestToAPI(url) {
    return url.indexOf(APIUrl) > -1;
}

function getFallbackPage() {
    return caches.match(offlineUrl);
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
    let apiRequest = isRequestToAPI(e.request.url);
    let rootRequest = isRequestToAppRoot(e.request.url);

    if (apiRequest || rootRequest) {

        // Requests to API and app root will go Network first, then into Cache.
        // For requests to the root we will try to fall back to Cache/static page if network is down.

        consoleLog('API or root request: ' + e.request.url);

        e.respondWith(
            caches.open(apiRequest ? dataCacheName : cacheName)
                .then(function(cache) {

                    return fetch(e.request)
                        .then(function (response) {
                            consoleLog('Fetched and cached ' + e.request.url);
                            cache.put(e.request.url, response.clone());
                            return response;
                        })
                        .catch(function () {
                            if (rootRequest) {
                                consoleLog('Network is down. Trying to serve from cache...');
                                return cache
                                    .match(apiRequest ? e.request : '{{appUrl}}/', {
                                        ignoreVary: true
                                    })
                                    .then(function (response) {
                                        consoleLog((response ?
                                                    'Serving from cache: ' + e.request.url :
                                                    'No cached response found. Serving offline page.'));

                                        return response || getFallbackPage(e.request.url);
                                    });
                            }
                            else {
                                consoleLog('Network is down. Failed to get response from API.');
                            }
                        });
                })
        );

        return;
    }

    if (isRequestToAppPage(e.request.url)) {

        // Requests to application pages will go Network only (for now) and not be cached.
        // If network is down we will serve the Offline page.

        consoleLog('Request to application page: ' + e.request.url);
        e.respondWith(
            fetch(e.request)
            .then(function (response) {
                consoleLog('Fetched ' + e.request.url);
                return response;
            })
            .catch(function () {
                if (e.request.method == 'GET') {
                    consoleLog('Network is down. Serving offline page...');

                    return getFallbackPage();
                }
                else {
                    consoleLog('Network is down. Failed to send ' + e.request.method + ' request');
                }
            })
        );

        return;
    }


    // Requests to App Shell will go Cache first, with fallback to Network only.
    // Dynamic assets (with hash in URL) will be cached on the fly.
    
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
