export interface FindOptions {
	pattern: string;
	regex: boolean;
	caseSensitive: boolean;
	wholeWord: boolean;
	replacement: string;
}

export interface FindResult {
	output: string;
	count: number;
	error: string;
}

const escapeLiteral = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function buildPattern(options: FindOptions): RegExp {
	const source = options.regex ? options.pattern : escapeLiteral(options.pattern);
	const bounded = options.wholeWord ? `(?<!\\w)(?:${source})(?!\\w)` : source;
	return new RegExp(bounded, options.caseSensitive ? 'g' : 'gi');
}

export function findReplace(text: string, options: FindOptions): FindResult {
	if (options.pattern === '') return { output: text, count: 0, error: '' };
	try {
		const pattern = buildPattern(options);
		const count = Array.from(text.matchAll(pattern)).length;
		const output = options.regex ? text.replace(pattern, options.replacement) : text.replace(pattern, () => options.replacement);
		return { output, count, error: '' };
	} catch (error) {
		return { output: text, count: 0, error: error instanceof Error ? error.message : 'Invalid pattern' };
	}
}
