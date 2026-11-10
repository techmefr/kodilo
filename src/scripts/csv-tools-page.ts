import { byId, copyButton, segmented } from './ui';
import { fileZone } from './files';
import { DELIMITERS, detectDelimiter, parseCsv, stringifyCsv, validateCsv } from './csv';
import { runPipeline } from './csv-pipeline';
import { markdownTable, renderTable } from './table-format';

export function setupCsvTools() {
	const input = byId<HTMLTextAreaElement>('ct-in');
	const delim = byId<HTMLSelectElement>('ct-delim');
	const filterCol = byId<HTMLSelectElement>('ct-filter-col');
	const filterMode = byId<HTMLSelectElement>('ct-filter-mode');
	const filterVal = byId<HTMLInputElement>('ct-filter-val');
	const sortCol = byId<HTMLSelectElement>('ct-sort-col');
	const sortOrder = byId<HTMLSelectElement>('ct-sort-order');
	const dedupe = byId<HTMLInputElement>('ct-dedupe');
	const colBox = byId('ct-cols');
	const output = byId('ct-out');
	const issues = byId('ct-issues');
	const ok = byId('ct-ok');
	const count = byId('ct-count');
	let format = 'comma';
	let headerKey = '';

	const fillSelect = (select: HTMLSelectElement, header: string[], blank: string) => {
		const previous = select.value;
		select.replaceChildren(new Option(blank, '-1'));
		header.forEach((name, i) => select.add(new Option(name, String(i))));
		select.value = Number(previous) < header.length ? previous : '-1';
	};

	const syncColumns = (header: string[]) => {
		const key = JSON.stringify(header);
		if (key === headerKey) return;
		headerKey = key;
		fillSelect(filterCol, header, 'None');
		fillSelect(sortCol, header, 'None');
		colBox.querySelectorAll('label').forEach((l) => l.remove());
		header.forEach((name, i) => {
			const label = document.createElement('label');
			label.className = 'check';
			const box = document.createElement('input');
			box.type = 'checkbox';
			box.checked = true;
			box.value = String(i);
			label.append(box, ` ${name}`);
			colBox.append(label);
		});
	};

	const render = () => {
		const separator = delim.value === 'auto' ? detectDelimiter(input.value) : DELIMITERS[delim.value];
		const parsed = parseCsv(input.value, separator);
		const rows = parsed.records.map((r) => r.cells);
		syncColumns(rows[0] ?? []);
		const keep = [...colBox.querySelectorAll<HTMLInputElement>('input:checked')].map((b) => Number(b.value));
		const result = runPipeline(rows, {
			filterColumn: Number(filterCol.value),
			filterMode: filterMode.value,
			filterValue: filterVal.value,
			sortColumn: Number(sortCol.value),
			descending: sortOrder.value === 'desc',
			dedupe: dedupe.checked,
			keep,
		});
		output.textContent = format === 'markdown' ? markdownTable(result) : stringifyCsv(result, DELIMITERS[format]);
		renderTable(byId<HTMLTableElement>('ct-table'), result);
		const problems = validateCsv(parsed);
		issues.hidden = !problems.length;
		ok.hidden = problems.length > 0 || rows.length === 0;
		issues.replaceChildren(
			...problems.map((p) => {
				const li = document.createElement('li');
				li.textContent = p;
				return li;
			}),
		);
		const body = Math.max(result.length - 1, 0);
		count.textContent = `${body} of ${Math.max(rows.length - 1, 0)} rows shown`;
	};

	segmented(byId('ct-format'), (value) => {
		format = value;
		render();
	});
	[input, delim, filterCol, filterMode, filterVal, sortCol, sortOrder, dedupe].forEach((el) => {
		el.addEventListener('input', render);
		el.addEventListener('change', render);
	});
	colBox.addEventListener('change', render);
	fileZone(byId('ct-drop'), byId<HTMLInputElement>('ct-file'), async ([file]) => {
		if (!file) return;
		input.value = await file.text();
		render();
	});
	copyButton(byId('ct-copy'), () => output.textContent ?? '');
	render();
}
