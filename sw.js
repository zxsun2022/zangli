const CACHE_NAME = 'zangli-20261113-2';
const APP_SHELL = [
	'/', '/tw/', '/en/', '/bo/', '/widget/',
	'/css/style.css?v=20261113-2', '/css/widget.css?v=20261113-2', '/js/i18n-data.js?v=20261113-2', '/js/i18n.js?v=20261113-2',
	'/js/langDetect.js?v=20261113-2', '/js/app.js?v=20261113-2', '/js/widget.js?v=20261113-2', '/zangli.js?v=20261113-2', '/eclipse.js?v=20261113-2',
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
		const path = new URL(event.request.url).pathname;
		// 日期深链接有三万多个，内容就是语言入口，不逐个缓存；断网时由下面的回退接住。
		event.respondWith(fetch(event.request).then(response => path.includes('/date/') ? response : cacheResponse(event.request, response)).catch(async () => {
			// 先用这个地址自己的缓存（例如访问过的年份页），没有缓存时才回退到同语言入口。
			const cached = await caches.match(event.request);
			if (cached) return cached;
			const fallback = path.startsWith('/tw/') ? '/tw/' : path.startsWith('/en/') ? '/en/' : path.startsWith('/bo/') ? '/bo/' : path.startsWith('/widget/') ? '/widget/' : '/';
			return caches.match(fallback);
		}));
		return;
	}
	event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => cacheResponse(event.request, response))));
});
