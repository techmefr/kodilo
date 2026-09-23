export interface Tool {
	slug: string;
	name: string;
	description: string;
	/** Whether the tool has an actual page built for it yet. */
	built?: boolean;
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
				built: true,
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
		],
	},
	{
		name: 'Markdown',
		tools: [
			{
				slug: 'markdown-to-html',
				name: 'Markdown to HTML',
				description: 'Convert Markdown to HTML.',
			},
			{
				slug: 'markdown-previewer',
				name: 'Markdown Previewer',
				description: 'Write Markdown and preview the rendered result live.',
			},
		],
	},
	{
		name: 'SEO',
		tools: [
			{
				slug: 'meta-tag-generator',
				name: 'Meta Tag Generator',
				description: 'Generate HTML meta tags.',
			},
			{
				slug: 'open-graph-generator',
				name: 'Open Graph Generator',
				description: 'Generate Open Graph tags for link previews.',
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
			{
				slug: 'text-statistics',
				name: 'Text Statistics',
				description: 'Reading time, sentence count and other text metrics.',
			},
			{
				slug: 'numeronym-generator',
				name: 'Numeronym Generator',
				description: 'Generate numeronyms like i18n or a11y from a word.',
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
			{
				slug: 'rsa-key-pair-generator',
				name: 'RSA Key Pair Generator',
				description: 'Generate an RSA public/private key pair.',
			},
			{
				slug: 'text-encryption',
				name: 'Text Encryption',
				description: 'Encrypt and decrypt text with AES and a passphrase.',
			},
			{
				slug: 'bip39-generator',
				name: 'BIP39 Generator',
				description: 'Generate a BIP39 mnemonic seed phrase.',
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
				slug: 'wifi-qr-code-generator',
				name: 'WiFi QR Code Generator',
				description: 'Generate a QR code that connects to a WiFi network.',
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
				slug: 'ipv4-range-expander',
				name: 'IPv4 Range Expander',
				description: 'Expand an IPv4 range or CIDR into individual addresses.',
			},
			{
				slug: 'ipv6-ula-generator',
				name: 'IPv6 ULA Generator',
				description: 'Generate a unique local IPv6 address prefix.',
			},
			{
				slug: 'mac-address-generator',
				name: 'MAC Address Generator',
				description: 'Generate random MAC addresses.',
			},
			{
				slug: 'mac-address-lookup',
				name: 'MAC Address Lookup',
				description: 'Look up the vendor for a MAC address.',
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
			{
				slug: 'phone-parser',
				name: 'Phone Parser & Formatter',
				description: 'Parse and format international phone numbers.',
			},
		],
	},
	{
		name: 'Validators',
		tools: [
			{
				slug: 'email-validator',
				name: 'Email Validator',
				description: 'Validate email address syntax.',
			},
			{
				slug: 'credit-card-validator',
				name: 'Credit Card Validator',
				description: 'Validate a credit card number with the Luhn check.',
			},
			{
				slug: 'iban-validator',
				name: 'IBAN Validator & Parser',
				description: 'Validate an IBAN and break it down by country/bank/account.',
			},
		],
	},
	{
		name: 'Images',
		tools: [
			{
				slug: 'image-resizer',
				name: 'Image Resizer',
				description: 'Resize images entirely in the browser.',
			},
			{
				slug: 'image-compressor',
				name: 'Image Compressor',
				description: 'Compress images without uploading them anywhere.',
			},
			{
				slug: 'png-to-jpg',
				name: 'PNG to JPG Converter',
				description: 'Convert PNG images to JPG.',
			},
			{
				slug: 'image-to-base64',
				name: 'Image to Base64',
				description: 'Convert an image to a Base64 data URI.',
			},
		],
	},
	{
		name: 'PDF',
		tools: [
			{
				slug: 'pdf-merge',
				name: 'PDF Merge',
				description: 'Combine multiple PDFs into one.',
			},
			{
				slug: 'pdf-split',
				name: 'PDF Split',
				description: 'Extract pages from a PDF.',
			},
			{
				slug: 'pdf-compress',
				name: 'PDF Compress',
				description: 'Reduce PDF file size.',
			},
			{
				slug: 'pdf-to-jpg',
				name: 'PDF to JPG',
				description: 'Convert PDF pages to JPG images.',
			},
			{
				slug: 'jpg-to-pdf',
				name: 'JPG to PDF',
				description: 'Convert JPG images to a PDF.',
			},
		],
	},
	{
		name: 'Dev Utilities',
		tools: [
			{
				slug: 'sql-prettify',
				name: 'SQL Prettify',
				description: 'Format SQL queries.',
			},
			{
				slug: 'math-evaluator',
				name: 'Math Evaluator',
				description: 'Evaluate a math expression on the fly.',
			},
			{
				slug: 'docker-run-to-compose',
				name: 'Docker Run to Compose Converter',
				description: 'Convert a docker run command to a docker-compose.yml.',
			},
			{
				slug: 'mime-types',
				name: 'MIME Types',
				description: 'Look up the MIME type for a file extension.',
			},
			{
				slug: 'chmod-calculator',
				name: 'Chmod Calculator',
				description: 'Compute and explain Unix file permission values.',
			},
			{
				slug: 'regex-cheatsheet',
				name: 'Regex Cheatsheet',
				description: 'Quick reference for common regular expression syntax.',
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

/** Categories filtered down to tools that actually have a page built. */
export const builtCategories: Category[] = categories
	.map((c) => ({ ...c, tools: c.tools.filter((t) => t.built) }))
	.filter((c) => c.tools.length > 0);
