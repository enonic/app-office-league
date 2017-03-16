const cacheName = 'ol-cache';
const dataCacheName = 'ol-data-cache';
const swVersion = '{{appVersion}}';
const debugging = true;
const filesToCache = [
    '{{siteUrl}}',
    '{{siteUrl}}/',
    '{{appUrl}}',
    '{{appUrl}}/'
];

function consoleLog(message) {
    if (debugging) {
        console.log('[ServiceWorker]', message);
    }
}

self.addEventListener('install', function(e) {

    consoleLog('Install');
    
    e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
    consoleLog('Activate');

    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
    consoleLog('Fetching ' + e.request.url);
});
