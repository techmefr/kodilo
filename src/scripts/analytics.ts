type EventData = Record<string, string | number | boolean>;

interface Umami {
	track: (name: string, data?: EventData) => void;
}

export function track(name: string, data?: EventData) {
	const umami = (window as unknown as { umami?: Umami }).umami;
	if (!umami || typeof umami.track !== 'function') return;
	try {
		umami.track(name, data);
	} catch {}
}

export function currentTool() {
	const pin = document.getElementById('pin-tool');
	if (pin?.dataset.slug) return pin.dataset.slug;
	const match = location.pathname.match(/\/tools\/([^/]+)\/?/);
	return match ? match[1] : '';
}
