import { motionPaused, setupMotionToggle, whileMotionPaused } from './motion';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const alive = (el: Element) => el.isConnected;

export function reveal(selector: string) {
	const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
	if (reduced() || !('IntersectionObserver' in window)) {
		items.forEach((el) => el.classList.add('in'));
		return;
	}
	const io = new IntersectionObserver(
		(entries) =>
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('in');
				io.unobserve(entry.target);
			}),
		{ threshold: 0.15 },
	);
	items.forEach((el) => io.observe(el));
}

function countUp(el: HTMLElement) {
	const target = Number(el.dataset.count);
	if (reduced() || !target) return;
	const start = performance.now();
	const step = (now: number) => {
		const t = Math.min(1, (now - start) / 1100);
		el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
		if (t < 1 && alive(el)) requestAnimationFrame(step);
	};
	el.textContent = '0';
	requestAnimationFrame(step);
}

export function startHero() {
	setupMotionToggle();
	reveal('.lp-hero .lp-stats li');
	document.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
	const verb = document.getElementById('lp-verb');
	if (!verb || reduced()) return;
	const words = ['Format', 'Decode', 'Convert', 'Compare', 'Generate', 'Inspect'];
	let i = 0;
	const timer = setInterval(() => {
		if (!alive(verb)) return clearInterval(timer);
		if (motionPaused()) return;
		verb.classList.add('out');
		setTimeout(() => {
			i = (i + 1) % words.length;
			verb.textContent = words[i];
			verb.classList.remove('out');
		}, 260);
	}, 2200);
}

interface Scene {
	input: string;
	output: (typed: string) => string;
}

const scenes: Record<string, Scene> = {
	json: {
		input: '{"name":"kodilo","tools":236,"offline":true,"tags":["json","jwt","hash"]}',
		output: (typed) => {
			try {
				return JSON.stringify(JSON.parse(typed), null, 2);
			} catch {
				return '';
			}
		},
	},
	mask: {
		input: 'Deploy failed: key sk_live_4f9a2c7e was rejected for maria.lopez@acme.dev',
		output: (typed) => typed.replace(/sk_live_[a-z0-9]+/g, '[API_KEY_1]').replace(/[\w.]+@[\w.]+\.\w+/g, '[EMAIL_1]'),
	},
	hash: {
		input: 'hello kodilo',
		output: () => '',
	},
};

async function sha256(text: string) {
	const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
	return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function play(card: HTMLElement, scene: Scene, name: string) {
	const input = card.querySelector<HTMLElement>('[data-role="in"]')!;
	const output = card.querySelector<HTMLElement>('[data-role="out"]')!;
	while (alive(card)) {
		input.textContent = '';
		output.textContent = '';
		for (let n = 1; n <= scene.input.length; n++) {
			if (!alive(card)) return;
			await whileMotionPaused();
			const typed = scene.input.slice(0, n);
			input.textContent = typed;
			if (name === 'hash') output.textContent = n % 3 === 0 || n === scene.input.length ? await sha256(typed) : output.textContent;
			else output.textContent = scene.output(typed);
			await wait(name === 'json' ? 22 : 38);
		}
		await wait(3200);
		await whileMotionPaused();
	}
}

export function startDemos() {
	reveal('.lp-card');
	document.querySelectorAll<HTMLElement>('[data-demo]').forEach((card) => {
		const name = card.dataset.demo ?? '';
		const scene = scenes[name];
		if (!scene) return;
		if (reduced()) {
			card.querySelector('[data-role="in"]')!.textContent = scene.input;
			card.querySelector('[data-role="out"]')!.textContent = name === 'hash' ? '' : scene.output(scene.input);
			return;
		}
		const io = new IntersectionObserver((entries) => {
			if (!entries[0].isIntersecting) return;
			io.disconnect();
			play(card, scene, name);
		});
		io.observe(card);
	});
}

export function startProof() {
	reveal('.lp-features li, .lp-privacy .lp-reveal');
	const net = document.getElementById('lp-net');
	if (!net || reduced()) return;
	const ops = net.querySelector<HTMLElement>('[data-net="ops"]')!;
	let count = 0;
	const timer = setInterval(() => {
		if (!alive(net)) return clearInterval(timer);
		if (motionPaused()) return;
		count += 1 + Math.floor(Math.random() * 3);
		ops.textContent = String(count);
	}, 900);
}
