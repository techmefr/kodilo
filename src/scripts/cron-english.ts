export interface CronFields {
	minute: string;
	hour: string;
	dayOfMonth: string;
	month: string;
	dayOfWeek: string;
}

export type CronParse = { ok: true; fields: CronFields; expression: string } | { ok: false; error: string };

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const DAY_PATTERN = DAY_NAMES.join('|');
const MONTH_PATTERN = MONTH_NAMES.join('|');
const ORDINAL_WORDS: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, tenth: 10, fifteenth: 15, twentieth: 20 };
const SHORTCUTS: Record<string, CronFields> = {
	minutely: { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
	hourly: { minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
	daily: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
	weekly: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '0' },
	monthly: { minute: '0', hour: '0', dayOfMonth: '1', month: '*', dayOfWeek: '*' },
	quarterly: { minute: '0', hour: '0', dayOfMonth: '1', month: '1,4,7,10', dayOfWeek: '*' },
	yearly: { minute: '0', hour: '0', dayOfMonth: '1', month: '1', dayOfWeek: '*' },
	annually: { minute: '0', hour: '0', dayOfMonth: '1', month: '1', dayOfWeek: '*' },
};

const fail = (error: string): CronParse => ({ ok: false, error });

const toExpression = (fields: CronFields): string => `${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`;

const succeed = (fields: CronFields): CronParse => ({ ok: true, fields, expression: toExpression(fields) });

function normalize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[,;]/g, ' , ')
		.replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

function parseClock(hourText: string, minuteText: string | undefined, meridiem: string | undefined): { hour: number; minute: number } | null {
	let hour = Number(hourText);
	const minute = minuteText === undefined ? 0 : Number(minuteText);
	if (meridiem) {
		if (hour < 1 || hour > 12) return null;
		if (meridiem === 'am') hour = hour === 12 ? 0 : hour;
		else hour = hour === 12 ? 12 : hour + 12;
	}
	if (hour > 23 || minute > 59) return null;
	return { hour, minute };
}

function extractTimes(text: string): { rest: string; times: { hour: number; minute: number }[] } | string {
	let rest = text.replace(/\bmidnight\b/g, 'at 0:00').replace(/\bnoon\b/g, 'at 12:00');
	const times: { hour: number; minute: number }[] = [];
	const clock = /(?:\bat\b|\band\b|,)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?(?!\d)/g;
	const found = [...rest.matchAll(clock)];
	for (const match of found) {
		const parsed = parseClock(match[1], match[2], match[3]);
		if (!parsed) return `"${match[0].replace(/^[^\d]+/, '')}" is not a valid time`;
		times.push(parsed);
	}
	if (found.length) rest = rest.replace(clock, ' ');
	return { rest, times };
}

function timesToFields(times: { hour: number; minute: number }[]): Pick<CronFields, 'minute' | 'hour'> | string {
	const minutes = [...new Set(times.map((t) => t.minute))];
	if (minutes.length > 1) return 'Cron cannot run at different minutes in different hours with a single expression. Use one expression per time.';
	const hours = [...new Set(times.map((t) => t.hour))].sort((a, b) => a - b);
	return { minute: String(minutes[0]), hour: hours.join(',') };
}

function parseDays(text: string): string | null {
	if (/\bweekdays?\b/.test(text)) return '1-5';
	if (/\bweekends?\b/.test(text)) return '0,6';
	const range = text.match(new RegExp(`\\b(${DAY_PATTERN})s?\\s+(?:to|through|thru|-)\\s+(${DAY_PATTERN})s?\\b`));
	if (range) return `${DAY_NAMES.indexOf(range[1])}-${DAY_NAMES.indexOf(range[2])}`;
	const days = [...text.matchAll(new RegExp(`\\b(${DAY_PATTERN})s?\\b`, 'g'))].map((m) => DAY_NAMES.indexOf(m[1]));
	if (!days.length) return null;
	return [...new Set(days)].sort((a, b) => a - b).join(',');
}

function parseMonths(text: string): string | null {
	const months = [...text.matchAll(new RegExp(`\\b(${MONTH_PATTERN})\\b`, 'g'))].map((m) => MONTH_NAMES.indexOf(m[1]) + 1);
	if (!months.length) return null;
	return [...new Set(months)].sort((a, b) => a - b).join(',');
}

function parseDayOfMonth(text: string): string | number | null {
	if (/\blast day\b/.test(text)) return 'last';
	const word = text.match(new RegExp(`\\b(${Object.keys(ORDINAL_WORDS).join('|')})\\s+day\\b`));
	if (word) return ORDINAL_WORDS[word[1]];
	const prefix = `on|the|day|${MONTH_PATTERN}`;
	const numbers = [...text.matchAll(new RegExp(`\\b(?:${prefix})\\s+(?:the\\s+)?(\\d{1,2})\\b(?!\\s*:)(?!\\s*(?:am|pm))`, 'g'))].map((m) => Number(m[1]));
	if (!numbers.length) return null;
	return [...new Set(numbers)].sort((a, b) => a - b).join(',');
}

function parseInterval(text: string): CronFields | string | null {
	const match = text.match(/\bevery\s+(?:(\d+)\s+)?(minute|hour)s?\b/);
	if (!match) return null;
	const step = match[1] ? Number(match[1]) : 1;
	const max = match[2] === 'minute' ? 59 : 23;
	if (step < 1 || step > max) return `Every ${step} ${match[2]}s is out of range`;
	const value = step === 1 ? '*' : `*/${step}`;
	const base: CronFields = { minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' };
	return match[2] === 'minute' ? { ...base, minute: value } : { ...base, hour: value };
}

export function parseEnglishCron(input: string): CronParse {
	const text = normalize(input);
	if (!text) return fail('Type a schedule, for example "every weekday at 9:30".');

	const shortcut = Object.keys(SHORTCUTS).find((key) => new RegExp(`^${key}$`).test(text));
	if (shortcut) return succeed(SHORTCUTS[shortcut]);

	const extracted = extractTimes(text);
	if (typeof extracted === 'string') return fail(extracted);
	const { rest, times } = extracted;

	const interval = parseInterval(rest);
	if (typeof interval === 'string') return fail(interval);

	const dayOfWeek = parseDays(rest);
	const month = parseMonths(rest);
	const dayOfMonth = parseDayOfMonth(rest);
	if (dayOfMonth === 'last') return fail('"Last day of the month" is not part of standard cron. Use 28-31 with a check in the script, or a Quartz expression.');

	const fields: CronFields = interval ?? { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' };
	if (times.length) {
		const clock = timesToFields(times);
		if (typeof clock === 'string') return fail(clock);
		if (interval && interval.minute !== '0' && interval.hour === '*')
			return fail('Use either an interval ("every 15 minutes") or a time ("at 9:30"), not both.');
		Object.assign(fields, clock);
	}
	if (dayOfWeek) fields.dayOfWeek = dayOfWeek;
	if (month) fields.month = month;
	if (dayOfMonth !== null) fields.dayOfMonth = String(dayOfMonth);

	const understood = Boolean(interval || times.length || dayOfWeek || month || dayOfMonth !== null || /\b(every|each) (day|month|year|week)\b/.test(rest));
	if (!understood) return fail('Schedule not understood. Try "every 15 minutes", "every weekday at 9:30", "on the 1st of every month at midnight".');
	if (dayOfMonth !== null && dayOfWeek)
		return fail('Cron treats day of month and day of week as "either", which rarely matches what you mean. Pick one of them.');
	return succeed(fields);
}
