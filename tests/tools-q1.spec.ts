import { expect, test } from '@playwright/test';

test('csv tools parses quotes, filters, sorts, dedupes and converts', async ({ page }) => {
	await page.goto('tools/csv-tools/');
	await expect(page.locator('#ct-table tbody tr')).toHaveCount(6);
	await expect(page.locator('#ct-table tbody tr').first()).toContainText('Lovelace, Ada');
	await page.locator('#ct-dedupe').check();
	await expect(page.locator('#ct-table tbody tr')).toHaveCount(5);
	await page.locator('#ct-filter-col').selectOption({ label: 'department' });
	await page.locator('#ct-filter-val').fill('research');
	await expect(page.locator('#ct-table tbody tr')).toHaveCount(2);
	await page.locator('#ct-filter-mode').selectOption('equals');
	await page.locator('#ct-filter-val').fill('Res');
	await expect(page.locator('#ct-table tbody tr')).toHaveCount(0);
	await page.locator('#ct-filter-val').fill('');
	await page.locator('#ct-sort-col').selectOption({ label: 'salary' });
	await page.locator('#ct-sort-order').selectOption('desc');
	await expect(page.locator('#ct-table tbody tr').first()).toContainText('Hamilton');
	await page.getByRole('radio', { name: 'Markdown' }).click();
	await expect(page.locator('#ct-out')).toContainText('| id | name | department | city | salary |');
	await expect(page.locator('#ct-out')).toContainText('| --- | --- |');
	await page.getByRole('radio', { name: 'TSV' }).click();
	await expect(page.locator('#ct-out')).toContainText('4\t"Margaret ""Peggy"" Hamilton"\tResearch');
	await page.locator('#ct-cols input[value="3"]').uncheck();
	await expect(page.locator('#ct-table th')).toHaveCount(4);
	await expect(page.locator('#ct-ok')).toBeVisible();
});

test('csv tools validates ragged rows and unclosed quotes', async ({ page }) => {
	await page.goto('tools/csv-tools/');
	await page.locator('#ct-in').fill('a,b,c\n1,2,3\n4,5\n6,"7,8\n');
	await expect(page.locator('#ct-issues')).toContainText('Line 3: expected 3 fields but found 2.');
	await expect(page.locator('#ct-issues')).toContainText('Line 4: unclosed quote.');
	await page.locator('#ct-in').fill('x;y\n1;2');
	await page.getByRole('radio', { name: 'Pipe' }).click();
	await expect(page.locator('#ct-out')).toHaveText('x|y\n1|2');
});

test('json key tools sorts, lists paths, finds values, escapes and minifies', async ({ page }) => {
	await page.goto('tools/json-key-tools/');
	await page.locator('#jk-in').fill('{"b":{"z":1,"a":2},"a":[{"d":1,"c":{"id":5}}],"id":9}');
	await expect(page.locator('#jk-out')).toContainText('"a": [');
	const sorted = await page.locator('#jk-out').textContent();
	expect(sorted?.indexOf('"a"')).toBeLessThan(sorted?.indexOf('"b"') ?? 0);
	await page.locator('#jk-order').selectOption('desc');
	const desc = await page.locator('#jk-out').textContent();
	expect(desc?.indexOf('"id"')).toBeLessThan(desc?.indexOf('"a"') ?? 0);
	await page.getByRole('radio', { name: 'Key paths' }).click();
	await expect(page.locator('#jk-out')).toHaveText('b\nb.z\nb.a\na\na[0].d\na[0].c\na[0].c.id\nid');
	await page.getByRole('radio', { name: 'Values of key' }).click();
	await page.locator('#jk-key').fill('id');
	await expect(page.locator('#jk-out')).toContainText('5');
	await expect(page.locator('#jk-count')).toHaveText('2 values for "id"');
	await page.getByRole('radio', { name: 'Minify' }).click();
	await expect(page.locator('#jk-out')).toHaveText('{"b":{"z":1,"a":2},"a":[{"d":1,"c":{"id":5}}],"id":9}');
	await page.locator('#jk-in').fill('say "hi"\nnow');
	await page.getByRole('radio', { name: 'Escape', exact: true }).click();
	await expect(page.locator('#jk-out')).toHaveText('"say \\"hi\\"\\nnow"');
	await page.locator('#jk-in').fill('"say \\"hi\\"\\nnow"');
	await page.getByRole('radio', { name: 'Unescape' }).click();
	await expect(page.locator('#jk-out')).toHaveText('say "hi"\nnow');
});

test('json schema generator infers types, required keys and formats', async ({ page }) => {
	await page.goto('tools/json-schema-generator/');
	await page
		.locator('#jsg-in')
		.fill('[{"id":1,"at":"2024-01-01T00:00:00Z","mail":"a@b.co","n":null},{"id":2.5,"at":"2024-02-01T00:00:00Z","mail":"c@d.io","x":"y"}]');
	const schema = JSON.parse((await page.locator('#jsg-out').textContent()) ?? '{}');
	expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
	expect(schema.title).toBe('User');
	expect(schema.type).toBe('array');
	expect(schema.items.required).toEqual(['id', 'at', 'mail']);
	expect(schema.items.properties.id).toEqual({ type: 'number' });
	expect(schema.items.properties.at).toEqual({ type: 'string', format: 'date-time' });
	expect(schema.items.properties.mail.format).toBe('email');
	await page.locator('#jsg-in').fill('{broken');
	await expect(page.locator('#jsg-error')).toBeVisible();
});

test('json to table flattens nested keys and copies TSV', async ({ page }) => {
	await page.goto('tools/json-to-table/');
	await expect(page.locator('#jt-count')).toHaveText('3 rows, 6 columns');
	await expect(page.locator('#jt-table th')).toHaveText(['id', 'name', 'address.city', 'address.country', 'skills', 'active']);
	await page.locator('#jt-in').fill('[{"a":1,"b":{"c":"x|y"}},{"a":2}]');
	await expect(page.locator('#jt-table th')).toHaveText(['a', 'b.c']);
	await expect(page.locator('#jt-table tbody tr').nth(1)).toContainText('2');
	await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.getByRole('button', { name: 'Copy Markdown' }).click();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('| a | b.c |\n| --- | --- |\n| 1 | x\\|y |\n| 2 |  |');
	await page.getByRole('button', { name: 'Copy TSV' }).click();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('a\tb.c\n1\tx|y\n2\t');
});
