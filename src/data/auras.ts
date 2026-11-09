export const blendModes = [
	'normal',
	'screen',
	'lighten',
	'overlay',
	'soft-light',
	'hard-light',
	'color-dodge',
	'multiply',
	'difference',
	'exclusion',
	'hue',
	'luminosity',
] as const;

export type BlendMode = (typeof blendModes)[number];

export type AuraLayer = { color: string; x: number; y: number; size: number; opacity: number; blend: BlendMode };

export type Aura = { name: string; base: string; layers: AuraLayer[] };

export const grainLayer = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E")`;

const layer = (color: string, x: number, y: number, size: number, opacity = 90, blend: BlendMode = 'screen'): AuraLayer => ({
	color,
	x,
	y,
	size,
	opacity,
	blend,
});

export const auras: Aura[] = [
	{ name: 'Dusk', base: '#0b0a1f', layers: [layer('#7c3aed', 20, 10, 60), layer('#ec4899', 85, 25, 55, 80), layer('#38bdf8', 55, 105, 70, 70)] },
	{ name: 'Aurora', base: '#04120f', layers: [layer('#10b981', 25, 0, 65), layer('#22d3ee', 80, 15, 55, 85), layer('#a78bfa', 50, 110, 60, 60)] },
	{ name: 'Ember', base: '#140806', layers: [layer('#f97316', 15, 100, 65), layer('#ef4444', 80, 90, 55, 85), layer('#facc15', 50, 0, 45, 50)] },
	{ name: 'Lagoon', base: '#03111c', layers: [layer('#0ea5e9', 10, 30, 60), layer('#14b8a6', 90, 70, 60, 85), layer('#6366f1', 60, -10, 50, 70)] },
	{ name: 'Orchid', base: '#160a1c', layers: [layer('#d946ef', 70, 0, 60), layer('#6366f1', 5, 80, 60, 80), layer('#fb7185', 100, 100, 45, 60)] },
	{
		name: 'Citrus',
		base: '#fffaf0',
		layers: [layer('#fb923c', 15, 15, 55, 70, 'multiply'), layer('#facc15', 90, 20, 55, 70, 'multiply'), layer('#f472b6', 55, 100, 60, 55, 'multiply')],
	},
	{
		name: 'Cloud',
		base: '#f6f8ff',
		layers: [layer('#93c5fd', 10, 10, 60, 80, 'multiply'), layer('#c4b5fd', 90, 30, 55, 70, 'multiply'), layer('#fbcfe8', 50, 105, 60, 80, 'multiply')],
	},
];

export function rgba(hex: string, opacity: number): string {
	const n = parseInt(hex.replace('#', ''), 16);
	return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${opacity / 100})`;
}

export function layerCss(l: AuraLayer): string {
	return `radial-gradient(${l.size}% ${l.size}% at ${l.x}% ${l.y}%, ${rgba(l.color, l.opacity)}, transparent)`;
}

export function auraCss(aura: Aura, grain = false): { background: string; blend: string } {
	const layers = aura.layers.map((l) => ({ image: layerCss(l), blend: l.blend }));
	if (grain) layers.unshift({ image: grainLayer, blend: 'overlay' });
	const base = aura.base === 'transparent' ? [] : [{ image: aura.base, blend: 'normal' as BlendMode }];
	const all = [...layers, ...base];
	return { background: all.map((l) => l.image).join(', '), blend: all.map((l) => l.blend).join(', ') };
}

export function auraDeclaration(aura: Aura, grain = false): string {
	const { background, blend } = auraCss(aura, grain);
	return `background: ${background};\nbackground-blend-mode: ${blend};`;
}
