export type Wall = { y: number; mo: number; d: number; h: number; mi: number; s: number };

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(zone: string): Intl.DateTimeFormat {
	let f = formatters.get(zone);
	if (!f) {
		f = new Intl.DateTimeFormat('en-US', {
			timeZone: zone,
			hourCycle: 'h23',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		});
		formatters.set(zone, f);
	}
	return f;
}

export function wallOf(epoch: number, zone: string): Wall {
	const parts = Object.fromEntries(
		formatter(zone)
			.formatToParts(new Date(epoch))
			.map((p) => [p.type, Number(p.value)]),
	);
	return { y: parts.year, mo: parts.month, d: parts.day, h: parts.hour, mi: parts.minute, s: parts.second };
}

export const floating = (w: Wall) => Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s);

export function fromFloating(ms: number): Wall {
	const d = new Date(ms);
	return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds() };
}

export function toEpoch(wall: Wall, zone: string): number {
	const target = floating(wall);
	const offsetAt = (epoch: number) => floating(wallOf(epoch, zone)) - Math.floor(epoch / 1000) * 1000;
	const first = target - offsetAt(target);
	const second = target - offsetAt(first);
	return offsetAt(second) === offsetAt(first) ? second : Math.min(first, second);
}

export function parseLocal(value: string): Wall | null {
	const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
	if (!m) return null;
	return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5], s: m[6] ? +m[6] : 0 };
}

const pad = (n: number, size = 2) => String(n).padStart(size, '0');

export function formatWall(w: Wall): string {
	return `${pad(w.y, 4)}-${pad(w.mo)}-${pad(w.d)} ${pad(w.h)}:${pad(w.mi)}:${pad(w.s)}`;
}

export function formatInZone(epoch: number, zone: string): string {
	const label = new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', timeZoneName: 'short' }).formatToParts(new Date(epoch));
	const weekday = label.find((p) => p.type === 'weekday')?.value ?? '';
	const name = label.find((p) => p.type === 'timeZoneName')?.value ?? '';
	return `${weekday} ${formatWall(wallOf(epoch, zone))} ${name}`;
}

export function zoneList(): string[] {
	const own = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const all = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
	return [...new Set([own, 'UTC', ...all])];
}
