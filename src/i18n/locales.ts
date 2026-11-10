export type Locale = { code: string; name: string; flag: string; dir: 'ltr' | 'rtl'; english: string };

export const defaultLocale = 'en';

export const locales: Locale[] = [
	{ code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr', english: 'English' },
	{ code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr', english: 'French' },
	{ code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr', english: 'Spanish' },
	{ code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr', english: 'Portuguese' },
	{ code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr', english: 'Italian' },
	{ code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr', english: 'German' },
	{ code: 'nl', name: 'Nederlands', flag: '🇳🇱', dir: 'ltr', english: 'Dutch' },
	{ code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr', english: 'Russian' },
	{ code: 'uk', name: 'Українська', flag: '🇺🇦', dir: 'ltr', english: 'Ukrainian' },
	{ code: 'pl', name: 'Polski', flag: '🇵🇱', dir: 'ltr', english: 'Polish' },
	{ code: 'sv', name: 'Svenska', flag: '🇸🇪', dir: 'ltr', english: 'Swedish' },
	{ code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr', english: 'Turkish' },
	{ code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl', english: 'Arabic' },
	{ code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr', english: 'Hindi' },
	{ code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr', english: 'Japanese' },
	{ code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr', english: 'Korean' },
	{ code: 'zh-Hans', name: '简体中文', flag: '🇨🇳', dir: 'ltr', english: 'Simplified Chinese (Mandarin)' },
	{ code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼', dir: 'ltr', english: 'Traditional Chinese (Mandarin)' },
	{ code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr', english: 'Indonesian' },
	{ code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr', english: 'Vietnamese' },
	{ code: 'th', name: 'ไทย', flag: '🇹🇭', dir: 'ltr', english: 'Thai' },
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
