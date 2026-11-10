export type CleanOp = 'trim' | 'blank' | 'dupLines' | 'dupWords' | 'sort' | 'reverseLines' | 'reverseText';

export interface Counts {
	characters: number;
	words: number;
	lines: number;
}

export function countText(text: string): Counts {
	const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
	return { characters: Array.from(text).length, words, lines: text === '' ? 0 : text.split('\n').length };
}

const dedupe = (items: string[]) => Array.from(new Set(items));

export function cleanText(text: string, ops: ReadonlySet<CleanOp>): string {
	let lines = text.replace(/\r\n?/g, '\n').split('\n');
	if (ops.has('trim')) lines = lines.map((l) => l.split(/\s+/).join(' ').trim());
	if (ops.has('blank')) lines = lines.filter((l) => l.trim() !== '');
	if (ops.has('dupWords')) lines = lines.map((l) => dedupe(l.split(' ')).join(' '));
	if (ops.has('dupLines')) lines = dedupe(lines);
	if (ops.has('sort')) lines = [...lines].sort((a, b) => a.localeCompare(b));
	if (ops.has('reverseLines')) lines = [...lines].reverse();
	const joined = lines.join('\n');
	return ops.has('reverseText') ? Array.from(joined).reverse().join('') : joined;
}
