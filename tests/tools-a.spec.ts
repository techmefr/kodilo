import { expect, test } from '@playwright/test';

test('javascript formatter beautifies and minifies', async ({ page }) => {
	await page.goto('tools/javascript-formatter/');
	const out = page.locator('#jsf-out');
	await expect(out).toContainText('export const pick = (obj, keys) =>', { timeout: 15000 });
	await page.locator('#jsf-in').fill('const a = {b:1}\nconsole.log( a.b )');
	await expect(out).toHaveText('const a = { b: 1 };\nconsole.log(a.b);\n');
	await page.locator('#jsf-semi').uncheck();
	await expect(out).toHaveText('const a = { b: 1 }\nconsole.log(a.b)\n');
	await page.locator('#jsf-mode button[data-value="minify"]').click();
	await page.locator('#jsf-in').fill('function add(first, second) {\n  return first + second;\n}\nconsole.log(add(1, 2));');
	await expect(out).toHaveText('console.log(1+2);', { timeout: 15000 });
	await expect(page.locator('#jsf-stats')).toBeVisible();
	await page.locator('#jsf-in').fill('const x = ;');
	await expect(page.locator('#jsf-error')).toContainText('Line 1');
});

test('javascript formatter handles typescript', async ({ page }) => {
	await page.goto('tools/javascript-formatter/');
	await page.locator('#jsf-lang button[data-value="ts"]').click();
	await page.locator('#jsf-in').fill('let n:number=1');
	await expect(page.locator('#jsf-out')).toHaveText('let n: number = 1;\n', { timeout: 15000 });
});

test('csv to json detects delimiter and types values', async ({ page }) => {
	await page.goto('tools/csv-to-json/');
	await expect(page.locator('#c2j-delim')).toHaveText('Semicolon');
	await expect(page.locator('#c2j-rows')).toHaveText('4');
	await expect(page.locator('#c2j-cols')).toHaveText('6');
	await page.locator('#c2j-in').fill('a,b,c\n1,true,\nx,2.5,null');
	await expect(page.locator('#c2j-delim')).toHaveText('Comma');
	const json = JSON.parse((await page.locator('#c2j-out').textContent()) ?? '');
	expect(json).toEqual([
		{ a: 1, b: true, c: null },
		{ a: 'x', b: 2.5, c: null },
	]);
	await page.locator('#c2j-shape button[data-value="arrays"]').click();
	await page.locator('#c2j-header').uncheck();
	await page.locator('#c2j-typed').uncheck();
	expect(JSON.parse((await page.locator('#c2j-out').textContent()) ?? '')).toEqual([
		['a', 'b', 'c'],
		['1', 'true', ''],
		['x', '2.5', 'null'],
	]);
});

test('jsonpath tester finds matches with paths', async ({ page }) => {
	await page.goto('tools/jsonpath-tester/');
	await expect(page.locator('#jp-count')).toHaveText('2 matches');
	expect(JSON.parse((await page.locator('#jp-out').textContent()) ?? '')).toEqual(['Sayings of the Century', 'Moby Dick']);
	await page.locator('#jp-examples button', { hasText: '$..author' }).click();
	await expect(page.locator('#jp-count')).toHaveText('4 matches');
	await expect(page.locator('#jp-paths li').first()).toHaveText("$['store']['book'][0]['author']");
});

test('fake data generator is reproducible with a seed', async ({ page }) => {
	await page.goto('tools/fake-data-generator/');
	const first = JSON.parse((await page.locator('#fd-out').textContent()) ?? '');
	expect(first).toHaveLength(10);
	expect(Object.keys(first[0])).toEqual(['id', 'name', 'email', 'city', 'active']);
	await page.locator('#fd-seed').fill('7');
	await page.locator('#fd-seed').fill('42');
	expect(JSON.parse((await page.locator('#fd-out').textContent()) ?? '')).toEqual(first);
	await page.locator('#fd-format button[data-value="sql"]').click();
	await page.locator('#fd-rows').fill('3');
	await page.locator('#fd-table').fill('people');
	const sql = ((await page.locator('#fd-out').textContent()) ?? '').split('\n');
	expect(sql).toHaveLength(3);
	expect(sql[0]).toMatch(/^INSERT INTO "people" \("id", "name", "email", "city", "active"\) VALUES \('[0-9a-f-]{36}', '.+', (TRUE|FALSE)\);$/);
	await page.locator('#fd-format button[data-value="csv"]').click();
	await expect(page.locator('#fd-out')).toContainText('id,name,email,city,active\n');
});

test('mermaid editor renders and reports errors', async ({ page }) => {
	await page.goto('tools/mermaid-editor/');
	await expect(page.locator('#mm-view svg')).toBeVisible({ timeout: 15000 });
	await expect(page.locator('#mm-view')).toContainText('Promote to production');
	await page.locator('#mm-tool button[data-example="sequence"]').click();
	await expect(page.locator('#mm-view')).toContainText('Auth server');
	await page.locator('#mm-in').fill('flowchart LR\n  A --> ');
	await expect(page.locator('#mm-error')).toBeVisible();
	await expect(page.locator('#mm-status')).toHaveText('Syntax error');
});
