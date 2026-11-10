export interface CsvRecord {
	cells: string[];
	line: number;
}

export interface CsvParse {
	records: CsvRecord[];
	unclosedQuoteLine: number | null;
}

export const DELIMITERS: Record<string, string> = { comma: ',', semicolon: ';', tab: '\t', pipe: '|' };

export function parseCsv(text: string, delimiter: string): CsvParse {
	const records: CsvRecord[] = [];
	let cells: string[] = [];
	let cell = '';
	let quoted = false;
	let wasQuoted = false;
	let line = 1;
	let startLine = 1;
	let quoteLine = 0;
	let pending = false;
	const endCell = () => {
		cells.push(cell);
		cell = '';
		wasQuoted = false;
	};
	const endRecord = () => {
		endCell();
		records.push({ cells, line: startLine });
		cells = [];
		pending = false;
	};
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (quoted) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					cell += '"';
					i++;
				} else quoted = false;
			} else {
				if (ch === '\n') line++;
				cell += ch;
			}
			continue;
		}
		if (!pending) {
			startLine = line;
			pending = true;
		}
		if (ch === '"' && cell === '' && !wasQuoted) {
			quoted = true;
			wasQuoted = true;
			quoteLine = line;
		} else if (ch === delimiter) endCell();
		else if (ch === '\n' || ch === '\r') {
			if (ch === '\r' && text[i + 1] === '\n') i++;
			endRecord();
			line++;
		} else cell += ch;
	}
	if (pending) endRecord();
	return { records, unclosedQuoteLine: quoted ? quoteLine : null };
}

export function detectDelimiter(text: string): string {
	const first = text.split(/\r?\n/)[0] ?? '';
	const counts = Object.values(DELIMITERS).map((d) => [d, first.split(d).length] as const);
	return counts.reduce((best, c) => (c[1] > best[1] ? c : best), [',', 1] as readonly [string, number])[0];
}

export function quoteCell(value: string, delimiter: string): string {
	const needs = value.includes(delimiter) || /["\r\n]/.test(value);
	return needs ? `"${value.replace(/"/g, '""')}"` : value;
}

export function stringifyCsv(rows: string[][], delimiter: string): string {
	return rows.map((r) => r.map((c) => quoteCell(c, delimiter)).join(delimiter)).join('\n');
}

export function validateCsv(parse: CsvParse): string[] {
	const issues: string[] = [];
	if (parse.unclosedQuoteLine !== null) issues.push(`Line ${parse.unclosedQuoteLine}: unclosed quote.`);
	const expected = parse.records[0]?.cells.length ?? 0;
	parse.records.forEach((r) => {
		if (r.cells.length !== expected) issues.push(`Line ${r.line}: expected ${expected} fields but found ${r.cells.length}.`);
	});
	return issues;
}

export function sortRows(rows: string[][], column: number, descending: boolean): string[][] {
	const key = (r: string[]) => r[column] ?? '';
	const numeric = rows.every((r) => key(r) !== '' && !Number.isNaN(Number(key(r))));
	const sorted = [...rows].sort((a, b) =>
		numeric ? Number(key(a)) - Number(key(b)) : key(a).localeCompare(key(b), undefined, { numeric: true, sensitivity: 'base' }),
	);
	return descending ? sorted.reverse() : sorted;
}

export function uniqueRows(rows: string[][]): string[][] {
	const seen = new Set<string>();
	return rows.filter((r) => {
		const k = JSON.stringify(r);
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}
