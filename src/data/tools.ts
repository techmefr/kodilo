export interface Tool {
	slug: string;
	name: string;
	description: string;
	built?: boolean;
}

export interface Category {
	name: string;
	icon: string;
	blurb: string;
	tools: Tool[];
}

export const categories: Category[] = [
	{
		name: 'Email',
		icon: 'mail',
		blurb: 'Preview and test outgoing HTML email',
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
		icon: 'braces',
		blurb: 'Format, validate, diff, convert',
		tools: [
			{
				slug: 'json-formatter',
				built: true,
				name: 'JSON Formatter & Validator',
				description: 'Format, validate and minify JSON data.',
			},
			{
				slug: 'json-to-yaml',
				built: true,
				name: 'JSON to YAML',
				description: 'Convert JSON to YAML.',
			},
			{
				slug: 'json-to-csv',
				built: true,
				name: 'JSON to CSV',
				description: 'Convert JSON arrays to CSV.',
			},
			{
				slug: 'json-diff',
				built: true,
				name: 'JSON Diff',
				description: 'Compare two JSON documents and highlight what changed.',
			},
			{
				slug: 'json-viewer',
				built: true,
				name: 'JSON Viewer',
				description: 'Explore a JSON document as a collapsible tree.',
			},
		],
	},
	{
		name: 'HTML / CSS',
		icon: 'code',
		blurb: 'Beautify, minify, generate',
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
				built: true,
				name: 'Box Shadow Generator',
				description: 'Generate CSS box-shadow values with a live preview.',
			},
			{
				slug: 'gradient-generator',
				built: true,
				name: 'Gradient Generator',
				description: 'Generate CSS gradients with a live preview.',
			},
			{
				slug: 'css-grid-generator',
				built: true,
				name: 'CSS Grid Generator',
				description: 'Build a CSS grid layout visually and copy the code.',
			},
			{
				slug: 'flexbox-generator',
				built: true,
				name: 'Flexbox Generator',
				description: 'Build a CSS flexbox layout visually and copy the code.',
			},
		],
	},
	{
		name: 'Markdown',
		icon: 'file-text',
		blurb: 'Write, preview, convert',
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
		icon: 'search',
		blurb: 'Meta tags for link previews',
		tools: [
			{
				slug: 'meta-tag-generator',
				built: true,
				name: 'Meta Tag Generator',
				description: 'Generate HTML meta tags.',
			},
			{
				slug: 'open-graph-generator',
				built: true,
				name: 'Open Graph Generator',
				description: 'Generate Open Graph tags for link previews.',
			},
		],
	},
	{
		name: 'Text',
		icon: 'type',
		blurb: 'Case, diff, count, encode',
		tools: [
			{
				slug: 'regex-tester',
				built: true,
				name: 'Regex Tester',
				description: 'Test regular expressions against sample text.',
			},
			{
				slug: 'diff-checker',
				built: true,
				name: 'Diff Checker',
				description: 'Compare two texts side by side.',
			},
			{
				slug: 'case-converter',
				built: true,
				name: 'Case Converter',
				description: 'Convert text between case styles (camel, snake, kebab...).',
			},
			{
				slug: 'word-counter',
				built: true,
				name: 'Word Counter',
				description: 'Count words, characters and lines.',
			},
			{
				slug: 'slugify',
				built: true,
				name: 'Slugify',
				description: 'Turn text into a URL-friendly slug.',
			},
			{
				slug: 'lorem-ipsum-generator',
				built: true,
				name: 'Lorem Ipsum Generator',
				description: 'Generate placeholder text.',
			},
			{
				slug: 'text-to-binary',
				built: true,
				name: 'Text to Binary',
				description: 'Convert text to and from binary.',
			},
			{
				slug: 'text-to-nato-alphabet',
				built: true,
				name: 'Text to NATO Alphabet',
				description: 'Spell out text using the NATO phonetic alphabet.',
			},
			{
				slug: 'text-statistics',
				built: true,
				name: 'Text Statistics',
				description: 'Reading time, sentence count and other text metrics.',
			},
			{
				slug: 'numeronym-generator',
				built: true,
				name: 'Numeronym Generator',
				description: 'Generate numeronyms like i18n or a11y from a word.',
			},
		],
	},
	{
		name: 'Encoding & Security',
		icon: 'lock',
		blurb: 'Hash, sign, encrypt, decode',
		tools: [
			{
				slug: 'base64',
				built: true,
				name: 'Base64 Encoder & Decoder',
				description: 'Encode and decode Base64 strings.',
			},
			{
				slug: 'jwt-decoder',
				built: true,
				name: 'JWT Decoder',
				description: 'Decode and inspect JWT tokens.',
			},
			{
				slug: 'url-encoder',
				built: true,
				name: 'URL Encoder & Decoder',
				description: 'Encode and decode URL strings.',
			},
			{
				slug: 'html-entities',
				built: true,
				name: 'HTML Entities',
				description: 'Encode and decode HTML entities.',
			},
			{
				slug: 'hash-text',
				built: true,
				name: 'Hash Text',
				description: 'Generate MD5, SHA-1, SHA-256 and other hashes.',
			},
			{
				slug: 'hmac-generator',
				built: true,
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
				built: true,
				name: 'Basic Auth Generator',
				description: 'Generate an HTTP Basic Authentication header.',
			},
			{
				slug: 'token-generator',
				built: true,
				name: 'Token Generator',
				description: 'Generate random tokens with a custom charset and length.',
			},
			{
				slug: 'rsa-key-pair-generator',
				built: true,
				name: 'RSA Key Pair Generator',
				description: 'Generate an RSA public/private key pair.',
			},
			{
				slug: 'text-encryption',
				built: true,
				name: 'Text Encryption',
				description: 'Encrypt and decrypt text with AES and a passphrase.',
			},
			{
				slug: 'bip39-generator',
				name: 'BIP39 Generator',
				description: 'Generate a BIP39 mnemonic seed phrase.',
			},
			{
				slug: 'xor-cipher',
				built: true,
				name: 'XOR Cipher',
				description: 'Encrypt or decrypt text/bytes with a repeating XOR key.',
			},
			{
				slug: 'checksum-calculator',
				built: true,
				name: 'Checksum Calculator',
				description: 'Compute a CRC32 or other checksum for text or a file.',
			},
		],
	},
	{
		name: 'Generators',
		icon: 'wand-2',
		blurb: 'IDs, passwords, QR, cron',
		tools: [
			{
				slug: 'uuid-generator',
				built: true,
				name: 'UUID Generator',
				description: 'Generate random UUIDs.',
			},
			{
				slug: 'ulid-generator',
				built: true,
				name: 'ULID Generator',
				description: 'Generate ULIDs (sortable unique identifiers).',
			},
			{
				slug: 'password-generator',
				built: true,
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
				built: true,
				name: 'Crontab Generator',
				description: 'Build and explain a cron expression.',
			},
		],
	},
	{
		name: 'Converters',
		icon: 'repeat',
		blurb: 'Dates, colors, bases, units',
		tools: [
			{
				slug: 'date-time-converter',
				built: true,
				name: 'Date/Time Converter',
				description: 'Convert between timestamps, ISO dates and time zones.',
			},
			{
				slug: 'color-converter',
				built: true,
				name: 'Color Converter',
				description: 'Convert colors between HEX, RGB, HSL and more.',
			},
			{
				slug: 'integer-base-converter',
				built: true,
				name: 'Integer Base Converter',
				description: 'Convert numbers between binary, octal, decimal and hex.',
			},
			{
				slug: 'roman-numeral-converter',
				built: true,
				name: 'Roman Numeral Converter',
				description: 'Convert numbers to and from Roman numerals.',
			},
			{
				slug: 'temperature-converter',
				built: true,
				name: 'Temperature Converter',
				description: 'Convert between Celsius, Fahrenheit and Kelvin.',
			},
		],
	},
	{
		name: 'Network',
		icon: 'network',
		blurb: 'IPs, MACs, user agents, status codes',
		tools: [
			{
				slug: 'ipv4-subnet-calculator',
				built: true,
				name: 'IPv4 Subnet Calculator',
				description: 'Calculate subnet ranges, masks and host counts.',
			},
			{
				slug: 'ipv4-range-expander',
				built: true,
				name: 'IPv4 Range Expander',
				description: 'Expand an IPv4 range or CIDR into individual addresses.',
			},
			{
				slug: 'ipv6-ula-generator',
				built: true,
				name: 'IPv6 ULA Generator',
				description: 'Generate a unique local IPv6 address prefix.',
			},
			{
				slug: 'mac-address-generator',
				built: true,
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
				built: true,
				name: 'User Agent Parser',
				description: 'Parse a User-Agent string into browser, engine and OS.',
			},
			{
				slug: 'http-status-codes',
				built: true,
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
		icon: 'list-checks',
		blurb: 'Emails, cards, IBANs',
		tools: [
			{
				slug: 'email-validator',
				built: true,
				name: 'Email Validator',
				description: 'Validate email address syntax.',
			},
			{
				slug: 'credit-card-validator',
				built: true,
				name: 'Credit Card Validator',
				description: 'Validate a credit card number with the Luhn check.',
			},
			{
				slug: 'iban-validator',
				built: true,
				name: 'IBAN Validator & Parser',
				description: 'Validate an IBAN and break it down by country/bank/account.',
			},
		],
	},
	{
		name: 'Images',
		icon: 'image',
		blurb: 'Resize, compress, convert',
		tools: [
			{
				slug: 'image-resizer',
				built: true,
				name: 'Image Resizer',
				description: 'Resize images entirely in the browser.',
			},
			{
				slug: 'image-compressor',
				built: true,
				name: 'Image Compressor',
				description: 'Compress images without uploading them anywhere.',
			},
			{
				slug: 'png-to-jpg',
				built: true,
				name: 'PNG to JPG Converter',
				description: 'Convert PNG images to JPG.',
			},
			{
				slug: 'image-to-base64',
				built: true,
				name: 'Image to Base64',
				description: 'Convert an image to a Base64 data URI.',
			},
		],
	},
	{
		name: 'PDF',
		icon: 'file-text',
		blurb: 'Merge, split, compress, convert',
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
		icon: 'wrench',
		blurb: 'SQL, cron, chmod, MIME',
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
				built: true,
				name: 'Docker Run to Compose Converter',
				description: 'Convert a docker run command to a docker-compose.yml.',
			},
			{
				slug: 'mime-types',
				built: true,
				name: 'MIME Types',
				description: 'Look up the MIME type for a file extension.',
			},
			{
				slug: 'chmod-calculator',
				built: true,
				name: 'Chmod Calculator',
				description: 'Compute and explain Unix file permission values.',
			},
			{
				slug: 'regex-cheatsheet',
				built: true,
				name: 'Regex Cheatsheet',
				description: 'Quick reference for common regular expression syntax.',
			},
			{
				slug: 'rest-api-tester',
				name: 'REST API Tester',
				description: 'Send a request and inspect the response, no app install needed.',
			},
			{
				slug: 'docker-cheatsheet',
				name: 'Docker Cheatsheet',
				description: 'Quick reference for common Docker commands.',
			},
			{
				slug: 'git-cheatsheet',
				built: true,
				name: 'Git Cheatsheet',
				description: 'Quick reference for common Git commands.',
			},
			{
				slug: 'npm-cheatsheet',
				name: 'NPM Cheatsheet',
				description: 'Quick reference for common npm/pnpm/yarn commands.',
			},
		],
	},
	{
		name: 'DevOps & Sysadmin',
		icon: 'server',
		blurb: 'Servers, containers, uptime, config',
		tools: [
			{
				slug: 'uptime-sla-calculator',
				built: true,
				name: 'Uptime / SLA Calculator',
				description: 'Turn 99.9% into allowed downtime per day, month and year, and back.',
			},
			{
				slug: 'byte-size-converter',
				built: true,
				name: 'Byte Size Converter',
				description: 'B, KB, KiB, MB, MiB, GB, GiB, TB, TiB: decimal and binary units side by side.',
			},
			{
				slug: 'transfer-time-calculator',
				built: true,
				name: 'Transfer Time Calculator',
				description: 'How long a file takes to move over a given bandwidth, and the bandwidth a deadline needs.',
			},
			{
				slug: 'kubernetes-resource-units',
				built: true,
				name: 'Kubernetes Resource Units',
				description: 'CPU millicores and memory quantities (Mi, Gi, M, G) converted and explained.',
			},
			{
				slug: 'kubernetes-manifest-generator',
				name: 'Kubernetes Manifest Generator',
				description: 'Deployment, Service and Ingress YAML from a short form.',
			},
			{
				slug: 'env-file-tool',
				built: true,
				name: '.env Tool',
				description: 'Validate, diff and convert .env files to JSON, docker -e flags or a Kubernetes Secret.',
			},
			{
				slug: 'yaml-validator',
				name: 'YAML Validator & Formatter',
				description: 'Validate YAML with line-precise errors, format it, convert it to JSON.',
			},
			{
				slug: 'nginx-config-generator',
				name: 'Nginx Config Generator',
				description: 'Reverse proxy, static site, SPA fallback, HTTPS redirect and gzip in a few clicks.',
			},
			{
				slug: 'systemd-unit-generator',
				built: true,
				name: 'systemd Unit Generator',
				description: 'Service and timer units with restart policy, user, environment and hardening options.',
			},
			{
				slug: 'ssh-config-generator',
				built: true,
				name: 'SSH Config Generator',
				description: 'Host blocks for ~/.ssh/config with jump hosts, identity files and port forwarding.',
			},
			{
				slug: 'htpasswd-generator',
				name: 'htpasswd Generator',
				description: 'bcrypt or SHA entries for Nginx and Apache basic auth.',
			},
			{
				slug: 'dns-record-builder',
				built: true,
				name: 'DNS Record Builder',
				description: 'SPF, DMARC, CAA and MX records built and explained, ready to paste.',
			},
			{
				slug: 'security-headers-builder',
				built: true,
				name: 'Security Headers Builder',
				description: 'Content-Security-Policy, HSTS, Permissions-Policy and friends, for Nginx, Apache or a meta tag.',
			},
			{
				slug: 'x509-certificate-decoder',
				name: 'X.509 Certificate Decoder',
				description: 'Paste a PEM certificate: subject, issuer, SANs, validity, fingerprints.',
			},
			{
				slug: 'semver-calculator',
				built: true,
				name: 'SemVer Calculator',
				description: 'Compare versions and test ranges like ^1.2.0, ~2.3 or >=1 <2.',
			},
			{
				slug: 'gitignore-generator',
				built: true,
				name: '.gitignore Generator',
				description: 'Combine templates for languages, frameworks, editors and operating systems.',
			},
			{
				slug: 'json-log-viewer',
				built: true,
				name: 'JSON Log Viewer',
				description: 'Paste structured logs, filter by level and field, read them as a table.',
			},
			{
				slug: 'curl-converter',
				built: true,
				name: 'curl Converter',
				description: 'Turn a curl command into fetch, axios, Python requests or HTTPie.',
			},
			{
				slug: 'well-known-ports',
				built: true,
				name: 'Well-Known Ports',
				description: 'Searchable reference of common TCP and UDP ports and the services behind them.',
			},
			{
				slug: 'linux-signals-exit-codes',
				built: true,
				name: 'Linux Signals & Exit Codes',
				description: 'What SIGTERM, SIGKILL or exit code 137 actually mean.',
			},
		],
	},
	{
		name: 'Calculators',
		icon: 'calculator',
		blurb: 'Bases, currency, units',
		tools: [
			{
				slug: 'developer-calculator',
				name: 'Developer Calculator',
				description: 'A calculator with hex, octal and binary modes.',
			},
			{
				slug: 'currency-converter',
				name: 'Currency Converter',
				description: 'Convert between currencies.',
			},
			{
				slug: 'unit-converter',
				built: true,
				name: 'Unit Converter',
				description: 'Convert length, weight, speed and other units.',
			},
		],
	},
	{
		name: 'Productivity',
		icon: 'timer',
		blurb: 'Stay focused while you build',
		tools: [
			{
				slug: 'pomodoro-timer',
				built: true,
				name: 'Pomodoro Timer',
				description: 'A simple focus timer with work/break intervals.',
			},
		],
	},
	{
		name: 'Testing',
		icon: 'test-tube-2',
		blurb: 'Coming soon',
		tools: [],
	},
	{
		name: 'Design',
		icon: 'palette',
		blurb: 'Coming soon',
		tools: [],
	},
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);

export const builtCategories: Category[] = categories
	.map((c) => ({ ...c, tools: c.tools.filter((t) => t.built) }))
	.filter((c) => c.tools.length > 0);
