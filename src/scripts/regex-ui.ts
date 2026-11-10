import { KINDS, QUANTIFIERS, type MatchInfo, type Part } from './regex-builder';

const select = (label: string, options: [string, string][], value: string, on: (v: string) => void) => {
	const el = document.createElement('select');
	el.className = 'num';
	el.setAttribute('aria-label', label);
	options.forEach(([v, text]) => el.append(new Option(text, v)));
	el.value = value;
	el.addEventListener('change', () => on(el.value));
	return el;
};

const field = (label: string, value: string, type: string, on: (v: string) => void) => {
	const el = document.createElement('input');
	el.className = 'num';
	el.type = type;
	el.value = value;
	el.spellcheck = false;
	el.setAttribute('aria-label', label);
	el.addEventListener('input', () => on(el.value));
	return el;
};

export function partRow(parts: Part[], index: number, relayout: () => void, update: () => void): HTMLElement {
	const part = parts[index];
	const n = index + 1;
	const row = document.createElement('div');
	row.className = 'rg-part';
	const remove = document.createElement('button');
	remove.className = 'btn';
	remove.textContent = 'Remove';
	remove.setAttribute('aria-label', `Remove part ${n}`);
	remove.addEventListener('click', () => {
		parts.splice(index, 1);
		relayout();
	});
	const numeric = part.quantifier === 'exact' || part.quantifier === 'range';
	row.append(
		select(`Part ${n} type`, KINDS, part.kind, (v) => ((part.kind = v as Part['kind']), relayout())),
		...(['starts', 'ends', 'text'].includes(part.kind) ? [field(`Part ${n} text`, part.text, 'text', (v) => ((part.text = v), update()))] : []),
		select(`Part ${n} repeat`, QUANTIFIERS, part.quantifier, (v) => ((part.quantifier = v as Part['quantifier']), relayout())),
		...(numeric ? [field(`Part ${n} minimum`, String(part.min), 'number', (v) => ((part.min = Number(v) || 0), update()))] : []),
		...(part.quantifier === 'range' ? [field(`Part ${n} maximum`, String(part.max), 'number', (v) => ((part.max = Number(v) || 0), update()))] : []),
		remove,
	);
	return row;
}

export function highlight(text: string, matches: MatchInfo[]): Node[] {
	const nodes: Node[] = [];
	let cursor = 0;
	matches.forEach((m) => {
		if (!m.text) return;
		nodes.push(document.createTextNode(text.slice(cursor, m.index)));
		const mark = document.createElement('mark');
		mark.textContent = m.text;
		nodes.push(mark);
		cursor = m.index + m.text.length;
	});
	nodes.push(document.createTextNode(text.slice(cursor)));
	return nodes;
}
