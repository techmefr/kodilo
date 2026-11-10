export type EscapeFormat = 'js' | 'jsbrace' | 'uplus' | 'hexref' | 'decref' | 'entity' | 'hex';

const hex = (n: number, pad = 4) => n.toString(16).toUpperCase().padStart(pad, '0');

const NAMED: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	' ': '&nbsp;',
	'©': '&copy;',
	'®': '&reg;',
	'™': '&trade;',
	'€': '&euro;',
	'£': '&pound;',
	'…': '&hellip;',
	'—': '&mdash;',
	'–': '&ndash;',
};

const REVERSE: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	copy: '©',
	reg: '®',
	trade: '™',
	euro: '€',
	pound: '£',
	hellip: '…',
	mdash: '—',
	ndash: '–',
};

const SPACED: EscapeFormat[] = ['uplus', 'hex'];

function escapePoint(ch: string, format: EscapeFormat): string {
	const cp = ch.codePointAt(0) as number;
	switch (format) {
		case 'js':
			return Array.from({ length: ch.length }, (_, i) => `\\u${hex(ch.charCodeAt(i))}`).join('');
		case 'jsbrace':
			return `\\u{${hex(cp, 1)}}`;
		case 'uplus':
			return `U+${hex(cp)}`;
		case 'hexref':
			return `&#x${hex(cp, 1)};`;
		case 'decref':
			return `&#${cp};`;
		default:
			return NAMED[ch] ?? (cp < 128 ? ch : `&#x${hex(cp, 1)};`);
	}
}

export function encode(text: string, format: EscapeFormat, onlyNonAscii: boolean): string {
	if (format === 'hex') {
		return Array.from(new TextEncoder().encode(text), (b) => hex(b, 2)).join(' ');
	}
	const keepAscii = onlyNonAscii && !SPACED.includes(format) && format !== 'entity';
	const parts = Array.from(text, (ch) => ((ch.codePointAt(0) as number) < 128 && keepAscii ? ch : escapePoint(ch, format)));
	return parts.join(SPACED.includes(format) ? ' ' : '');
}

const fromCode = (code: number) => (code <= 0x10ffff ? String.fromCodePoint(code) : '�');

export function decode(text: string, format: EscapeFormat): string {
	if (format === 'hex') {
		const bytes = text.match(/[0-9a-fA-F]{2}/g) ?? [];
		return new TextDecoder().decode(Uint8Array.from(bytes, (b) => parseInt(b, 16)));
	}
	return text
		.replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, h) => fromCode(parseInt(h, 16)))
		.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
		.replace(/U\+([0-9a-fA-F]{4,6})/gi, (_, h) => fromCode(parseInt(h, 16)))
		.replace(/&#[xX]([0-9a-fA-F]+);/g, (_, h) => fromCode(parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d) => fromCode(parseInt(d, 10)))
		.replace(/&([a-zA-Z]+);/g, (m, name) => REVERSE[name] ?? m);
}
