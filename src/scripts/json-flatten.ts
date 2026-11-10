type Flat = Record<string, string>;

function flatten(value: unknown, prefix: string, out: Flat) {
	if (Array.isArray(value)) {
		if (value.every((v) => v === null || typeof v !== 'object')) out[prefix] = value.join(', ');
		else value.forEach((v, i) => flatten(v, `${prefix}.${i}`, out));
	} else if (value && typeof value === 'object') {
		const entries = Object.entries(value);
		if (!entries.length) out[prefix] = '';
		entries.forEach(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k, out));
	} else out[prefix] = value === null || value === undefined ? '' : String(value);
}

export function tableFromJson(data: unknown): string[][] {
	const items = Array.isArray(data) ? data : [data];
	const flats = items.map((item) => {
		const out: Flat = {};
		flatten(item, '', out);
		return out;
	});
	const columns = [...new Set(flats.flatMap((f) => Object.keys(f)))];
	return [columns, ...flats.map((f) => columns.map((c) => f[c] ?? ''))];
}
