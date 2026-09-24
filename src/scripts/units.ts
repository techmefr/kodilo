export const BYTE_UNITS: [string, number][] = [
	['B', 1],
	['KB', 1e3],
	['MB', 1e6],
	['GB', 1e9],
	['TB', 1e12],
	['PB', 1e15],
	['KiB', 1024],
	['MiB', 1024 ** 2],
	['GiB', 1024 ** 3],
	['TiB', 1024 ** 4],
	['PiB', 1024 ** 5],
];

export function parseBytes(text: string): number | null {
	const match = text.trim().replace(/,/g, '.').match(/^(\d+(?:\.\d+)?(?:e\d+)?)\s*([a-z]*)$/i);
	if (!match) return null;
	const unit = match[2] || 'B';
	const found = BYTE_UNITS.find(([u]) => u.toLowerCase() === unit.toLowerCase() || u.toLowerCase() === `${unit}b`.toLowerCase());
	return found ? Number(match[1]) * found[1] : null;
}

export function formatNumber(n: number, digits = 4): string {
	if (!Number.isFinite(n)) return '—';
	if (n !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-4)) return n.toExponential(3);
	return Number(n.toPrecision(digits + 4)).toLocaleString('en', { maximumFractionDigits: digits });
}

export function formatDuration(seconds: number): string {
	if (!Number.isFinite(seconds)) return '—';
	if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
	const units: [string, number][] = [
		['d', 86400],
		['h', 3600],
		['min', 60],
		['s', 1],
	];
	const parts: string[] = [];
	let rest = Math.round(seconds);
	for (const [label, size] of units) {
		if (rest >= size) {
			parts.push(`${Math.floor(rest / size)} ${label}`);
			rest %= size;
		}
		if (parts.length === 2) break;
	}
	return parts.join(' ') || '0 s';
}
