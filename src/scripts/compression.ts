export type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw';
export type ByteEncoding = 'base64' | 'hex';

const CHUNK_SIZE = 0x8000;

async function run(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
	const output = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
	return new Uint8Array(await new Response(output).arrayBuffer());
}

export const compress = (bytes: Uint8Array, format: CompressionFormat): Promise<Uint8Array> => run(bytes, new CompressionStream(format));

export const decompress = (bytes: Uint8Array, format: CompressionFormat): Promise<Uint8Array> => run(bytes, new DecompressionStream(format));

export function encodeBytes(bytes: Uint8Array, encoding: ByteEncoding): string {
	if (encoding === 'hex') return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
	let binary = '';
	for (let i = 0; i < bytes.length; i += CHUNK_SIZE) binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
	return btoa(binary);
}

export function decodeBytes(text: string, encoding: ByteEncoding): Uint8Array {
	const clean = text.replace(/\s+/g, '');
	if (encoding === 'hex') {
		if (clean.length % 2 !== 0 || /[^0-9a-f]/i.test(clean)) throw new Error('Not valid hex');
		return Uint8Array.from(clean.match(/../g) ?? [], (pair) => parseInt(pair, 16));
	}
	const normalized = clean.replace(/-/g, '+').replace(/_/g, '/');
	try {
		return Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
	} catch {
		throw new Error('Not valid Base64');
	}
}

export function formatRatio(original: number, compressed: number): string {
	if (!original) return '-';
	const saved = ((original - compressed) / original) * 100;
	return saved >= 0 ? `${saved.toFixed(1)}% smaller` : `${Math.abs(saved).toFixed(1)}% larger`;
}
