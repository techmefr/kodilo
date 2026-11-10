const config = JSON.parse('{"version":"dev","base":"/kodilo/","precache":[]}');
const PREFIX = 'kodilo-';
const SHELL = `${PREFIX}shell-${config.version}`;
const RUNTIME = `${PREFIX}runtime-${config.version}`;
const OFFLINE = `${PREFIX}offline-${config.version}`;
const precached = new Set(config.precache.map((path) => new URL(path, self.location.origin).href));

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(config.precache.map((path) => new Request(path, { cache: 'reload' })))));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key.startsWith(PREFIX) && key !== SHELL && key !== RUNTIME && key !== OFFLINE).map((key) => caches.delete(key))),
			)
			.then(() => self.clients.claim()),
	);
});

async function broadcast(message) {
	for (const client of await self.clients.matchAll()) client.postMessage(message);
}

async function cacheAll(pages) {
	const cache = await caches.open(OFFLINE);
	const queue = [...pages];
	const seen = new Set(queue);
	let done = 0;
	const next = async () => {
		while (queue.length) {
			const url = queue.shift();
			try {
				const response = await fetch(url, { cache: 'reload' });
				if (response.ok) {
					await cache.put(url, response.clone());
					const type = response.headers.get('content-type') ?? '';
					const text = type.includes('html') || type.includes('javascript') || type.includes('css') ? await response.text() : '';
					const found = type.includes('html')
						? text.matchAll(/(?:href|src)="([^"]*\/_astro\/[^"]+)"/g)
						: text.matchAll(/["'(]\.\/([\w.-]+\.(?:js|css|wasm))["')]/g);
					for (const match of found) {
						const asset = new URL(match[1], url).href;
						if (!seen.has(asset)) {
							seen.add(asset);
							queue.push(asset);
						}
					}
				}
			} catch {}
			done += 1;
			if (done % 5 === 0 || !queue.length) broadcast({ type: 'offline-progress', done, total: seen.size });
		}
	};
	await Promise.all(Array.from({ length: 6 }, next));
	await broadcast({ type: 'offline-done', total: seen.size });
}

self.addEventListener('message', (event) => {
	const data = event.data;
	if (data === 'skip-waiting') self.skipWaiting();
	else if (data?.type === 'cache-all') event.waitUntil(cacheAll(data.urls.map((url) => new URL(url, self.location.origin).href)));
	else if (data?.type === 'clear-offline') event.waitUntil(caches.delete(OFFLINE).then(() => broadcast({ type: 'offline-cleared' })));
	else if (data?.type === 'offline-status') event.waitUntil(caches.has(OFFLINE).then((has) => broadcast({ type: has ? 'offline-done' : 'offline-cleared' })));
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
