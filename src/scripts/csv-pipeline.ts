import { sortRows, uniqueRows } from './csv';

export interface PipelineOptions {
	filterColumn: number;
	filterMode: string;
	filterValue: string;
	sortColumn: number;
	descending: boolean;
	dedupe: boolean;
	keep: number[];
}

function matches(cell: string, mode: string, needle: string): boolean {
	const a = cell.toLowerCase();
	const b = needle.toLowerCase();
	return mode === 'equals' ? a === b : a.includes(b);
}

export function runPipeline(rows: string[][], options: PipelineOptions): string[][] {
	if (!rows.length) return [];
	const [header, ...rest] = rows;
	const width = header.length;
	let body = rest.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? ''));
	if (options.filterColumn >= 0 && options.filterValue !== '') {
		body = body.filter((r) => matches(r[options.filterColumn] ?? '', options.filterMode, options.filterValue));
	}
	if (options.dedupe) body = uniqueRows(body);
	if (options.sortColumn >= 0) body = sortRows(body, options.sortColumn, options.descending);
	const pick = (r: string[]) => options.keep.map((i) => r[i]);
	return [pick(header), ...body.map(pick)];
}
