export type Encoding = 'hex' | 'base64';

export function encodeBytes(bytes: Uint8Array, encoding: Encoding): string {
	if (encoding === 'hex') return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
	let binary = '';
	bytes.forEach((b) => (binary += String.fromCharCode(b)));
	return btoa(binary);
}

export function base64UrlDecode(input: string): Uint8Array {
	let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
	while (normalized.length % 4) normalized += '=';
	return Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0));
}

export function randomIndex(max: number): number {
	const limit = Math.floor(0x100000000 / max) * max;
	const buffer = new Uint32Array(1);
	do crypto.getRandomValues(buffer);
	while (buffer[0] >= limit);
	return buffer[0] % max;
}

export function md5(bytes: Uint8Array): Uint8Array {
	const s = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
	const k = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);
	const length = bytes.length;
	const padded = new Uint8Array((((length + 8) >>> 6) + 1) * 64);
	padded.set(bytes);
	padded[length] = 0x80;
	const view = new DataView(padded.buffer);
	view.setUint32(padded.length - 8, (length * 8) >>> 0, true);
	view.setUint32(padded.length - 4, Math.floor(length / 0x20000000), true);
	let a0 = 0x67452301;
	let b0 = 0xefcdab89;
	let c0 = 0x98badcfe;
	let d0 = 0x10325476;
	for (let chunk = 0; chunk < padded.length; chunk += 64) {
		let [a, b, c, d] = [a0, b0, c0, d0];
		for (let i = 0; i < 64; i++) {
			let f: number;
			let g: number;
			if (i < 16) [f, g] = [(b & c) | (~b & d), i];
			else if (i < 32) [f, g] = [(d & b) | (~d & c), (5 * i + 1) % 16];
			else if (i < 48) [f, g] = [b ^ c ^ d, (3 * i + 5) % 16];
			else [f, g] = [c ^ (b | ~d), (7 * i) % 16];
			const sum = (a + f + k[i] + view.getUint32(chunk + g * 4, true)) >>> 0;
			const shift = s[(i >>> 4) * 4 + (i % 4)];
			[a, d, c] = [d, c, b];
			b = (b + ((sum << shift) | (sum >>> (32 - shift)))) >>> 0;
		}
		a0 = (a0 + a) >>> 0;
		b0 = (b0 + b) >>> 0;
		c0 = (c0 + c) >>> 0;
		d0 = (d0 + d) >>> 0;
	}
	const out = new DataView(new ArrayBuffer(16));
	[a0, b0, c0, d0].forEach((v, i) => out.setUint32(i * 4, v, true));
	return new Uint8Array(out.buffer);
}
