const PLAIN = /^[A-Za-z_][\w .\/-]*$/;
const RESERVED = /^(true|false|yes|no|on|off|null|~|y|n)$/i;

export function scalar(value: unknown): string {
	if (value === null) return 'null';
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	const s = String(value);
	if (s === '' || RESERVED.test(s) || /^[\d.+-]/.test(s) || !PLAIN.test(s) || /\s$/.test(s)) return JSON.stringify(s);
	return s;
}

const key = (k: string) => (PLAIN.test(k) && !RESERVED.test(k) ? k : JSON.stringify(k));

export function toYaml(value: unknown, indent = 2, level = 0): string {
	const pad = ' '.repeat(indent * level);
	if (Array.isArray(value)) {
		if (!value.length) return '[]';
		return value
			.map((item) => {
				if (item && typeof item === 'object' && Object.keys(item).length) {
					const inner = toYaml(item, indent, level + 1).replace(/^\s+/, '');
					return `${pad}- ${inner}`;
				}
				return `${pad}- ${toYaml(item, indent, level + 1)}`;
			})
			.join('\n');
	}
	if (value && typeof value === 'object') {
		const entries = Object.entries(value);
		if (!entries.length) return '{}';
		return entries
			.map(([k, v]) => {
				if (v && typeof v === 'object' && Object.keys(v).length) return `${pad}${key(k)}:\n${toYaml(v, indent, level + 1)}`;
				if (typeof v === 'string' && v.includes('\n')) return `${pad}${key(k)}: |\n${v.split('\n').map((l) => `${pad}${' '.repeat(indent)}${l}`).join('\n')}`;
				return `${pad}${key(k)}: ${toYaml(v, indent, level + 1)}`;
			})
			.join('\n');
	}
	return scalar(value);
}
