const cacheName = 'office-league-cache-{{version}}';
const dataCacheName = 'office-league-data-cache-{{version}}';
const imageCacheName = 'office-league-image-cache-{{version}}';
const cacheNames = [cacheName, dataCacheName, imageCacheName];

const debugging = false;
const offlineUrl = '{{appUrl}}/offline';
const appUrl = '{{appUrl}}';
const APIUrl = '{{appUrl}}/api/graphql?etag';
const homePageUrl = '{{appUrl}}?source=web_app_manifest';
const staticAssets = [
    '{{appUrl}}/manifest.json',
    '{{assetUrl}}/css/critical.css',
    '{{assetUrl}}/css/styles.css',
    '{{assetUrl}}/img/office-league-logo.svg',
    '{{assetUrl}}/img/questionmark.svg',
    '{{assetUrl}}/img/office-league-loader.svg',
    '{{assetUrl}}/img/logo.svg',
    '{{assetUrl}}/icons/apple-touch-icon.png',
    '{{assetUrl}}/icons/favicon-16x16.png',
    '{{assetUrl}}/icons/favicon-32x32.png',
    '{{assetUrl}}/js/app.js',
    '{{assetUrl}}/js/common.js',
    '{{assetUrl}}/js/critical.js',
    '{{assetUrl}}/js/polyfills.js',
    '{{assetUrl}}/js/styles.js',
    '{{assetUrl}}/js/vendor.js',
    'https://fonts.googleapis.com/css?family=Roboto',
    offlineUrl
];
const userDependantAssets = [
    '{{appUrl}}/',
    homePageUrl
];
const dynamicAssets = [
    '{{assetUrl}}/fonts/',
    '{{assetUrl}}/img/flags/',
    'https://fonts.gstatic.com'
];
const defaultImagePostfix = '-/default?size=512';
const imageUrls = ['/teams/image/', '/players/image/', '/leagues/image/'];

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
    return url.indexOf('{{assetUrl}}') == -1 && url.indexOf(appUrl) > -1;
}

function isRequestToAPI(url) {
    return url.indexOf(APIUrl) > -1;
}

function isRequestToImage(url) {
    return !url.endsWith(defaultImagePostfix) &&
           imageUrls.some(u => url.indexOf(u) > -1);
}

function getFallbackPage() {
    return caches.match(offlineUrl);
}


function getFallbackImage(url) {
    let imgUrl = '{{appUrl}}' + imageUrls.find(u => url.indexOf(u) > -1) + defaultImagePostfix;

    return caches
        .match(imgUrl, {
            ignoreVary: true
        })
        .then(function (response) {
            if (response) {
                return response;
            }

        })
        .catch(function (err) {
            if (debugging) {
                console.log(err);
            }
        });
}

self.addEventListener('install', function (e) {
    consoleLog('Install');
    e.waitUntil(self.skipWaiting());
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            consoleLog('Caching App Shell');

            let userDependantAssetsPromise = Promise.all(userDependantAssets.map(
                    function (userDependantAsset) {
                        consoleLog(userDependantAsset)
                        return fetch(userDependantAsset, {credentials: 'include'})
                            .then(function (response) {
                                cache.put(userDependantAsset, response.clone());
                                return response;
                            });
                    })
            );

            let cacheAssets = staticAssets.concat(imageUrls.map(u => '{{appUrl}}' + u + defaultImagePostfix));
            if (debugging) {
                console.group();
                cacheAssets.forEach(f => consoleLog(f));
                console.groupEnd();
            }
            return Promise.all([userDependantAssetsPromise, cache.addAll(cacheAssets)]);

        }).catch(function (err) {
            console.log(err);
        })
    );
});

self.addEventListener('activate', function (e) {
    consoleLog('Activate');
    e.waitUntil(self.clients.claim());
    e.waitUntil(
        caches.keys().then(function (cacheKeyList) {
            return Promise.all(cacheKeyList.map(function (cacheKey) {
                if (cacheNames.indexOf(cacheKey) === -1) {
                    consoleLog('Removing old cache ' + cacheKey);
                    return caches.delete(cacheKey);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function (e) {

    let requestUrl = e.request.url;
    let apiRequest = isRequestToAPI(requestUrl);
    let rootRequest = isRequestToAppRoot(requestUrl);
    if (apiRequest || rootRequest) {

        // /app and /app/ should be cached under a same and unique URL
        if (requestUrl.endsWith(appUrl)) {
            requestUrl = appUrl + '/';
        }

        // Requests to API and app root will go Network first.
        // We will not try to get API responses from the cache here - it will be done in the API
        // service class, otherwise it won't be able to tell cached data from the fresh one.
        // For requests to the root we will try to fall back to Cache/static page if network is down.
        consoleLog('API or root request: ' + requestUrl);
        e.respondWith(
            caches.open(apiRequest ? dataCacheName : cacheName)
                .then(function (cache) {
                    return fetch(e.request)
                        .then(function (response) {
                            consoleLog('Fetched and cached ' + requestUrl);
                            cache.put(requestUrl, response.clone());
                            return response;
                        })
                        .catch(function () {
                            return cache
                                .match(requestUrl, {
                                    ignoreVary: true
                                })
                                .then(function (response) {
                                    consoleLog((response ?
                                                'Serving from cache: ' + requestUrl :
                                                'No cached response found.'));
                                    return response;
                                });
                        });
                })
        );
        return;
    }

    if (isRequestToImage(requestUrl)) {

        // Requests to images will go Cache first, then Network, with fallback to default image.
        consoleLog('Image request: ' + requestUrl);
        e.respondWith(
            caches
                .match(requestUrl, {
                    ignoreVary: true
                })
                .then(function (response) {
                    if (response) {
                        consoleLog('Serving from cache: ' + requestUrl);
                    }
                    return response ||
                           fetch(e.request)
                               .then(function (response) {
                                   consoleLog('Fetched and cached new image: ' + requestUrl);
                                   return caches
                                       .open(imageCacheName)
                                       .then(function (cache) {
                                           cache.put(requestUrl, response.clone());

                                           return response;
                                       });
                               })
                               .catch(function () {
                                   consoleLog('Failed to fetch ' + requestUrl + '. Serving default image.');
                                   return getFallbackImage(requestUrl);
                               });
                })
        );

        return;
    }

    if (isRequestToAppPage(requestUrl)) {

        // Requests to application pages will go Network first, then Cache.
        // If network is down we will serve the Offline page.
        consoleLog('Request to application page: ' + requestUrl);
        e.respondWith(
            fetch(e.request)
                .then(function (response) {

                    return caches
                        .open(cacheName)
                        .then(function (cache) {
                            consoleLog('Fetched and cached ' + requestUrl);
                            cache.put(requestUrl, response.clone());

                            return response;
                        });
                })
                .catch(function () {
                    if (e.request.method == 'GET') {
                        return caches
                            .match(requestUrl, {
                                ignoreVary: true
                            })
                            .then(function (response) {
                                consoleLog((response ?
                                            'Serving from cache: ' + requestUrl :
                                            'No cached response found. Serving offline page...'));
                                return response || getFallbackPage();
                            });
                    }
                    else {
                        consoleLog('Network is down. Failed to send ' + e.request.method + ' request');
                        return null;
                    }
                })
        );
        return;
    }


    // Requests to App Shell will go Cache first, with fallback to Network only.
    // Dynamic assets (with hash in URL) will be cached on the fly.   
    consoleLog('Other request: ' + requestUrl);
    e.respondWith(
        caches
            .match(requestUrl, {
                ignoreVary: true
            })
            .then(function (response) {
                consoleLog((response ? 'Serving from cache' : 'Fetching from the server') + ': ' + requestUrl);
                return response ||
                       fetch(e.request)
                           .then(function (response) {
                               if (isRequestToDynamicAsset(requestUrl)) {
                                   let clonedResponse = response.clone();
                                   consoleLog('Caching dynamic asset: ' + requestUrl);
                                   caches.open(cacheName).then(function (cache) {
                                       cache.put(requestUrl, clonedResponse);
                                   });
                               }
                               return response;
                           }).catch(function (err) {
                               console.log(err);
                           });
            })
    );
});

self.addEventListener("message", function (e) {
    if (e.data.assets) {
        e.waitUntil(
            caches.open(cacheName).then(function (cache) {
                let firstAsset = true;
                return Promise.all(e.data.assets.map(
                        function (asset, index, arr) {
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
            }).catch(function (err) {
                console.log(err);
            })
        );
    }
});

self.addEventListener('push', function (event) {
    if (event.data) {
        const promiseChain = self.registration.showNotification('Office League', {
            icon: '{{assetUrl}}/img/office-league-logo.svg',
            body: event.data.text()
        });
        event.waitUntil(promiseChain);
    } else {
        console.log('This push event has no data.');
    }
});
