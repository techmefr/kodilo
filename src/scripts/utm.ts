export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export type UtmValues = Record<(typeof UTM_KEYS)[number], string>;

export type UtmResult = { url: string; error: string; tagged: number };

const encode = (text: string) => encodeURIComponent(text);

export function withScheme(text: string): string {
	const trimmed = text.trim();
	return /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function buildUtm(base: string, values: UtmValues, lowercase: boolean): UtmResult {
	if (!base.trim()) return { url: '', error: 'Enter a landing page URL.', tagged: 0 };
	let url: URL;
	try {
		url = new URL(withScheme(base));
	} catch {
		return { url: '', error: 'This is not a valid URL.', tagged: 0 };
	}
	const kept = [...url.searchParams.entries()].filter(([key]) => !(UTM_KEYS as readonly string[]).includes(key.toLowerCase()));
	const tags = UTM_KEYS.map((key) => {
		const trimmed = values[key].trim();
		return [key, lowercase ? trimmed.toLowerCase() : trimmed] as [string, string];
	}).filter(([, value]) => value !== '');
	const query = [...kept, ...tags].map(([key, value]) => `${encode(key)}=${encode(value)}`).join('&');
	const origin = url.username || url.password ? `${url.protocol}//${url.username}${url.password ? `:${url.password}` : ''}@${url.host}` : url.origin;
	return { url: `${origin}${url.pathname}${query ? `?${query}` : ''}${url.hash}`, error: '', tagged: tags.length };
}
