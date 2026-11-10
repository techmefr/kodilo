export type Pattern = { id: string; name: string; source: string; flags: string; sample: string };

const IPV6_PART = '[0-9a-f]{1,4}';

const IPV6 = [
	`(?:${IPV6_PART}:){7}${IPV6_PART}`,
	`(?:${IPV6_PART}:){1,7}:`,
	`(?:${IPV6_PART}:){1,6}:${IPV6_PART}`,
	`(?:${IPV6_PART}:){1,5}(?::${IPV6_PART}){1,2}`,
	`(?:${IPV6_PART}:){1,4}(?::${IPV6_PART}){1,3}`,
	`(?:${IPV6_PART}:){1,3}(?::${IPV6_PART}){1,4}`,
	`(?:${IPV6_PART}:){1,2}(?::${IPV6_PART}){1,5}`,
	`${IPV6_PART}:(?::${IPV6_PART}){1,6}`,
	`:(?:(?::${IPV6_PART}){1,7}|:)`,
].join('|');

const SEMVER_ID = '(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)';

export const PATTERNS: Pattern[] = [
	{
		id: 'email',
		name: 'Email address',
		source: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
		flags: 'gm',
		sample: 'dev@example.com\nfirst.last+tag@sub.example.co.uk\nnot-an-email\nname@@example.com',
	},
	{
		id: 'url',
		name: 'URL (http or https)',
		source: '^https?:\\/\\/(?:[\\w-]+\\.)+[a-z]{2,}(?::\\d{2,5})?(?:[\\/?#]\\S*)?$',
		flags: 'gim',
		sample: 'https://example.com\nhttp://sub.example.org:8080/path?q=1#top\nftp://example.com\nhttps://localhost',
	},
	{
		id: 'ipv4',
		name: 'IPv4 address',
		source: '^(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)$',
		flags: 'gm',
		sample: '192.168.1.1\n255.255.255.255\n256.1.1.1\n10.0.0',
	},
	{
		id: 'ipv6',
		name: 'IPv6 address',
		source: `^(?:${IPV6})$`,
		flags: 'gim',
		sample: '2001:db8::1\nfe80::1ff:fe23:4567:890a\n::1\n2001:db8:::1\n12345::1',
	},
	{
		id: 'uuid',
		name: 'UUID',
		source: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
		flags: 'gim',
		sample: '123e4567-e89b-12d3-a456-426614174000\n550E8400-E29B-41D4-A716-446655440000\n123e4567-e89b-02d3-a456-426614174000\nnot-a-uuid',
	},
	{
		id: 'date',
		name: 'Date (ISO 8601, YYYY-MM-DD)',
		source: '^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$',
		flags: 'gm',
		sample: '2026-11-10\n1999-12-31\n2026-13-01\n2026-02-32\n10/11/2026',
	},
	{
		id: 'datetime',
		name: 'Date and time (ISO 8601)',
		source: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2}(?:\\.\\d+)?)?(?:Z|[+-]\\d{2}:\\d{2})$',
		flags: 'gm',
		sample: '2026-11-10T17:30:00Z\n2026-11-10T17:30:00.123+01:00\n2026-11-10 17:30:00\n2026-11-10T17:30',
	},
	{
		id: 'time',
		name: 'Time (24-hour HH:MM)',
		source: '^(?:[01]\\d|2[0-3]):[0-5]\\d$',
		flags: 'gm',
		sample: '00:00\n09:45\n23:59\n24:00\n7:30',
	},
	{
		id: 'hex-color',
		name: 'Hex color',
		source: '^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$',
		flags: 'gim',
		sample: '#fff\n#1A2b3C\n#11223344\n#12345\nabcdef',
	},
	{
		id: 'phone',
		name: 'Phone number (E.164)',
		source: '^\\+[1-9]\\d{1,14}$',
		flags: 'gm',
		sample: '+14155552671\n+442071838750\n+0123456789\n14155552671',
	},
	{
		id: 'slug',
		name: 'URL slug',
		source: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
		flags: 'gm',
		sample: 'my-first-post\nhello\nHello-World\ntrailing-\ndouble--dash',
	},
	{
		id: 'semver',
		name: 'Semantic version',
		source: `^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-(${SEMVER_ID}(?:\\.${SEMVER_ID})*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$`,
		flags: 'gm',
		sample: '1.0.0\n2.14.3-beta.1\n1.0.0+build.5\n01.2.3\n1.2',
	},
	{
		id: 'card',
		name: 'Credit card shape (16 digits)',
		source: '^(?:\\d{4}[ -]?){3}\\d{4}$',
		flags: 'gm',
		sample: '4242 4242 4242 4242\n4242-4242-4242-4242\n4242424242424242\n4242 4242 4242',
	},
	{
		id: 'mac',
		name: 'MAC address',
		source: '^(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}$',
		flags: 'gim',
		sample: '00:1A:2B:3C:4D:5E\n00-1a-2b-3c-4d-5e\n00:1A:2B:3C:4D\nGG:1A:2B:3C:4D:5E',
	},
	{
		id: 'zip',
		name: 'US ZIP code',
		source: '^\\d{5}(?:-\\d{4})?$',
		flags: 'gm',
		sample: '90210\n10001-1234\n1234\n123456',
	},
	{
		id: 'username',
		name: 'Username (3 to 16 characters)',
		source: '^[a-zA-Z0-9_-]{3,16}$',
		flags: 'gm',
		sample: 'kodilo_dev\nab\nthis-name-is-way-too-long\nbad name',
	},
];
