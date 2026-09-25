import { navigate } from 'astro:transitions/client';
import { suggestUrl } from './suggest';
import {
	base,
	favorites,
	highlight,
	isFavorite,
	isTyping,
	loadCatalogue,
	recents,
	recordRecent,
	search,
	STORE_EVENT,
	toggleFavorite,
	toolCard,
	toolUrl,
	type Entry,
	type Match,
} from './experience';

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;
let openedFrom: HTMLElement | null = null;
let pendingG = 0;

function closeMega(restore = false) {
	const expanded = document.querySelector<HTMLElement>('.cat-btn[aria-expanded="true"]');
	document.querySelectorAll<HTMLElement>('.mega').forEach((m) => (m.hidden = true));
	document.querySelectorAll('.cat-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
	const scrim = el('mega-scrim');
	if (scrim) scrim.hidden = true;
	if (restore && expanded) expanded.focus();
}

function closeDrawer() {
	el('site-nav')?.classList.remove('open');
	el('nav-open')?.setAttribute('aria-expanded', 'false');
}

function openPalette() {
	const dialog = el<HTMLDialogElement>('palette');
	if (!dialog || dialog.open) return;
	closeMega();
	closeDrawer();
	el<HTMLDialogElement>('shortcuts')?.close();
	dialog.showModal();
	const q = el<HTMLInputElement>('palette-q')!;
	q.value = '';
	q.dispatchEvent(new Event('input'));
	q.focus();
}

function openShortcuts() {
	const dialog = el<HTMLDialogElement>('shortcuts');
	if (!dialog || dialog.open) return;
	el<HTMLDialogElement>('palette')?.close();
	closeMega();
	openedFrom = document.activeElement as HTMLElement | null;
	dialog.showModal();
	el('shortcuts-close')?.focus();
}

function togglePin() {
	el('pin-tool')?.click();
}

function goFavorites() {
	if (el('favorites')) {
		history.replaceState(history.state, '', '#favorites');
		focusFavorites();
	} else navigate(`${base}#favorites`);
}

function focusFavorites() {
	const section = el('favorites');
	if (!section) return;
	section.hidden = false;
	section.scrollIntoView({ block: 'start' });
	section.focus({ preventScroll: true });
}

function visible(node: HTMLElement) {
	return node.offsetParent !== null || node.getClientRects().length > 0;
}

document.addEventListener('keydown', (e) => {
	const key = e.key;
	const mod = e.metaKey || e.ctrlKey;
	if (mod && !e.shiftKey && key.toLowerCase() === 'k') {
		e.preventDefault();
		openPalette();
		return;
	}
	if (mod && key === 'Enter') {
		const primary = [...document.querySelectorAll<HTMLElement>('main [data-primary], main .btn.primary')].find(
			(b) => visible(b) && !(b as HTMLButtonElement).disabled,
		);
		if (primary) {
			e.preventDefault();
			primary.click();
		}
		return;
	}
	if (mod && e.shiftKey && key.toLowerCase() === 'c') {
		const copy = [...document.querySelectorAll<HTMLElement>('main [data-copy]')].find((b) => visible(b) && !(b as HTMLButtonElement).disabled);
		if (copy) {
			e.preventDefault();
			copy.click();
		}
		return;
	}
	if (key === 'Escape') {
		if (document.querySelector('.cat-btn[aria-expanded="true"]')) closeMega(true);
		return;
	}
	if (mod || e.altKey || e.defaultPrevented || isTyping(e.target) || document.querySelector('dialog[open]')) return;
	if (pendingG && Date.now() - pendingG < 1200) {
		pendingG = 0;
		if (key === 'h') {
			e.preventDefault();
			navigate(base);
		} else if (key === 'f') {
			e.preventDefault();
			goFavorites();
		}
		return;
	}
	pendingG = 0;
	if (key === '/') {
		e.preventDefault();
		openPalette();
	} else if (key === '?') {
		e.preventDefault();
		openShortcuts();
	} else if (key === 'g') {
		pendingG = Date.now();
	} else if (key === 'f' && el('pin-tool')) {
		e.preventDefault();
		togglePin();
	}
});

function setupMega(active?: string) {
	const buttons = [...document.querySelectorAll<HTMLAnchorElement>('.cat-btn')];
	const scrim = el('mega-scrim')!;
	const hover = () => matchMedia('(hover: hover) and (min-width: 761px)').matches;
	let hoverTimer: number | undefined;
	let moved = false;
	document.addEventListener('pointermove', () => (moved = true), { once: true });

	const fill = async (panel: HTMLElement) => {
		if (panel.dataset.filled) return;
		const list = panel.querySelector('.mega-grid')!;
		try {
			const { tools, icons } = await loadCatalogue();
			panel.dataset.filled = 'true';
			list.replaceChildren(...tools.filter((t) => t.c === panel.dataset.category).map((t) => toolCard(t, icons, active)));
		} catch {
			const li = document.createElement('li');
			li.className = 'mega-status';
			const link = document.createElement('a');
			link.href = base;
			link.textContent = 'Browse all tools';
			li.append('The tool list could not load. ', link);
			list.replaceChildren(li);
		}
	};
	const links = (panel: HTMLElement) => [...panel.querySelectorAll<HTMLAnchorElement>('.mega-grid a')];
	const show = async (btn: HTMLAnchorElement, toggle = true, focusFirst = false) => {
		const panel = el(btn.getAttribute('aria-controls')!)!;
		const wasOpen = !panel.hidden;
		closeMega();
		if (wasOpen && toggle) return;
		panel.hidden = false;
		scrim.hidden = false;
		btn.setAttribute('aria-expanded', 'true');
		await fill(panel);
		if (focusFirst && !panel.hidden) links(panel)[0]?.focus();
	};
	buttons.forEach((btn, index) => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			show(btn, true, e.detail === 0);
		});
		btn.addEventListener('keydown', (e) => {
			if (e.key === ' ') {
				e.preventDefault();
				show(btn, true, true);
			} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				buttons[(index + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length].focus();
			} else if (e.key === 'Home' || e.key === 'End') {
				e.preventDefault();
				buttons[e.key === 'Home' ? 0 : buttons.length - 1].focus();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				show(btn, false, true);
			}
		});
		btn.addEventListener('mouseenter', () => {
			if (!moved || !hover()) return;
			clearTimeout(hoverTimer);
			hoverTimer = window.setTimeout(() => show(btn, false), 90);
		});
		btn.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
		btn.addEventListener('focus', () => loadCatalogue().catch(() => undefined), { once: true });
	});
	document.querySelectorAll<HTMLElement>('.mega').forEach((panel) => {
		panel.addEventListener('keydown', (e) => {
			const items = links(panel);
			const index = items.indexOf(document.activeElement as HTMLAnchorElement);
			if (index === -1) return;
			const step: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
			let next: HTMLAnchorElement | undefined;
			if (e.key in step) next = items[(index + step[e.key] + items.length) % items.length];
			else if (e.key === 'Home') next = items[0];
			else if (e.key === 'End') next = items[items.length - 1];
			if (!next) return;
			e.preventDefault();
			next.focus();
		});
		panel.addEventListener('click', (e) => {
			if (!(e.target as HTMLElement).closest('a')) return;
			closeMega();
			closeDrawer();
		});
	});
	el('site-nav')!.addEventListener('mouseleave', () => {
		clearTimeout(hoverTimer);
		if (hover()) closeMega();
	});
	scrim.addEventListener('click', () => closeMega());

	const navBtn = el('nav-open')!;
	navBtn.addEventListener('click', () => {
		const isOpen = el('site-nav')!.classList.toggle('open');
		navBtn.setAttribute('aria-expanded', String(isOpen));
		if (!isOpen) closeMega();
	});
}

function setupPalette() {
	const dialog = el<HTMLDialogElement>('palette')!;
	const q = el<HTMLInputElement>('palette-q')!;
	const list = el('palette-list')!;
	const status = el('palette-status')!;
	let results: Entry[] = [];
	let active = 0;

	const paint = () => {
		const options = [...list.querySelectorAll<HTMLElement>('[role="option"]')];
		options.forEach((li, i) => {
			li.setAttribute('aria-selected', String(i === active));
			if (i === active) li.scrollIntoView({ block: 'nearest' });
		});
		const current = options[active];
		if (current) q.setAttribute('aria-activedescendant', current.id);
		else q.removeAttribute('aria-activedescendant');
	};
	const go = (entry?: Entry) => {
		if (!entry) return;
		dialog.close();
		navigate(toolUrl(entry.s));
	};
	const option = (entry: Entry, index: number, needles: string[], label: string) => {
		const li = document.createElement('li');
		li.setAttribute('role', 'option');
		li.id = `palette-opt-${index}`;
		li.dataset.slug = entry.s;
		li.innerHTML = '<div><b></b><span></span></div><em></em>';
		highlight(li.querySelector('b')!, entry.n, needles);
		highlight(li.querySelector('span')!, entry.d, needles);
		li.querySelector('em')!.textContent = label;
		li.addEventListener('click', () => go(entry));
		li.addEventListener('mousemove', () => {
			if (active !== index) {
				active = index;
				paint();
			}
		});
		return li;
	};
	const heading = (text: string) => {
		const li = document.createElement('li');
		li.setAttribute('role', 'presentation');
		li.textContent = text;
		return li;
	};

	const render = async () => {
		const query = q.value.trim();
		let catalogue;
		try {
			catalogue = await loadCatalogue();
		} catch {
			const li = document.createElement('li');
			li.className = 'palette-empty';
			li.textContent = 'The tool list could not load.';
			list.replaceChildren(li);
			return;
		}
		if (q.value.trim() !== query) return;
		const { tools, synonyms } = catalogue;
		const bySlug = new Map(tools.map((t) => [t.s, t]));
		active = 0;
		const nodes: HTMLElement[] = [];
		if (!query) {
			const pinned = favorites()
				.map((s) => bySlug.get(s))
				.filter((t): t is Entry => !!t);
			const recent = recents()
				.filter((s) => !pinned.some((p) => p.s === s))
				.map((s) => bySlug.get(s))
				.filter((t): t is Entry => !!t);
			const seen = new Set([...pinned, ...recent].map((t) => t.s));
			const rest = tools.filter((t) => !seen.has(t.s));
			results = [...pinned, ...recent, ...rest];
			let index = 0;
			if (pinned.length) nodes.push(heading('Pinned'), ...pinned.map((t) => option(t, index++, [], t.c)));
			if (recent.length) nodes.push(heading('Recent'), ...recent.map((t) => option(t, index++, [], t.c)));
			if (pinned.length || recent.length) nodes.push(heading('All tools'));
			nodes.push(...rest.map((t) => option(t, index++, [], t.c)));
			status.textContent = '';
		} else {
			const matches: Match[] = search(tools, query, synonyms).slice(0, 50);
			results = matches.map((m) => m.entry);
			nodes.push(...matches.map((m, i) => option(m.entry, i, m.needles, m.entry.c)));
			status.textContent = matches.length ? `${matches.length} tool${matches.length === 1 ? '' : 's'} found` : '';
		}
		const suggest = document.getElementById('palette-suggest');
		if (suggest) suggest.hidden = !!results.length;
		if (!results.length) {
			const link = document.getElementById('palette-suggest-link');
			if (link instanceof HTMLAnchorElement) link.href = suggestUrl(query);
			const li = document.createElement('li');
			li.className = 'palette-empty';
			li.textContent = `No tool matches “${query}”.`;
			list.replaceChildren(li);
			status.textContent = li.textContent;
			q.removeAttribute('aria-activedescendant');
			return;
		}
		list.replaceChildren(...nodes);
		paint();
	};

	q.addEventListener('input', render);
	q.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			if (!results.length) return;
			active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
			paint();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			go(results[active]);
		}
	});
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog) dialog.close();
	});
}

function setupShortcuts() {
	const dialog = el<HTMLDialogElement>('shortcuts')!;
	if (!isMac) dialog.querySelectorAll<HTMLElement>('kbd[data-key="⌘"]').forEach((k) => (k.textContent = 'Ctrl'));
	el('shortcuts-open')!.addEventListener('click', openShortcuts);
	el('shortcuts-close')!.addEventListener('click', () => dialog.close());
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog) dialog.close();
	});
	dialog.addEventListener('close', () => {
		if (openedFrom?.isConnected) openedFrom.focus();
		openedFrom = null;
	});
	dialog.addEventListener('keydown', (e) => {
		if (e.key !== 'Tab') return;
		const focusable = [...dialog.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')];
		if (!focusable.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	});
}

function setupPin() {
	const button = el<HTMLButtonElement>('pin-tool');
	if (!button) return;
	const slug = button.dataset.slug!;
	const label = button.querySelector('.pin-label')!;
	const sync = () => {
		const pinned = isFavorite(slug);
		button.setAttribute('aria-pressed', String(pinned));
		label.textContent = pinned ? 'Pinned' : 'Pin';
	};
	sync();
	button.addEventListener('click', () => {
		toggleFavorite(slug);
		sync();
	});
	window.addEventListener(STORE_EVENT, sync);
	document.addEventListener('astro:before-swap', () => window.removeEventListener(STORE_EVENT, sync), { once: true });
}

document.addEventListener('astro:page-load', () => {
	const nav = el('site-nav');
	if (!nav) return;
	const active = nav.dataset.activeSlug;
	if (active) recordRecent(active);
	setupMega(active);
	setupPalette();
	setupShortcuts();
	setupPin();
	el('mobile-search')!.addEventListener('click', openPalette);
	el('search-kbd')!.textContent = isMac ? '⌘K' : 'Ctrl K';
	el('search-open')!.addEventListener('click', openPalette);
	if (location.hash === '#favorites') focusFavorites();

	el('theme-toggle')!.addEventListener('click', () => {
		const root = document.documentElement;
		const current = root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		const next = current === 'dark' ? 'light' : 'dark';
		root.dataset.theme = next;
		try {
			localStorage.setItem('kodilo-theme', next);
		} catch {}
	});
});
