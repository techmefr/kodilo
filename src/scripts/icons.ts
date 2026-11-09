import * as hugeicons from '@hugeicons/core-free-icons';
import { iconMap } from '../data/icon-map';

type Node = [tag: string, attrs: Record<string, string>];

const library = hugeicons as unknown as Record<string, Node[] | undefined>;
const cache = new Map<string, string>();

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function resolve(name: string): Node[] | undefined {
	const mapped = iconMap[name];
	if (mapped) return library[mapped];
	const direct = name.endsWith('Icon') ? name : `${name}Icon`;
	return library[direct];
}

function render(node: Node): string {
	const [tag, attrs] = node;
	const props = Object.entries(attrs)
		.filter(([key]) => key !== 'key')
		.map(([key, value]) => ` ${kebab(key)}="${value}"`)
		.join('');
	return `<${tag}${props}/>`;
}

function body(name: string): string {
	return (resolve(name) ?? []).map(render).join('');
}

export function icon(name: string): string {
	const cached = cache.get(name);
	if (cached !== undefined) return cached;
	const inner = body(name);
	const svg = inner ? `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none">${inner}</svg>` : '';
	cache.set(name, svg);
	return svg;
}

export function iconSymbol(name: string): string {
	return `<symbol id="i-${name}" viewBox="0 0 24 24" fill="none">${body(name)}</symbol>`;
}

const sprite = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}icons.svg`;

export const iconUse = (name: string) => `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="${sprite}#i-${name}"></use></svg>`;
