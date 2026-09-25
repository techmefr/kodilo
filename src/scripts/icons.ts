const modules = import.meta.glob('/node_modules/lucide-static/icons/*.svg', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

const cache = new Map<string, string>();

export function icon(name: string): string {
	const cached = cache.get(name);
	if (cached !== undefined) return cached;
	const svg = (modules[`/node_modules/lucide-static/icons/${name}.svg`] ?? '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\s+/g, ' ')
		.replace(/> </g, '><')
		.replace(/ class="[^"]*"/, ' aria-hidden="true"')
		.trim();
	cache.set(name, svg);
	return svg;
}

export function iconSymbol(name: string): string {
	return icon(name)
		.replace(
			/^<svg[^>]*>/,
			`<symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`,
		)
		.replace(/<\/svg>$/, '</symbol>');
}

const sprite = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}icons.svg`;

export const iconUse = (name: string) => `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="${sprite}#i-${name}"></use></svg>`;
