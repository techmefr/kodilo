const config = JSON.parse('{"version":"dev","base":"/kodilo/","precache":[]}');
const PREFIX = 'kodilo-';
const SHELL = `${PREFIX}shell-${config.version}`;
const RUNTIME = `${PREFIX}runtime-${config.version}`;
const precached = new Set(config.precache.map((path) => new URL(path, self.location.origin).href));

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(config.precache.map((path) => new Request(path, { cache: 'reload' })))));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key.startsWith(PREFIX) && key !== SHELL && key !== RUNTIME).map((key) => caches.delete(key))))
			.then(() => self.clients.claim()),
	);
});

self.addEventListener('message', (event) => {
	if (event.data === 'skip-waiting') self.skipWaiting();
});

function cacheKey(request) {
	const url = new URL(request.url);
	url.hash = '';
	if (request.mode === 'navigate') {
		url.search = '';
		if (!url.pathname.endsWith('/') && !url.pathname.split('/').pop().includes('.')) url.pathname += '/';
	}
	return url.href;
}

async function staleWhileRevalidate(event) {
	const { request } = event;
	const key = cacheKey(request);
	const target = precached.has(key) ? SHELL : RUNTIME;
	const cached = await caches.match(key);
	const network = fetch(request)
		.then(async (response) => {
			if (response.ok && response.type === 'basic') {
				const cache = await caches.open(target);
				await cache.put(key, response.clone());
			}
			return response;
		})
		.catch(() => undefined);
	if (cached) {
		event.waitUntil(network);
		return cached;
	}
	const response = await network;
	if (response) return response;
	if (request.mode === 'navigate') {
		const fallback = await caches.match(new URL(`${config.base}404.html`, self.location.origin).href);
		if (fallback) return fallback;
	}
	return Response.error();
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== self.location.origin || !url.pathname.startsWith(config.base)) return;
	if (url.pathname === `${config.base}sw.js`) return;
	event.respondWith(staleWhileRevalidate(event));
});
