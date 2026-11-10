export type Options = { ignoreCase: boolean; ignoreWhitespace: boolean };

export type Comparison = {
	equal: boolean;
	firstDiff: number;
	diffCount: number;
	lengthA: number;
	lengthB: number;
	diffs: boolean[];
};

const HEX_LENGTHS: Record<number, string> = {
	8: 'CRC-32',
	32: 'MD5, MD4 or NTLM',
	40: 'SHA-1 or RIPEMD-160',
	56: 'SHA-224 or SHA3-224',
	64: 'SHA-256, SHA3-256 or BLAKE2s',
	96: 'SHA-384 or SHA3-384',
	128: 'SHA-512, SHA3-512 or BLAKE2b',
};

const BASE64_LENGTHS: Record<number, string> = {
	24: 'MD5 (base64)',
	28: 'SHA-1 (base64)',
	44: 'SHA-256 (base64)',
	64: 'SHA-384 (base64)',
	88: 'SHA-512 (base64)',
};

export function normalize(text: string, options: Options): string {
	let value = options.ignoreWhitespace ? text.replace(/\s+/g, '') : text.trim();
	if (/^(?:[0-9a-f]{2}[:-])+[0-9a-f]{2}$/i.test(value)) value = value.replace(/[:-]/g, '');
	value = value.replace(/^0x/i, '');
	return options.ignoreCase ? value.toLowerCase() : value;
}

export function identify(hash: string): string {
	if (!hash) return '';
	if (/^[0-9a-f]+$/i.test(hash)) return HEX_LENGTHS[hash.length] ?? 'Unknown length';
	if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(hash)) return BASE64_LENGTHS[hash.length] ?? 'Unknown length';
	return 'Not a hex or base64 digest';
}

export function compare(a: string, b: string): Comparison {
	const size = Math.max(a.length, b.length);
	const diffs: boolean[] = [];
	let accumulated = a.length ^ b.length;
	let firstDiff = -1;
	for (let i = 0; i < size; i++) {
		const delta = (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
		const differs = delta !== 0 || i >= Math.min(a.length, b.length);
		diffs.push(differs);
		if (differs && firstDiff === -1) firstDiff = i;
		accumulated |= delta;
	}
	return { equal: accumulated === 0, firstDiff, diffCount: diffs.filter(Boolean).length, lengthA: a.length, lengthB: b.length, diffs };
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
	const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as BufferSource));
	return Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('');
}
