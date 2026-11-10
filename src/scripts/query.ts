export type Entry = [string, string];

export type Split = { prefix: string; entries: Entry[]; hash: string };

const decode = (text: string) => {
	const spaced = text.replace(/\+/g, ' ');
	try {
		return decodeURIComponent(spaced);
	} catch {
		return spaced;
	}
};

const isBareQuery = (text: string) => !text.includes('?') && !text.includes('://') && /[=&]/.test(text) && !text.startsWith('/');

export function splitInput(raw: string): Split {
	const text = raw.trim();
	const hashAt = text.indexOf('#');
	const hash = hashAt === -1 ? '' : text.slice(hashAt);
	const body = hashAt === -1 ? text : text.slice(0, hashAt);
	const queryAt = body.indexOf('?');
	const bare = isBareQuery(body);
	const prefix = bare ? '' : queryAt === -1 ? body : body.slice(0, queryAt);
	const query = bare ? body : queryAt === -1 ? '' : body.slice(queryAt + 1);
	const entries = query
		.split('&')
		.filter((part) => part !== '')
		.map((part): Entry => {
			const eq = part.indexOf('=');
			return eq === -1 ? [decode(part), ''] : [decode(part.slice(0, eq)), decode(part.slice(eq + 1))];
		});
	return { prefix, entries, hash };
}

const encodeKey = (key: string) => encodeURIComponent(key).replace(/%5B/g, '[').replace(/%5D/g, ']');

export function buildQuery(entries: Entry[], plusForSpace: boolean): string {
	const part = (text: string) => (plusForSpace ? encodeURIComponent(text).replace(/%20/g, '+') : encodeURIComponent(text));
	return entries
		.filter(([key]) => key !== '')
		.map(([key, value]) => `${plusForSpace ? encodeKey(key).replace(/%20/g, '+') : encodeKey(key)}=${part(value)}`)
		.join('&');
}

export function assemble(split: Split, entries: Entry[], plusForSpace: boolean): string {
	const query = buildQuery(entries, plusForSpace);
	return `${split.prefix}${query ? `?${query}` : ''}${split.hash}`;
}

export function toJson(entries: Entry[]): Record<string, string | string[]> {
	const counts = new Map<string, number>();
	entries.forEach(([key]) => counts.set(key.replace(/\[\]$/, ''), (counts.get(key.replace(/\[\]$/, '')) ?? 0) + 1));
	const result: Record<string, string | string[]> = {};
	entries.forEach(([key, value]) => {
		const name = key.replace(/\[\]$/, '');
		const isArray = key.endsWith('[]') || (counts.get(name) ?? 0) > 1;
		if (!isArray) result[name] = value;
		else result[name] = [...((result[name] as string[] | undefined) ?? []), value];
	});
	return result;
}

export function repeatCount(entries: Entry[], key: string): number {
	return entries.filter(([k]) => k === key).length;
}
