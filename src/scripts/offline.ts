import { base, loadCatalogue, toolUrl } from './experience';
import { PAGE_SUFFIX } from './page-suffix';

type State = 'idle' | 'saving' | 'saved';

const LABELS: Record<State, string> = {
	idle: 'Save all tools offline',
	saving: 'Saving tools offline',
	saved: 'Saved offline, click to remove',
};

async function worker(): Promise<ServiceWorker | null> {
	if (!('serviceWorker' in navigator)) return null;
	const registration = await navigator.serviceWorker.getRegistration(base);
	return registration?.active ?? null;
}

export async function setupOfflineButton() {
	const button = document.getElementById('offline-all') as HTMLButtonElement | null;
	const label = button?.querySelector<HTMLElement>('.offline-label');
	if (!button || !label || !(await worker())) return;
	let state: State = 'idle';
	const show = (next: State, progress = '') => {
		state = next;
		label.textContent = LABELS[next];
		button.dataset.state = next;
		button.setAttribute('aria-busy', String(next === 'saving'));
		const status = document.getElementById('offline-status');
		if (status) status.textContent = progress;
	};
	button.hidden = false;
	if (button.dataset.bound) return;
	button.dataset.bound = '1';
	navigator.serviceWorker.addEventListener('message', (event) => {
		const data = event.data as { type?: string; done?: number; total?: number };
		if (data?.type === 'offline-progress') show('saving', `${Math.round(((data.done ?? 0) / Math.max(data.total ?? 1, 1)) * 100)}%`);
		else if (data?.type === 'offline-done') show('saved');
		else if (data?.type === 'offline-cleared') show('idle');
	});
	button.addEventListener('click', async () => {
		const active = await worker();
		if (!active || state === 'saving') return;
		if (state === 'saved') {
			active.postMessage({ type: 'clear-offline' });
			return;
		}
		show('saving', '0%');
		const catalogue = await loadCatalogue();
		const urls = [`${base}${PAGE_SUFFIX}`, `${base}categories/${PAGE_SUFFIX}`, `${base}404.html`, ...catalogue.tools.map((tool) => toolUrl(tool.s))];
		active.postMessage({ type: 'cache-all', urls });
	});
	(await worker())?.postMessage({ type: 'offline-status' });
}
