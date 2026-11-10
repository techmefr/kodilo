import { floating, formatInZone, fromFloating, toEpoch, type Wall } from './zone-time';

const DAY = 86400000;

export type Diff = {
	negative: boolean;
	years: number;
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	wallDays: number;
	weeks: number;
	restDays: number;
	elapsedHours: number;
	elapsedMinutes: number;
	elapsedSeconds: number;
	business: number;
};

export type Interval = { years: number; months: number; weeks: number; days: number; hours: number; minutes: number; seconds: number };

function addMonths(wall: Wall, count: number): number {
	const total = wall.y * 12 + (wall.mo - 1) + count;
	const year = Math.floor(total / 12);
	const month = total - year * 12;
	const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	return Date.UTC(year, month, Math.min(wall.d, last), wall.h, wall.mi, wall.s);
}

export function businessDays(startMs: number, endMs: number): number {
	const startDay = Math.floor(startMs / DAY);
	const count = Math.floor(endMs / DAY) - startDay;
	if (count <= 0) return 0;
	let total = Math.floor(count / 7) * 5;
	for (let i = 0; i < count % 7; i++) {
		const weekday = new Date((startDay + i) * DAY).getUTCDay();
		if (weekday !== 0 && weekday !== 6) total++;
	}
	return total;
}

export function diff(first: Wall, second: Wall, zone: string): Diff {
	const epochFirst = toEpoch(first, zone);
	const epochSecond = toEpoch(second, zone);
	const negative = epochSecond < epochFirst;
	const [a, b] = negative ? [second, first] : [first, second];
	const [ea, eb] = negative ? [epochSecond, epochFirst] : [epochFirst, epochSecond];
	const fa = floating(a);
	const fb = floating(b);
	let months = (b.y - a.y) * 12 + (b.mo - a.mo);
	while (months > 0 && addMonths(a, months) > fb) months--;
	let rest = fb - addMonths(a, months);
	const days = Math.floor(rest / DAY);
	rest -= days * DAY;
	const hours = Math.floor(rest / 3600000);
	const minutes = Math.floor((rest - hours * 3600000) / 60000);
	const seconds = Math.floor((rest - hours * 3600000 - minutes * 60000) / 1000);
	const wallDays = Math.floor((fb - fa) / DAY);
	const elapsed = eb - ea;
	return {
		negative,
		years: Math.floor(months / 12),
		months: months % 12,
		days,
		hours,
		minutes,
		seconds,
		wallDays,
		weeks: Math.floor(wallDays / 7),
		restDays: wallDays % 7,
		elapsedHours: Math.floor(elapsed / 3600000),
		elapsedMinutes: Math.floor(elapsed / 60000),
		elapsedSeconds: Math.floor(elapsed / 1000),
		business: businessDays(fa, fb),
	};
}

export function shift(start: Wall, zone: string, sign: 1 | -1, interval: Interval): string {
	const calendarMonths = sign * (interval.years * 12 + interval.months);
	const calendarDays = sign * (interval.weeks * 7 + interval.days);
	const moved = fromFloating(addMonths(start, calendarMonths) + calendarDays * DAY);
	const exact = sign * (interval.hours * 3600 + interval.minutes * 60 + interval.seconds) * 1000;
	return formatInZone(toEpoch(moved, zone) + exact, zone);
}
