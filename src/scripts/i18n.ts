import { defaultLocale, locales, matchLocale } from '../i18n/locales';

const KEY = 'kodilo-lang';
const SKIP = 'script,style,pre,code,textarea,kbd,svg,samp,[translate="no"]';
const ATTRS = ['aria-label', 'placeholder', 'title', 'alt'];
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

let dictionary: Record<string, string> = {};
let current = defaultLocale;
let observer: MutationObserver | null = null;
const cache = new Map<string, Record<string, string>>();

export function storedLocale(): string | null {
	try {
		const value = localStorage.getItem(KEY);
		return locales.some((l) => l.code === value) ? value : null;
	} catch {
		return null;
	}
}

export function detectLocale(): string {
	const fromUrl = new URLSearchParams(location.search).get('lang');
	if (fromUrl && locales.some((l) => l.code === fromUrl)) return fromUrl;
	return storedLocale() ?? matchLocale(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

export function setLocale(code: string) {
	try {
		localStorage.setItem(KEY, code);
	} catch {}
	location.reload();
}

const normalise = (text: string) => text.replace(/\s+/g, ' ').trim();

function lookup(text: string): string | null {
	const key = normalise(text);
	if (!key) return null;
	if (dictionary[key]) return dictionary[key];
	const numbers = key.match(/\d+/g);
	if (!numbers) return null;
	const template = dictionary[key.replace(/\d+/g, '{n}')];
	if (!template) return null;
	let i = 0;
	return template.replace(/\{n\}/g, () => numbers[i++] ?? '');
}

const eligible = (node: Node) => {
	const el = node.parentElement;
	return !!el && !el.closest(SKIP);
};

function visit(root: Node, onText: (node: Text) => void, onAttr: (el: Element, attr: string) => void) {
	if (root.nodeType === Node.TEXT_NODE) {
		if (eligible(root)) onText(root as Text);
		return;
	}
	if (root.nodeType !== Node.ELEMENT_NODE) return;
	const start = root as Element;
	if (start.closest(SKIP)) return;
	const walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
		acceptNode: (n) => (n.nodeType === Node.ELEMENT_NODE && (n as Element).matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
	});
	const first = start;
	ATTRS.forEach((a) => first.hasAttribute(a) && onAttr(first, a));
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		if (n.nodeType === Node.TEXT_NODE) onText(n as Text);
		else ATTRS.forEach((a) => (n as Element).hasAttribute(a) && onAttr(n as Element, a));
	}
}

export function collect(root: Node = document.body): string[] {
	const found = new Set<string>();
	visit(
		root,
		(node) => {
			const key = normalise(node.nodeValue ?? '');
			if (key && /\p{L}/u.test(key)) found.add(key);
		},
		(el, attr) => {
			const key = normalise(el.getAttribute(attr) ?? '');
			if (key && /\p{L}/u.test(key)) found.add(key);
		},
	);
	return [...found];
}

function translate(root: Node) {
	visit(
		root,
		(node) => {
			const value = node.nodeValue ?? '';
			const out = lookup(value);
			if (out === null) return;
			const lead = value.match(/^\s*/)?.[0] ?? '';
			const trail = value.match(/\s*$/)?.[0] ?? '';
			node.nodeValue = lead + out + trail;
		},
		(el, attr) => {
			const out = lookup(el.getAttribute(attr) ?? '');
			if (out !== null) el.setAttribute(attr, out);
		},
	);
}

async function load(code: string): Promise<Record<string, string>> {
	const hit = cache.get(code);
	if (hit) return hit;
	try {
		const response = await fetch(`${base}i18n/${code}.json`);
		const data = (await response.json()) as Record<string, string>;
		cache.set(code, data);
		return data;
	} catch {
		return {};
	}
}

function observe() {
	observer?.disconnect();
	observer = new MutationObserver((records) => {
		for (const record of records) record.addedNodes.forEach((node) => translate(node));
	});
	observer.observe(document.body, { childList: true, subtree: true });
}

function setupSelect() {
	const select = document.getElementById('lang-select') as HTMLSelectElement | null;
	if (!select) return;
	select.value = current;
	select.addEventListener('change', () => setLocale(select.value));
}

export async function initI18n() {
	current = detectLocale();
	const meta = locales.find((l) => l.code === current) ?? locales[0];
	document.documentElement.lang = meta.code;
	document.documentElement.dir = meta.dir;
	setupSelect();
	if (current === defaultLocale) return;
	dictionary = await load(current);
	translate(document.body);
	document.title = lookup(document.title) ?? document.title;
	observe();
}

declare global {
	interface Window {
		kodiloI18n?: { collect: typeof collect };
	}
}

window.kodiloI18n = { collect };
