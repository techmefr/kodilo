export type Oklch = { l: number; c: number; h: number };
export type Rgb = [number, number, number];

const toLinear = (v: number) => {
	const a = Math.abs(v);
	return a <= 0.04045 ? v / 12.92 : Math.sign(v) * ((a + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (v: number) => {
	const a = Math.abs(v);
	return a <= 0.0031308 ? v * 12.92 : Math.sign(v) * (1.055 * a ** (1 / 2.4) - 0.055);
};

export function toOklab({ l, c, h }: Oklch): Rgb {
	const rad = (h * Math.PI) / 180;
	return [l, c * Math.cos(rad), c * Math.sin(rad)];
}

function oklabToLinear([L, a, b]: Rgb): Rgb {
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	];
}

function linearToOklch([r, g, b]: Rgb): Oklch {
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
	const c = Math.hypot(A, B);
	const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
	return { l: L, c, h };
}

export const srgb = (o: Oklch): Rgb => oklabToLinear(toOklab(o)).map(fromLinear) as Rgb;

export function p3(o: Oklch): Rgb {
	const [r, g, b] = oklabToLinear(toOklab(o));
	return [0.8224621 * r + 0.177538 * g, 0.0331941 * r + 0.9668058 * g, 0.0170827 * r + 0.0723974 * g + 0.9105199 * b].map(fromLinear) as Rgb;
}

const within = (rgb: Rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);
export const inSrgb = (o: Oklch) => within(srgb(o));
export const inP3 = (o: Oklch) => within(p3(o));

export function mapToSrgb(o: Oklch): Oklch {
	if (inSrgb(o)) return o;
	let lo = 0;
	let hi = o.c;
	for (let i = 0; i < 24; i++) {
		const mid = (lo + hi) / 2;
		if (inSrgb({ ...o, c: mid })) lo = mid;
		else hi = mid;
	}
	return { ...o, c: lo };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function rgb255(o: Oklch): Rgb {
	return srgb(mapToSrgb(o)).map((v) => Math.round(clamp01(v) * 255)) as Rgb;
}

export const toHex = (o: Oklch) =>
	`#${rgb255(o)
		.map((v) => v.toString(16).padStart(2, '0'))
		.join('')}`;

export function parseHex(hex: string): Rgb | null {
	const m = hex.trim().replace(/^#/, '');
	const full = m.length === 3 ? [...m].map((ch) => ch + ch).join('') : m;
	if (!/^[0-9a-f]{6}$/i.test(full)) return null;
	const n = parseInt(full, 16);
	return [n >> 16, (n >> 8) & 255, n & 255];
}

export function fromHex(hex: string): Oklch | null {
	const rgb = parseHex(hex);
	return rgb ? linearToOklch(rgb.map((v) => toLinear(v / 255)) as Rgb) : null;
}

const trim = (v: number, digits: number) => String(Number(v.toFixed(digits)));

export const formatOklch = (o: Oklch) => `oklch(${trim(o.l * 100, 1)}% ${trim(o.c, 3)} ${trim(o.h, 1)})`;

export function formatOklab(o: Oklch) {
	const [L, a, b] = toOklab(o);
	return `oklab(${trim(L * 100, 1)}% ${trim(a, 3)} ${trim(b, 3)})`;
}

export function formatRgb(o: Oklch) {
	const [r, g, b] = rgb255(o);
	return `rgb(${r} ${g} ${b})`;
}

export function formatHsl(o: Oklch) {
	const [r, g, b] = rgb255(o).map((v) => v / 255);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	const d = max - min;
	let h = 0;
	if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
	return `hsl(${Math.round((h * 60 + 360) % 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

export function formatP3(o: Oklch) {
	const [r, g, b] = p3(o).map((v) => trim(clamp01(v), 4));
	return `color(display-p3 ${r} ${g} ${b})`;
}

const luminance = (hex: string) => {
	const [r, g, b] = (parseHex(hex) ?? [0, 0, 0]).map((v) => toLinear(v / 255));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function contrast(a: string, b: string) {
	const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
	return (x + 0.05) / (y + 0.05);
}
