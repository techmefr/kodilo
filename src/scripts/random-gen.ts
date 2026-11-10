import { randomIndex } from './crypto';

export const NANO_ALPHABET = '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const CHARSETS: Record<string, string> = {
	alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
	letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	lower: 'abcdefghijklmnopqrstuvwxyz',
	upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	digits: '0123456789',
	hex: '0123456789abcdef',
	symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

export const clamp = (value: number, min: number, max: number, fallback: number) => {
	const n = Number.isFinite(value) ? Math.trunc(value) : fallback;
	return Math.min(max, Math.max(min, n));
};

export function randomString(alphabet: string, length: number, count: number): string[] {
	const symbols = Array.from(new Set(Array.from(alphabet)));
	if (symbols.length === 0) return [];
	return Array.from({ length: count }, () => Array.from({ length }, () => symbols[randomIndex(symbols.length)]).join(''));
}

function randomFraction(): number {
	const buffer = new Uint32Array(2);
	crypto.getRandomValues(buffer);
	return (buffer[0] * 2 ** 21 + (buffer[1] >>> 11)) / 2 ** 53;
}

export interface NumberOptions {
	min: number;
	max: number;
	integer: boolean;
	count: number;
	unique: boolean;
	decimals: number;
}

export function randomNumbers(options: NumberOptions): { values: string[]; error: string } {
	const { min, max, integer, count, unique, decimals } = options;
	if (!Number.isFinite(min) || !Number.isFinite(max)) return { values: [], error: 'Enter a minimum and a maximum.' };
	if (min > max) return { values: [], error: 'Minimum must not exceed maximum.' };
	if (integer) {
		const low = Math.ceil(min);
		const span = Math.floor(max) - low + 1;
		if (span < 1) return { values: [], error: 'No integer lies in this range.' };
		if (unique && count > span) return { values: [], error: `Only ${span} unique integers fit in this range.` };
		const seen = new Set<number>();
		const values: number[] = [];
		while (values.length < count) {
			const value = low + (span <= 2 ** 32 ? randomIndex(span) : Math.floor(randomFraction() * span));
			if (unique && seen.has(value)) continue;
			seen.add(value);
			values.push(value);
		}
		return { values: values.map(String), error: '' };
	}
	const values = Array.from({ length: count }, () => (min + randomFraction() * (max - min)).toFixed(decimals));
	return { values: unique ? Array.from(new Set(values)) : values, error: '' };
}
