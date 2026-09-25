export type Entry = { s: string; n: string; d: string; c: string; i: string };
export type Catalogue = { tools: Entry[]; icons: Record<string, string>; synonyms: string[][] };
export type Match = { entry: Entry; score: number; needles: string[] };

export const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const toolUrl = (slug: string) => `${base}tools/${slug}/`;

const FAVORITES = 'kodilo-favorites';
const RECENTS = 'kodilo-recents';
const RECENT_LIMIT = 8;
export const STORE_EVENT = 'kodilo:store';

let pending: Promise<Catalogue> | undefined;

export function loadCatalogue(): Promise<Catalogue> {
	pending ??= fetch(`${base}tools.json`)
		.then((r) => {
			if (!r.ok) throw new Error(String(r.status));
			return r.json() as Promise<Catalogue>;
		})
		.catch((error) => {
			pending = undefined;
			throw error;
		});
	return pending;
}

function readList(key: string): string[] {
	try {
		const value = JSON.parse(localStorage.getItem(key) ?? '[]');
		return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
	} catch {
		return [];
	}
}

function writeList(key: string, list: string[]) {
	try {
		localStorage.setItem(key, JSON.stringify(list));
	} catch {}
	window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export const favorites = () => readList(FAVORITES);
export const recents = () => readList(RECENTS);
export const isFavorite = (slug: string) => favorites().includes(slug);

export function toggleFavorite(slug: string): boolean {
	const list = favorites();
	const pinned = !list.includes(slug);
	writeList(FAVORITES, pinned ? [slug, ...list] : list.filter((s) => s !== slug));
	return pinned;
}

export function recordRecent(slug: string) {
	const list = recents();
	if (list[0] === slug) return;
	writeList(RECENTS, [slug, ...list.filter((s) => s !== slug)].slice(0, RECENT_LIMIT));
}

const words = (text: string) => text.split(/[^a-z0-9]+/).filter(Boolean);

function subsequence(text: string, term: string) {
	let k = 0;
	for (const ch of text) if (ch === term[k]) k++;
	return k >= term.length;
}

function termScore(entry: Entry, term: string): number {
	const name = entry.n.toLowerCase();
	const slug = entry.s;
	const description = entry.d.toLowerCase();
	const category = entry.c.toLowerCase();
	if (name === term || slug === term) return 100;
	if (name.startsWith(term) || slug.startsWith(term)) return 60;
	if (words(name).some((w) => w.startsWith(term))) return 40;
	if (name.includes(term) || slug.includes(term)) return 25;
	if (words(category).some((w) => w.startsWith(term))) return 14;
	if (words(description).some((w) => w.startsWith(term))) return 10;
	if (description.includes(term) || category.includes(term)) return 5;
	if (term.length > 2 && subsequence(name, term)) return 2;
	return 0;
}

export function search(entries: Entry[], query: string, groups: string[][]): Match[] {
	const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	if (!terms.length) return [];
	const phrase = terms.join(' ');
	const expansions = terms.map((term) => {
		const related = groups.filter((g) => g.some((w) => w === term || w === phrase || (term.length > 2 && w.startsWith(term))));
		return [...new Set(related.flat().filter((w) => w !== term))];
	});
	return entries
		.map((entry) => {
			let score = 0;
			const needles: string[] = [];
			for (const [index, term] of terms.entries()) {
				let best = termScore(entry, term);
				let needle = term;
				for (const alias of expansions[index]) {
					const aliasScore = termScore(entry, alias) * 0.8;
					if (aliasScore > best) {
						best = aliasScore;
						needle = alias;
					}
				}
				if (!best) return { entry, score: 0, needles };
				score += best;
				needles.push(needle);
			}
			return { entry, score, needles };
		})
		.filter((m) => m.score > 0)
		.sort((a, b) => b.score - a.score || a.entry.n.localeCompare(b.entry.n));
}

export function highlight(target: HTMLElement, text: string, needles: string[]) {
	const lower = text.toLowerCase();
	const marks = new Array<boolean>(text.length).fill(false);
	for (const needle of needles) {
		if (!needle) continue;
		let from = lower.indexOf(needle);
		while (from !== -1) {
			marks.fill(true, from, from + needle.length);
			from = lower.indexOf(needle, from + needle.length);
		}
	}
	const nodes: Node[] = [];
	let start = 0;
	for (let i = 1; i <= text.length; i++) {
		if (i === text.length || marks[i] !== marks[start]) {
			const chunk = text.slice(start, i);
			if (marks[start]) {
				const mark = document.createElement('mark');
				mark.textContent = chunk;
				nodes.push(mark);
			} else nodes.push(document.createTextNode(chunk));
			start = i;
		}
	}
	target.replaceChildren(...nodes);
}

export function toolCard(entry: Entry, icons: Record<string, string>, current?: string): HTMLLIElement {
	const li = document.createElement('li');
	const a = document.createElement('a');
	a.href = toolUrl(entry.s);
	if (entry.s === current) a.setAttribute('aria-current', 'page');
	const glyph = document.createElement('i');
	glyph.className = 't-icon';
	glyph.innerHTML = icons[entry.i] ?? '';
	const text = document.createElement('div');
	text.className = 't-text';
	const name = document.createElement('b');
	name.textContent = entry.n;
	const description = document.createElement('span');
	description.textContent = entry.d;
	text.append(name, description);
	a.append(glyph, text);
	li.append(a);
	return li;
}

export const isTyping = (target: EventTarget | null) =>
	target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

export const categoryId = (name: string) =>
	`cat-${name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')}`;
