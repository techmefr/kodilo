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
		],
	},
	{
		name: 'Encoding',
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
				slug: 'password-generator',
				name: 'Password Generator',
				description: 'Generate secure random passwords.',
			},
			{
				slug: 'qr-code-generator',
				name: 'QR Code Generator',
				description: 'Generate QR codes from text or URLs.',
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
