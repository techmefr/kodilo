export type PartKind = 'starts' | 'ends' | 'text' | 'digits' | 'letters' | 'word' | 'space' | 'any';

export type Quantifier = 'one' | 'plus' | 'star' | 'optional' | 'exact' | 'range';

export type Part = { kind: PartKind; text: string; quantifier: Quantifier; min: number; max: number };

export const KINDS: [PartKind, string][] = [
	['starts', 'Starts with text'],
	['text', 'Text'],
	['digits', 'Digits'],
	['letters', 'Letters'],
	['word', 'Word characters'],
	['space', 'Whitespace'],
	['any', 'Any character'],
	['ends', 'Ends with text'],
];

export const QUANTIFIERS: [Quantifier, string][] = [
	['one', 'Exactly once'],
	['plus', 'One or more'],
	['star', 'Zero or more'],
	['optional', 'Optional'],
	['exact', 'Exactly N'],
	['range', 'N to M'],
];

const CLASSES: Partial<Record<PartKind, string>> = { digits: '\\d', letters: '[A-Za-z]', word: '\\w', space: '\\s', any: '.' };

export const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

function quantify(unit: string, part: Part): string {
	switch (part.quantifier) {
		case 'plus':
			return `${unit}+`;
		case 'star':
			return `${unit}*`;
		case 'optional':
			return `${unit}?`;
		case 'exact':
			return `${unit}{${part.min}}`;
		case 'range':
			return `${unit}{${part.min},${part.max}}`;
		default:
			return unit;
	}
}

export function buildPattern(parts: Part[]): string {
	return parts
		.map((part) => {
			const cls = CLASSES[part.kind];
			const literal = escapeRegex(part.text);
			const unit = cls ?? (part.quantifier === 'one' || literal.length <= 1 ? literal : `(?:${literal})`);
			const body = quantify(unit, part);
			if (part.kind === 'starts') return `^${body}`;
			if (part.kind === 'ends') return `${body}$`;
			return body;
		})
		.join('');
}

const PYTHON_FLAGS: Record<string, string> = { i: 're.IGNORECASE', m: 're.MULTILINE', s: 're.DOTALL' };

function pythonString(source: string): string {
	if (!source.includes('"') && !source.endsWith('\\')) return `r"${source}"`;
	if (!source.includes("'") && !source.endsWith('\\')) return `r'${source}'`;
	return JSON.stringify(source);
}

export type Language = 'js' | 'python' | 'php';

export function formatLiteral(source: string, flags: string, language: Language): string {
	if (language === 'js') return `/${source.replace(/(?<!\\)\//g, '\\/')}/${flags}`;
	if (language === 'python') {
		const mapped = [...flags].map((f) => PYTHON_FLAGS[f]).filter(Boolean);
		return `re.compile(${[pythonString(source), ...(mapped.length ? [mapped.join(' | ')] : [])].join(', ')})`;
	}
	const phpFlags = [...flags].filter((f) => 'imsu'.includes(f)).join('');
	const escaped = source.replace(/(?<!\\)\//g, '\\/').replace(/'/g, "\\'");
	return `'/${escaped}/${phpFlags}'`;
}

export type MatchInfo = { index: number; text: string };

export function findMatches(source: string, flags: string, text: string): { matches: MatchInfo[]; error: string } {
	try {
		const expression = new RegExp(source, flags.includes('g') ? flags : `${flags}g`);
		const matches: MatchInfo[] = [];
		for (const m of text.matchAll(expression)) {
			matches.push({ index: m.index ?? 0, text: m[0] });
			if (matches.length >= 1000) break;
		}
		return { matches, error: '' };
	} catch (e) {
		return { matches: [], error: (e as Error).message };
	}
}

export const BUILDER_SAMPLE = ['INV-2026', 'INV-12', 'INV-123456'].join('\n');

export const DEFAULT_PARTS: Part[] = [
	{ kind: 'starts', text: 'INV-', quantifier: 'one', min: 1, max: 3 },
	{ kind: 'digits', text: '', quantifier: 'range', min: 4, max: 6 },
];

export const FLAGS = [
	['g', 'Global'],
	['i', 'Ignore case'],
	['m', 'Multiline'],
	['s', 'Dot all'],
	['u', 'Unicode'],
];
