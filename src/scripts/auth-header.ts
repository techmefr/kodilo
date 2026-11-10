import { base64UrlDecode } from './crypto';

export type Chip = { text: string; state: 'ok' | 'bad' | 'info' };

export type Parsed = {
	scheme: string;
	rows: [string, string][];
	chips: Chip[];
	json: string;
	error: string;
};

const EMPTY: Parsed = { scheme: '', rows: [], chips: [], json: '', error: '' };

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 31536000],
	['month', 2592000],
	['day', 86400],
	['hour', 3600],
	['minute', 60],
	['second', 1],
];

export function relative(seconds: number): string {
	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	const [unit, size] = UNITS.find(([, s]) => Math.abs(seconds) >= s) ?? UNITS[UNITS.length - 1];
	return rtf.format(Math.round(seconds / size), unit);
}

const decodeJson = (part: string) => JSON.parse(new TextDecoder().decode(base64UrlDecode(part)));

const CLAIMS: [string, string][] = [
	['iat', 'Issued'],
	['nbf', 'Not before'],
	['exp', 'Expires'],
];

function jwtChips(payload: Record<string, unknown>, now: number): { chips: Chip[]; rows: [string, string][] } {
	const chips: Chip[] = [];
	const rows: [string, string][] = [];
	CLAIMS.forEach(([claim, label]) => {
		const value = payload[claim];
		if (typeof value !== 'number') return;
		const iso = new Date(value * 1000).toISOString();
		rows.push([`${claim} (${label})`, `${iso} · ${relative(value - now)}`]);
		if (claim === 'exp') chips.push({ text: value < now ? 'Expired' : 'Valid, not expired', state: value < now ? 'bad' : 'ok' });
		if (claim === 'nbf' && value > now) chips.push({ text: 'Not yet valid', state: 'bad' });
	});
	return { chips, rows };
}

function parseBearer(token: string, now: number): Parsed {
	const parts = token.split('.');
	const base: Parsed = { ...EMPTY, scheme: 'Bearer', rows: [['Token length', `${token.length} characters`]] };
	if (parts.length !== 3) {
		return { ...base, chips: [{ text: 'Opaque token, not a JWT', state: 'info' }], rows: [...base.rows, ['Token', token]] };
	}
	try {
		const header = decodeJson(parts[0]);
		const payload = decodeJson(parts[1]);
		const { chips, rows } = jwtChips(payload, now);
		if (typeof header.alg === 'string')
			chips.push({ text: header.alg === 'none' ? 'alg none, unsigned' : `Signed with ${header.alg}`, state: header.alg === 'none' ? 'bad' : 'info' });
		return { ...base, rows: [...base.rows, ...rows], chips, json: JSON.stringify({ header, payload }, null, 2) };
	} catch {
		return { ...base, chips: [{ text: 'Looks like a JWT but is not valid base64url JSON', state: 'bad' }] };
	}
}

function decodeBase64(text: string): string {
	const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
	return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

function parseBasic(credentials: string): Parsed {
	try {
		const decoded = decodeBase64(credentials);
		const colon = decoded.indexOf(':');
		if (colon === -1) return { ...EMPTY, scheme: 'Basic', error: 'The decoded value has no colon between user and password.' };
		return {
			...EMPTY,
			scheme: 'Basic',
			rows: [
				['Username', decoded.slice(0, colon)],
				['Password', decoded.slice(colon + 1)],
			],
			chips: [{ text: 'Base64 is encoding, not encryption', state: 'info' }],
		};
	} catch {
		return { ...EMPTY, scheme: 'Basic', error: 'The credentials are not valid base64.' };
	}
}

const REQUIRED_DIGEST = ['username', 'realm', 'nonce', 'uri', 'response'];

function parseDigest(text: string): Parsed {
	const rows: [string, string][] = [];
	const pattern = /([a-z*-]+)\s*=\s*("(?:[^"\\]|\\.)*"|[^,\s]*)/gi;
	for (const match of text.matchAll(pattern)) {
		const value = match[2].startsWith('"') ? match[2].slice(1, -1).replace(/\\(.)/g, '$1') : match[2];
		rows.push([match[1].toLowerCase(), value]);
	}
	if (!rows.length) return { ...EMPTY, scheme: 'Digest', error: 'No key=value fields found.' };
	const names = rows.map(([key]) => key);
	const missing = REQUIRED_DIGEST.filter((key) => !names.includes(key));
	const chips: Chip[] = missing.length ? [{ text: `Missing: ${missing.join(', ')}`, state: 'bad' }] : [{ text: 'All required fields present', state: 'ok' }];
	const algorithm = rows.find(([key]) => key === 'algorithm')?.[1] ?? 'MD5 (default)';
	chips.push({ text: `Algorithm ${algorithm}`, state: 'info' });
	return { ...EMPTY, scheme: 'Digest', rows, chips };
}

export function parseAuth(value: string, now = Date.now() / 1000): Parsed {
	const text = value.trim().replace(/^authorization\s*:\s*/i, '');
	if (!text) return EMPTY;
	const match = text.match(/^(\S+)\s*([\s\S]*)$/);
	const scheme = match?.[1] ?? '';
	const rest = (match?.[2] ?? '').trim();
	switch (scheme.toLowerCase()) {
		case 'bearer':
			return rest ? parseBearer(rest, now) : { ...EMPTY, scheme: 'Bearer', error: 'The Bearer token is empty.' };
		case 'basic':
			return rest ? parseBasic(rest) : { ...EMPTY, scheme: 'Basic', error: 'The Basic credentials are empty.' };
		case 'digest':
			return parseDigest(rest);
		default:
			return { ...EMPTY, scheme, rows: [['Credentials', rest]], chips: [{ text: `Unrecognised scheme ${scheme}`, state: 'info' }] };
	}
}
