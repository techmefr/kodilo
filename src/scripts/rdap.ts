type RdapEvent = { eventAction: string; eventDate: string };
type RdapEntity = { roles?: string[]; vcardArray?: [string, [string, unknown, string, unknown][]]; handle?: string };

export type RdapDomain = {
	ldhName?: string;
	status?: string[];
	events?: RdapEvent[];
	entities?: RdapEntity[];
	nameservers?: { ldhName?: string }[];
	secureDNS?: { delegationSigned?: boolean };
};

export function eventDate(data: RdapDomain, action: string): Date | null {
	const found = data.events?.find((e) => e.eventAction === action);
	const date = found ? new Date(found.eventDate) : null;
	return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function registrarName(data: RdapDomain): string | null {
	const entity = data.entities?.find((e) => e.roles?.includes('registrar'));
	if (!entity) return null;
	const fn = entity.vcardArray?.[1]?.find((p) => p[0] === 'fn');
	return typeof fn?.[3] === 'string' && fn[3] ? fn[3] : (entity.handle ?? null);
}

export function ageBetween(from: Date, to: Date) {
	let years = to.getUTCFullYear() - from.getUTCFullYear();
	let months = to.getUTCMonth() - from.getUTCMonth();
	let days = to.getUTCDate() - from.getUTCDate();
	if (days < 0) {
		months -= 1;
		days += new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0)).getUTCDate();
	}
	if (months < 0) {
		years -= 1;
		months += 12;
	}
	return { years, months, days };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function formatAge(from: Date, to: Date): string {
	if (to < from) return 'not yet registered';
	const { years, months, days } = ageBetween(from, to);
	return [plural(years, 'year'), plural(months, 'month'), plural(days, 'day')].join(', ');
}

export function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function failureText(status: number): string {
	if (status === 404) return 'No RDAP record found. The domain may not be registered, or its TLD does not support RDAP.';
	if (status === 429) return 'The RDAP service is rate limiting requests. Wait a minute and try again.';
	if (status === 400) return 'The RDAP service rejected this domain name.';
	if (status >= 500) return `The RDAP service had a problem (HTTP ${status}). Try again later.`;
	return `The RDAP service answered with HTTP ${status}.`;
}
