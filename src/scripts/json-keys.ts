export function sortKeys(value: unknown, descending: boolean): unknown {
	if (Array.isArray(value)) return value.map((v) => sortKeys(v, descending));
	if (value && typeof value === 'object') {
		const keys = Object.keys(value).sort((a, b) => (descending ? b.localeCompare(a) : a.localeCompare(b)));
		return Object.fromEntries(keys.map((k) => [k, sortKeys((value as Record<string, unknown>)[k], descending)]));
	}
	return value;
}

export function keyPaths(value: unknown, prefix = ''): string[] {
	if (Array.isArray(value)) return value.flatMap((v, i) => keyPaths(v, `${prefix}[${i}]`));
	if (value && typeof value === 'object') {
		return Object.entries(value).flatMap(([k, v]) => {
			const path = prefix ? `${prefix}.${k}` : k;
			return [path, ...keyPaths(v, path)];
		});
	}
	return [];
}

export function valuesOfKey(value: unknown, key: string): unknown[] {
	if (Array.isArray(value)) return value.flatMap((v) => valuesOfKey(v, key));
	if (value && typeof value === 'object') {
		return Object.entries(value).flatMap(([k, v]) => [...(k === key ? [v] : []), ...valuesOfKey(v, key)]);
	}
	return [];
}
