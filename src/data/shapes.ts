export type ShapePreset = { name: string; points?: string; css?: string };

export type MaskPreset = { name: string; css: string };

export const shapePresets: ShapePreset[] = [
	{ name: 'Triangle', points: '50% 0%, 0% 100%, 100% 100%' },
	{ name: 'Rhombus', points: '50% 0%, 100% 50%, 50% 100%, 0% 50%' },
	{ name: 'Pentagon', points: '50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%' },
	{ name: 'Hexagon', points: '25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%' },
	{ name: 'Octagon', points: '30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%' },
	{ name: 'Star', points: '50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%' },
	{ name: 'Arrow', points: '0% 35%, 60% 35%, 60% 10%, 100% 50%, 60% 90%, 60% 65%, 0% 65%' },
	{ name: 'Chevron', points: '75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%' },
	{ name: 'Cross', points: '35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%' },
	{ name: 'Message', points: '0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%' },
	{ name: 'Parallelogram', points: '25% 0%, 100% 0%, 75% 100%, 0% 100%' },
	{ name: 'Circle', css: 'circle(50% at 50% 50%)' },
	{ name: 'Ellipse', css: 'ellipse(50% 36% at 50% 50%)' },
	{ name: 'Rounded', css: 'inset(0% round {n}%)' },
];

export const maskPresets: MaskPreset[] = [
	{ name: 'Fade bottom', css: 'linear-gradient(to bottom, #000 calc(100% - {n}%), transparent)' },
	{ name: 'Fade top', css: 'linear-gradient(to top, #000 calc(100% - {n}%), transparent)' },
	{ name: 'Fade sides', css: 'linear-gradient(to right, transparent, #000 {n}%, #000 calc(100% - {n}%), transparent)' },
	{ name: 'Vignette', css: 'radial-gradient(circle at center, #000 calc(100% - {n}%), transparent 100%)' },
	{ name: 'Spotlight', css: 'radial-gradient(circle at 50% 50%, #000 0%, transparent {n}%)' },
	{ name: 'Diagonal', css: 'linear-gradient(135deg, #000 calc(100% - {n}%), transparent)' },
	{ name: 'Stripes', css: 'repeating-linear-gradient(90deg, #000 0 12px, transparent 12px 24px)' },
];
