export type Locale = { code: string; name: string; country: string; dir: 'ltr' | 'rtl'; english: string };

export const defaultLocale = 'en';

export const locales: Locale[] = [
	{ code: 'en', name: 'English', country: 'gb', dir: 'ltr', english: 'English' },
	{ code: 'fr', name: 'Français', country: 'fr', dir: 'ltr', english: 'French' },
	{ code: 'es', name: 'Español', country: 'es', dir: 'ltr', english: 'Spanish' },
	{ code: 'pt', name: 'Português', country: 'pt', dir: 'ltr', english: 'Portuguese' },
	{ code: 'it', name: 'Italiano', country: 'it', dir: 'ltr', english: 'Italian' },
	{ code: 'de', name: 'Deutsch', country: 'de', dir: 'ltr', english: 'German' },
	{ code: 'nl', name: 'Nederlands', country: 'nl', dir: 'ltr', english: 'Dutch' },
	{ code: 'ru', name: 'Русский', country: 'ru', dir: 'ltr', english: 'Russian' },
	{ code: 'uk', name: 'Українська', country: 'ua', dir: 'ltr', english: 'Ukrainian' },
	{ code: 'pl', name: 'Polski', country: 'pl', dir: 'ltr', english: 'Polish' },
	{ code: 'sv', name: 'Svenska', country: 'se', dir: 'ltr', english: 'Swedish' },
	{ code: 'tr', name: 'Türkçe', country: 'tr', dir: 'ltr', english: 'Turkish' },
	{ code: 'ar', name: 'العربية', country: 'sa', dir: 'rtl', english: 'Arabic' },
	{ code: 'hi', name: 'हिन्दी', country: 'in', dir: 'ltr', english: 'Hindi' },
	{ code: 'ja', name: '日本語', country: 'jp', dir: 'ltr', english: 'Japanese' },
	{ code: 'ko', name: '한국어', country: 'kr', dir: 'ltr', english: 'Korean' },
	{ code: 'zh-Hans', name: '简体中文', country: 'cn', dir: 'ltr', english: 'Simplified Chinese (Mandarin)' },
	{ code: 'zh-Hant', name: '繁體中文', country: 'tw', dir: 'ltr', english: 'Traditional Chinese (Mandarin)' },
	{ code: 'id', name: 'Bahasa Indonesia', country: 'id', dir: 'ltr', english: 'Indonesian' },
	{ code: 'vi', name: 'Tiếng Việt', country: 'vn', dir: 'ltr', english: 'Vietnamese' },
	{ code: 'th', name: 'ไทย', country: 'th', dir: 'ltr', english: 'Thai' },
];

export function matchLocale(tags: readonly string[]): string {
	for (const raw of tags) {
		const tag = raw.toLowerCase();
		const exact = locales.find((l) => l.code.toLowerCase() === tag);
		if (exact) return exact.code;
		if (tag.startsWith('zh')) return /hant|tw|hk|mo/.test(tag) ? 'zh-Hant' : 'zh-Hans';
		const base = locales.find((l) => l.code.toLowerCase() === tag.split('-')[0]);
		if (base) return base.code;
	}
	return defaultLocale;
}
