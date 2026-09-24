export function shellSplit(input: string): string[] {
	const text = input.replace(/\\\r?\n/g, ' ');
	const out: string[] = [];
	let current = '';
	let has = false;
	let quote: string | null = null;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (quote) {
			if (c === quote) quote = null;
			else if (c === '\\' && quote === '"' && i + 1 < text.length) current += text[++i];
			else current += c;
		} else if (c === '"' || c === "'") {
			quote = c;
			has = true;
		} else if (c === '\\' && i + 1 < text.length) {
			current += text[++i];
			has = true;
		} else if (/\s/.test(c)) {
			if (has || current) out.push(current);
			current = '';
			has = false;
		} else {
			current += c;
		}
	}
	if (quote) throw new Error('Unclosed quote.');
	if (has || current) out.push(current);
	return out;
}
