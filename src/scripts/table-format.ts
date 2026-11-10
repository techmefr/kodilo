export function markdownTable(rows: string[][]): string {
	if (!rows.length) return '';
	const width = Math.max(...rows.map((r) => r.length));
	const cell = (v: string) => v.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
	const line = (r: string[]) => `| ${Array.from({ length: width }, (_, i) => cell(r[i] ?? '')).join(' | ')} |`;
	const divider = `| ${Array.from({ length: width }, () => '---').join(' | ')} |`;
	return [line(rows[0]), divider, ...rows.slice(1).map(line)].join('\n');
}

export function tsvTable(rows: string[][]): string {
	const cell = (v: string) => v.replace(/[\t\r\n]+/g, ' ');
	return rows.map((r) => r.map(cell).join('\t')).join('\n');
}

export function renderTable(table: HTMLTableElement, rows: string[][]) {
	table.replaceChildren();
	if (!rows.length) return;
	const head = table.createTHead().insertRow();
	rows[0].forEach((name) => {
		const th = document.createElement('th');
		th.scope = 'col';
		th.textContent = name;
		head.append(th);
	});
	const body = table.createTBody();
	rows.slice(1).forEach((r) => {
		const tr = body.insertRow();
		rows[0].forEach((_, i) => (tr.insertCell().textContent = r[i] ?? ''));
	});
}
