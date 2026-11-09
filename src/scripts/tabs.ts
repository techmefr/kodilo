import { navigate } from 'astro:transitions/client';
import { base, loadCatalogue, toolUrl, type Entry } from './experience';

const CLOSE_ICON =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const KEY = 'kodilo-tabs';
const LIMIT = 10;
const EVENT = 'kodilo:tabs';

function read(): string[] {
	try {
		const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
		return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
	} catch {
		return [];
	}
}

function write(list: string[]) {
	try {
		localStorage.setItem(KEY, JSON.stringify(list));
	} catch {}
	window.dispatchEvent(new CustomEvent(EVENT));
}

function open(slug: string) {
	const list = read();
	if (list.includes(slug)) return;
	write([...list, slug].slice(-LIMIT));
}

function close(slug: string, active?: string) {
	const list = read();
	const index = list.indexOf(slug);
	const next = list.filter((s) => s !== slug);
	write(next);
	if (slug !== active) return;
	const neighbour = next[Math.min(index, next.length - 1)];
	navigate(neighbour ? toolUrl(neighbour) : base);
}

function tab(entry: Entry, icons: Record<string, string>, active?: string) {
	const li = document.createElement('li');
	li.className = 'tab';
	const link = document.createElement('a');
	link.href = toolUrl(entry.s);
	if (entry.s === active) link.setAttribute('aria-current', 'page');
	const glyph = document.createElement('i');
	glyph.innerHTML = icons[entry.i] ?? '';
	const name = document.createElement('span');
	name.textContent = entry.n;
	link.append(glyph, name);
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'tab-close';
	button.setAttribute('aria-label', `Close ${entry.n}`);
	button.innerHTML = CLOSE_ICON;
	button.addEventListener('click', () => close(entry.s, active));
	li.addEventListener('auxclick', (e) => {
		if (e.button !== 1) return;
		e.preventDefault();
		close(entry.s, active);
	});
	li.append(link, button);
	return li;
}

async function render(active?: string) {
	const panel = document.getElementById('open-tabs');
	const list = document.getElementById('open-tabs-list');
	if (!panel || !list) return;
	const slugs = read();
	panel.hidden = slugs.length === 0;
	if (!slugs.length) return list.replaceChildren();
	let catalogue;
	try {
		catalogue = await loadCatalogue();
	} catch {
		return;
	}
	const bySlug = new Map(catalogue.tools.map((t) => [t.s, t]));
	const entries = slugs.flatMap((s) => bySlug.get(s) ?? []);
	list.replaceChildren(...entries.map((e) => tab(e, catalogue.icons, active)));
}

export function setupTabs(active?: string) {
	if (active) open(active);
	const refresh = () => render(active);
	refresh();
	window.addEventListener(EVENT, refresh);
	window.addEventListener('storage', refresh);
	document.addEventListener(
		'astro:before-swap',
		() => {
			window.removeEventListener(EVENT, refresh);
			window.removeEventListener('storage', refresh);
		},
		{ once: true },
	);
}
