type Json = Record<string, unknown>;

const FORMATS: [string, RegExp][] = [
	['date-time', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/],
	['date', /^\d{4}-\d{2}-\d{2}$/],
	['email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/],
	['uri', /^[a-z][a-z0-9+.-]*:\/\/\S+$/i],
	['uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i],
	['ipv4', /^(\d{1,3}\.){3}\d{1,3}$/],
];

function typeOf(v: unknown): string {
	if (v === null) return 'null';
	if (Array.isArray(v)) return 'array';
	if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
	return typeof v;
}

function stringFormat(values: string[]): string | undefined {
	return FORMATS.find(([, re]) => values.every((v) => re.test(v)))?.[0];
}

function mergeObjects(samples: Json[]): Json {
	const names = [...new Set(samples.flatMap((s) => Object.keys(s)))];
	const properties = Object.fromEntries(names.map((n) => [n, inferAll(samples.filter((s) => n in s).map((s) => s[n]))]));
	const required = names.filter((n) => samples.every((s) => n in s));
	return { type: 'object', properties, ...(required.length ? { required } : {}) };
}

function inferKind(kind: string, same: unknown[]): Json {
	if (kind === 'object') return mergeObjects(same as Json[]);
	if (kind === 'array') {
		const items = (same as unknown[][]).flat();
		return items.length ? { type: 'array', items: inferAll(items) } : { type: 'array' };
	}
	if (kind === 'string') {
		const format = stringFormat(same as string[]);
		return format ? { type: 'string', format } : { type: 'string' };
	}
	return { type: kind };
}

function inferAll(values: unknown[]): Json {
	const kinds = [...new Set(values.map(typeOf))];
	const merged = kinds.includes('number') ? kinds.filter((k) => k !== 'integer') : kinds;
	const schemas = merged.map((kind) =>
		inferKind(
			kind,
			values.filter((v) => typeOf(v) === kind || (kind === 'number' && typeOf(v) === 'integer')),
		),
	);
	if (schemas.length === 1) return schemas[0];
	return schemas.every((s) => Object.keys(s).length === 1) ? { type: merged } : { anyOf: schemas };
}

export function inferSchema(sample: unknown, title: string): Json {
	return { $schema: 'https://json-schema.org/draft/2020-12/schema', ...(title ? { title } : {}), ...inferAll([sample]) };
}
