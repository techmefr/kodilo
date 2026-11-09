import { byId } from './ui';
import { reveal } from './landing';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = () => matchMedia('(hover: none)').matches;

let typing = 0;
let current: HTMLElement | null = null;
let samples: Promise<Record<string, [string, string, string]>> | null = null;

const loadSamples = () =>
	(samples ??= fetch(`${import.meta.env.BASE_URL.replace(/\/?$/, '/')}samples.json`)
		.then((r) => r.json())
		.catch(() => ({})));

function typeInto(target: HTMLElement, text: string) {
	const run = ++typing;
	if (reduced() || !text) {
		target.textContent = text;
		return;
	}
	target.textContent = '';
	const start = performance.now();
	const duration = Math.min(900, 240 + text.length * 14);
	const step = (now: number) => {
		if (run !== typing) return;
		const count = Math.min(text.length, Math.ceil(((now - start) / duration) * text.length));
		target.textContent = text.slice(0, count);
		if (count < text.length) requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}

function place(pop: HTMLElement, row: HTMLElement) {
	if (innerWidth < 640) {
		pop.classList.add('sheet');
		pop.style.left = pop.style.top = '';
		return;
	}
	pop.classList.remove('sheet');
	const rect = row.getBoundingClientRect();
	const box = pop.getBoundingClientRect();
	const right = rect.right + 14 + box.width <= innerWidth - 12;
	const left = right ? rect.right + 14 : Math.max(12, rect.left - 14 - box.width);
	const top = Math.min(Math.max(12, rect.top - 8), innerHeight - box.height - 12);
	pop.style.left = `${left}px`;
	pop.style.top = `${top}px`;
}

async function show(row: HTMLElement) {
	const pop = byId('tb-pop');
	if (current === row && !pop.hidden) return;
	current = row;
	byId('tb-pop-name').textContent = row.querySelector('.trow-name')?.textContent ?? '';
	const [input, output] = (await loadSamples())[row.dataset.slug ?? ''] ?? ['', '', ''];
	if (current !== row) return;
	byId('tb-pop-in').textContent = input;
	pop.hidden = false;
	pop.classList.remove('live');
	place(pop, row);
	void pop.offsetWidth;
	pop.classList.add('live');
	typeInto(byId('tb-pop-out'), output);
}

function hide() {
	typing++;
	current = null;
	const pop = document.getElementById('tb-pop');
	if (pop) pop.hidden = true;
}

async function applyFilter(query: string) {
	const index = await loadSamples();
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	let shown = 0;
	document.querySelectorAll<HTMLElement>('.tb-cat').forEach((cat) => {
		let any = false;
		cat.querySelectorAll<HTMLElement>('.trow').forEach((row) => {
			const match = terms.every((t) => (index[row.dataset.slug ?? '']?.[2] ?? '').includes(t));
			(row.parentElement as HTMLElement).hidden = !match;
			if (match) any = true;
		});
		cat.hidden = !any;
		if (any) shown++;
	});
	byId('tb-empty').hidden = shown > 0;
	hide();
}

export function startToolbox() {
	reveal('.tb-cat');
	const cats = byId('tb-cats');
	const rowOf = (target: EventTarget | null) => (target as HTMLElement | null)?.closest<HTMLElement>('.trow') ?? null;

	cats.addEventListener('pointerover', (e) => {
		if (e.pointerType === 'touch') return;
		const row = rowOf(e.target);
		if (row) show(row);
	});
	cats.addEventListener('pointerout', (e) => {
		if (e.pointerType === 'touch') return;
		if (rowOf(e.target) && !rowOf(e.relatedTarget)) hide();
	});
	cats.addEventListener('focusin', (e) => {
		const row = rowOf(e.target);
		if (row) show(row);
	});
	cats.addEventListener('focusout', hide);
	cats.addEventListener('click', (e) => {
		const row = rowOf(e.target);
		if (!row || !touch() || current === row) return;
		e.preventDefault();
		show(row);
	});

	document.addEventListener('click', (e) => {
		if (!rowOf(e.target)) hide();
	});
	document.addEventListener('keydown', (e) => e.key === 'Escape' && hide());
	addEventListener('scroll', hide, { passive: true });

	byId<HTMLInputElement>('tb-filter').addEventListener('input', (e) => applyFilter((e.target as HTMLInputElement).value));
}
