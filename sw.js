const CACHE_NAME = 'zangli-20260810-1';
const APP_SHELL = [
	'/', '/tw/', '/en/', '/bo/', '/widget/',
	'/css/style.css?v=20260810-1', '/css/widget.css?v=20260810-1', '/js/i18n-data.js?v=20260810-1', '/js/i18n.js?v=20260810-1',
	'/js/app.js?v=20260810-1', '/js/widget.js?v=20260810-1', '/zangli.js?v=20260810-1', '/eclipse.js?v=20260810-1',
	'/manifest.json', '/logo-192x192-circle.png', '/logo-512x512-circle.png',
	'/calendar/zangli-special-days.ics'
];

self.addEventListener('install', event => {
	event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
	event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('zangli-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

function cacheResponse(request, response) {
	if (!response.ok || !['basic', 'cors'].includes(response.type)) return Promise.resolve(response);
	// A failed write (quota, opaque range response) must never fail the request itself.
	return caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).catch(() => {}).then(() => response);
}

self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
	if (event.request.mode === 'navigate') {
		event.respondWith(fetch(event.request).then(response => cacheResponse(event.request, response)).catch(async () => {
			const path = new URL(event.request.url).pathname;
			const fallback = path.startsWith('/tw/') ? '/tw/' : path.startsWith('/en/') ? '/en/' : path.startsWith('/bo/') ? '/bo/' : path.startsWith('/widget/') ? '/widget/' : '/';
			return caches.match(fallback);
		}));
		return;
	}
	event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => cacheResponse(event.request, response))));
});
