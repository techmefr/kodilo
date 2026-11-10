export function normalizeDomain(raw: string): string | null {
	const cleaned = raw
		.trim()
		.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
		.replace(/[/?#].*$/, '')
		.replace(/^.*@/, '')
		.replace(/:\d+$/, '')
		.replace(/\.$/, '');
	if (!cleaned) return null;
	let host: string;
	try {
		host = new URL(`http://${cleaned}`).hostname;
	} catch {
		return null;
	}
	return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/.test(host) ? host : null;
}

export function make<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	if (text) node.textContent = text;
	if (className) node.className = className;
	return node;
}

export type BadgeKind = 'pass' | 'warn' | 'fail' | 'info';

export function badge(kind: BadgeKind, text: string): HTMLElement {
	const node = make('span', text, 'net-badge');
	node.dataset.kind = kind;
	return node;
}

export function rows(items: [string, string | Node][]): HTMLElement {
	const list = make('dl', '', 'net-rows');
	items.forEach(([label, value]) => {
		list.append(make('dt', label));
		const dd = make('dd');
		dd.append(value);
		list.append(dd);
	});
	return list;
}

export function message(id: string, text: string, isError = false) {
	const node = document.getElementById(id);
	if (!node) return;
	node.textContent = text;
	node.classList.toggle('error', isError);
}

export class HttpFailure extends Error {
	status: number;
	constructor(status: number) {
		super(`HTTP ${status}`);
		this.status = status;
	}
}

export async function getJson<T>(url: string, accept?: string): Promise<T> {
	const response = await fetch(url, accept ? { headers: { accept } } : undefined);
	if (!response.ok) throw new HttpFailure(response.status);
	return (await response.json()) as T;
}

export function panel(title: string, body: Node): HTMLElement {
	const section = make('section', '', 'panel');
	const head = make('div', title, 'panel-head');
	section.append(head, body);
	return section;
}
