const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const words = ['Format', 'Decode', 'Convert', 'Inspect'];

export async function runIntro() {
	const root = document.getElementById('li');
	const home = document.getElementById('lp-hero');
	if (!root || !home || reduced() || navigator.webdriver) return;
	const total = Number(root.dataset.total) || 0;
	const n = document.getElementById('li-n')!;
	const w = document.getElementById('li-w')!;
	const mark = root.querySelector<HTMLElement>('.li-mark')!;
	let skipped = false;
	root.hidden = false;
	root.addEventListener('click', () => {
		skipped = true;
		root.hidden = true;
		document.documentElement.style.overflow = '';
	});
	document.documentElement.style.overflow = 'hidden';

	mark.animate(
		[
			{ opacity: 0, transform: 'scale(0.6)', filter: 'blur(8px)' },
			{ opacity: 1, transform: 'scale(1)', filter: 'blur(0)' },
		],
		{ duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' },
	);

	const start = performance.now();
	const duration = 1500;
	await new Promise<void>((resolve) => {
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			n.textContent = String(Math.round(total * (1 - Math.pow(1 - t, 3))));
			w.textContent = words[Math.min(words.length - 1, Math.floor(t * words.length))];
			if (t < 1) requestAnimationFrame(step);
			else resolve();
		};
		requestAnimationFrame(step);
	});
	await wait(250);
	if (skipped) return;

	root.querySelector('.li-word')!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'both' });
	const zoom = mark.animate(
		[
			{ transform: 'scale(1)', opacity: 1 },
			{ transform: 'scale(40)', opacity: 0 },
		],
		{ duration: 800, easing: 'cubic-bezier(0.7, 0, 0.84, 0)', fill: 'both' },
	);
	root.querySelector('.li-count')!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'both' });
	await wait(450);
	await root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: 'both' }).finished;
	if (skipped) return;
	zoom.cancel();
	root.hidden = true;
	document.documentElement.style.overflow = '';

	const parts = home.querySelectorAll<HTMLElement>('.lp-eyebrow, h1, .lp-lead, .lp-cta');
	parts.forEach((el, i) =>
		el.animate(
			[
				{ opacity: 0, transform: 'translateY(24px)' },
				{ opacity: 1, transform: 'none' },
			],
			{ duration: 700, delay: i * 90, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
		),
	);
}

const scenesFor = (total: number) => [
	{
		tool: 0,
		title: 'JSON Formatter',
		input: `{"name":"kodilo","tools":${total},"cloud":false}`,
		output: `{\n  "name": "kodilo",\n  "tools": ${total},\n  "cloud": false\n}`,
	},
	{ tool: 1, title: 'Base64', input: 'Nothing leaves your tab', output: 'Tm90aGluZyBsZWF2ZXMgeW91ciB0YWI=' },
	{ tool: 2, title: 'Color Converter', input: '#7c3aed', output: 'rgb(124 58 237)\nhsl(263 83% 58%)\noklch(54% 0.24 293)' },
	{ tool: 3, title: 'UUID Generator', input: 'v4 × 1', output: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
];

async function typeText(target: HTMLElement, text: string, per: number, alive: () => boolean) {
	target.textContent = '';
	for (let i = 1; i <= text.length; i++) {
		if (!alive()) return;
		target.textContent = text.slice(0, i);
		await wait(per);
	}
}

export function startStage() {
	const stage = document.getElementById('st');
	const frame = stage?.querySelector<HTMLElement>('.st-frame');
	if (!stage || !frame) return;
	const input = document.getElementById('st-in')!;
	const output = document.getElementById('st-out')!;
	const title = document.getElementById('st-title')!;
	const cursor = document.getElementById('st-cursor')!;
	const items = Array.from(stage.querySelectorAll<HTMLElement>('.st-side li'));
	const alive = () => stage.isConnected;
	const scenes = scenesFor(Number(stage.dataset.total) || 0);

	const show = (scene: ReturnType<typeof scenesFor>[number]) => {
		items.forEach((li, i) => li.classList.toggle('on', i === scene.tool));
		title.textContent = scene.title;
		input.textContent = scene.input;
		output.textContent = scene.output;
	};

	if (reduced()) return show(scenes[0]);

	frame.style.setProperty('--tilt', '6deg');
	const onScroll = () => {
		if (!alive()) return removeEventListener('scroll', onScroll);
		const r = frame.getBoundingClientRect();
		const p = Math.max(0, Math.min(1, 1 - (r.top - innerHeight * 0.2) / (innerHeight * 0.7)));
		frame.style.setProperty('--tilt', `${6 * (1 - p)}deg`);
		frame.style.setProperty('--scale', String(0.96 + 0.04 * p));
	};
	addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	let visible = false;
	new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.3 }).observe(stage);

	const moveTo = async (el: Element, dx = 0.5, dy = 0.5) => {
		const f = frame.getBoundingClientRect();
		const r = el.getBoundingClientRect();
		cursor.style.transform = `translate(${r.left - f.left + r.width * dx}px, ${r.top - f.top + r.height * dy}px) rotate(-45deg)`;
		await wait(750);
	};
	const tap = async () => {
		cursor.classList.add('tap');
		await wait(160);
		cursor.classList.remove('tap');
	};

	(async () => {
		let i = 0;
		while (alive()) {
			if (!visible || document.hidden) {
				await wait(400);
				continue;
			}
			const scene = scenes[i % scenes.length];
			await moveTo(items[scene.tool], 0.3, 0.5);
			await tap();
			items.forEach((li, k) => li.classList.toggle('on', k === scene.tool));
			title.textContent = scene.title;
			input.textContent = '';
			output.textContent = '';
			await moveTo(input, 0.3, 0.3);
			await tap();
			await typeText(input, scene.input, 45, alive);
			await wait(250);
			await moveTo(output, 0.6, 0.6);
			await typeText(output, scene.output, 18, alive);
			await wait(2200);
			i++;
		}
	})();
}
