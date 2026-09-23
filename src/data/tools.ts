export interface Tool {
	slug: string;
	name: string;
	description: string;
}

export interface Category {
	name: string;
	tools: Tool[];
}

export const categories: Category[] = [
	{
		name: 'Email',
		tools: [
			{
				slug: 'inbox-tester',
				name: 'Inbox Tester',
				description:
					'Paste an HTML email, pick a client tab, see the render and which CSS features it supports.',
			},
		],
	},
	{
		name: 'JSON',
		tools: [
			{
				slug: 'json-formatter',
				name: 'JSON Formatter & Validator',
				description: 'Format, validate and minify JSON data.',
			},
			{
				slug: 'json-to-yaml',
				name: 'JSON to YAML',
				description: 'Convert JSON to YAML.',
			},
			{
				slug: 'json-to-csv',
				name: 'JSON to CSV',
				description: 'Convert JSON arrays to CSV.',
			},
			{
				slug: 'json-diff',
				name: 'JSON Diff',
				description: 'Compare two JSON documents and highlight what changed.',
			},
			{
				slug: 'json-viewer',
				name: 'JSON Viewer',
				description: 'Explore a JSON document as a collapsible tree.',
			},
		],
	},
	{
		name: 'HTML / CSS',
		tools: [
			{
				slug: 'html-formatter',
				name: 'HTML Formatter',
				description: 'Beautify and format HTML code.',
			},
			{
				slug: 'css-formatter',
				name: 'CSS Formatter & Minifier',
				description: 'Format and minify CSS stylesheets.',
			},
			{
				slug: 'box-shadow-generator',
				name: 'Box Shadow Generator',
				description: 'Generate CSS box-shadow values with a live preview.',
			},
			{
				slug: 'gradient-generator',
				name: 'Gradient Generator',
				description: 'Generate CSS gradients with a live preview.',
			},
			{
				slug: 'meta-tag-generator',
				name: 'Meta Tag Generator',
				description: 'Generate HTML meta and Open Graph tags.',
			},
		],
	},
	{
		name: 'Text',
		tools: [
			{
				slug: 'regex-tester',
				name: 'Regex Tester',
				description: 'Test regular expressions against sample text.',
			},
			{
				slug: 'diff-checker',
				name: 'Diff Checker',
				description: 'Compare two texts side by side.',
			},
			{
				slug: 'case-converter',
				name: 'Case Converter',
				description: 'Convert text between case styles (camel, snake, kebab...).',
			},
			{
				slug: 'word-counter',
				name: 'Word Counter',
				description: 'Count words, characters and lines.',
			},
			{
				slug: 'slugify',
				name: 'Slugify',
				description: 'Turn text into a URL-friendly slug.',
			},
			{
				slug: 'lorem-ipsum-generator',
				name: 'Lorem Ipsum Generator',
				description: 'Generate placeholder text.',
			},
			{
				slug: 'text-to-binary',
				name: 'Text to Binary',
				description: 'Convert text to and from binary.',
			},
			{
				slug: 'text-to-nato-alphabet',
				name: 'Text to NATO Alphabet',
				description: 'Spell out text using the NATO phonetic alphabet.',
			},
		],
	},
	{
		name: 'Encoding & Security',
		tools: [
			{
				slug: 'base64',
				name: 'Base64 Encoder & Decoder',
				description: 'Encode and decode Base64 strings.',
			},
			{
				slug: 'jwt-decoder',
				name: 'JWT Decoder',
				description: 'Decode and inspect JWT tokens.',
			},
			{
				slug: 'url-encoder',
				name: 'URL Encoder & Decoder',
				description: 'Encode and decode URL strings.',
			},
			{
				slug: 'html-entities',
				name: 'HTML Entities',
				description: 'Encode and decode HTML entities.',
			},
			{
				slug: 'hash-text',
				name: 'Hash Text',
				description: 'Generate MD5, SHA-1, SHA-256 and other hashes.',
			},
			{
				slug: 'hmac-generator',
				name: 'HMAC Generator',
				description: 'Generate an HMAC signature for a message and key.',
			},
			{
				slug: 'bcrypt',
				name: 'Bcrypt',
				description: 'Hash and verify passwords with bcrypt.',
			},
			{
				slug: 'basic-auth-generator',
				name: 'Basic Auth Generator',
				description: 'Generate an HTTP Basic Authentication header.',
			},
			{
				slug: 'token-generator',
				name: 'Token Generator',
				description: 'Generate random tokens with a custom charset and length.',
			},
		],
	},
	{
		name: 'Generators',
		tools: [
			{
				slug: 'uuid-generator',
				name: 'UUID Generator',
				description: 'Generate random UUIDs.',
			},
			{
				slug: 'ulid-generator',
				name: 'ULID Generator',
				description: 'Generate ULIDs (sortable unique identifiers).',
			},
			{
				slug: 'password-generator',
				name: 'Password Generator',
				description: 'Generate secure random passwords.',
			},
			{
				slug: 'qr-code-generator',
				name: 'QR Code Generator',
				description: 'Generate QR codes from text or URLs.',
			},
			{
				slug: 'crontab-generator',
				name: 'Crontab Generator',
				description: 'Build and explain a cron expression.',
			},
		],
	},
	{
		name: 'Converters',
		tools: [
			{
				slug: 'date-time-converter',
				name: 'Date/Time Converter',
				description: 'Convert between timestamps, ISO dates and time zones.',
			},
			{
				slug: 'color-converter',
				name: 'Color Converter',
				description: 'Convert colors between HEX, RGB, HSL and more.',
			},
			{
				slug: 'integer-base-converter',
				name: 'Integer Base Converter',
				description: 'Convert numbers between binary, octal, decimal and hex.',
			},
			{
				slug: 'roman-numeral-converter',
				name: 'Roman Numeral Converter',
				description: 'Convert numbers to and from Roman numerals.',
			},
			{
				slug: 'temperature-converter',
				name: 'Temperature Converter',
				description: 'Convert between Celsius, Fahrenheit and Kelvin.',
			},
		],
	},
	{
		name: 'Network',
		tools: [
			{
				slug: 'ipv4-subnet-calculator',
				name: 'IPv4 Subnet Calculator',
				description: 'Calculate subnet ranges, masks and host counts.',
			},
			{
				slug: 'user-agent-parser',
				name: 'User Agent Parser',
				description: 'Parse a User-Agent string into browser, engine and OS.',
			},
			{
				slug: 'http-status-codes',
				name: 'HTTP Status Codes',
				description: 'Look up the meaning of an HTTP status code.',
			},
		],
	},
	{
		name: 'Testing',
		tools: [],
	},
	{
		name: 'Design',
		tools: [],
	},
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);
