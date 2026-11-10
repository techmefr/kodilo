import { expect, test } from '@playwright/test';

test('find and replace uses groups, case and whole word', async ({ page }) => {
	await page.goto('tools/find-replace/');
	await expect(page.locator('#fr-count')).toHaveText('3');
	await expect(page.locator('#fr-out')).toContainText('ana@kodilo.dev, bob@kodilo.dev');
	await expect(page.locator('#fr-out')).toContainText('Not matched: carol@example.org');
	await page.locator('#fr-case').check();
	await expect(page.locator('#fr-count')).toHaveText('2');
	await page.locator('#fr-regex').uncheck();
	await page.locator('#fr-find').fill('a');
	await page.locator('#fr-replace').fill('$1');
	await page.locator('#fr-in').fill('banana a Ab');
	await page.locator('#fr-word').check();
	await expect(page.locator('#fr-count')).toHaveText('1');
	await expect(page.locator('#fr-out')).toHaveText('banana $1 Ab');
	await page.locator('#fr-regex').check();
	await page.locator('#fr-find').fill('(');
	await expect(page.locator('#fr-error')).toBeVisible();
});

test('text cleaner applies operations with counters', async ({ page }) => {
	await page.goto('tools/text-cleaner/');
	await expect(page.locator('#tc-out')).toHaveText('banana apple\napple\ncherry cherry pie');
	await expect(page.locator('#tc-after')).toHaveText('36 · 6 · 3');
	await page.locator('[data-op="dupWords"]').check();
	await expect(page.locator('#tc-out')).toHaveText('banana apple\napple\ncherry pie');
	await page.locator('[data-op="sort"]').check();
	await expect(page.locator('#tc-out')).toHaveText('apple\nbanana apple\ncherry pie');
	await page.locator('[data-op="reverseText"]').check();
	await expect(page.locator('#tc-out')).toHaveText('eip yrrehc\nelppa ananab\nelppa');
});

test('random generator respects length, range and unique', async ({ page }) => {
	await page.goto('tools/random-generator/');
	const lines = async () => (await page.locator('#rg-out').innerText()).split('\n');
	let result = await lines();
	expect(result).toHaveLength(5);
	expect(result.every((l) => /^[\w-]{21}$/.test(l))).toBe(true);
	await page.getByRole('radio', { name: 'Number' }).click();
	await page.locator('#rg-min').fill('1');
	await page.locator('#rg-max').fill('5');
	await page.locator('#rg-unique').check();
	await page.locator('#rg-number-count').fill('5');
	result = await lines();
	expect([...result].sort()).toEqual(['1', '2', '3', '4', '5']);
	await page.locator('#rg-number-count').fill('6');
	await expect(page.locator('#rg-error')).toBeVisible();
	await page.getByRole('radio', { name: 'Decimal' }).click();
	await page.locator('#rg-unique').uncheck();
	await page.locator('#rg-number-count').fill('20');
	result = await lines();
	expect(result.every((l) => /^[1-4]\.\d\d$|^5\.00$/.test(l))).toBe(true);
	await page.getByRole('radio', { name: 'String' }).click();
	await page.locator('#rg-charset').selectOption('digits');
	await page.locator('#rg-string-length').fill('8');
	result = await lines();
	expect(result.every((l) => /^\d{8}$/.test(l))).toBe(true);
});

test('unicode escape converts both ways with surrogate pairs', async ({ page }) => {
	await page.goto('tools/unicode-escape/');
	const out = page.locator('#ue-out');
	await page.locator('#ue-in').fill('A😀é');
	await expect(out).toHaveText('\\u0041\\uD83D\\uDE00\\u00E9');
	await page.locator('#ue-format').selectOption('jsbrace');
	await expect(out).toHaveText('\\u{41}\\u{1F600}\\u{E9}');
	await page.locator('#ue-format').selectOption('uplus');
	await expect(out).toHaveText('U+0041 U+1F600 U+00E9');
	await page.locator('#ue-format').selectOption('hexref');
	await expect(out).toHaveText('&#x41;&#x1F600;&#xE9;');
	await page.locator('#ue-format').selectOption('hex');
	await expect(out).toHaveText('41 F0 9F 98 80 C3 A9');
	await page.locator('#ue-format').selectOption('entity');
	await page.locator('#ue-in').fill('<a> & ©');
	await expect(out).toHaveText('&lt;a&gt; &amp; &copy;');
	await page.getByRole('radio', { name: 'Escapes to text' }).click();
	await expect(out).toHaveText('<a> & ©');
	await page.locator('#ue-in').fill('\\uD83D\\uDE00 \\u{1F600} U+00E9 &#x41; &#66; &eacute;');
	await expect(out).toHaveText('😀 😀 é A B &eacute;');
	await page.locator('#ue-format').selectOption('hex');
	await page.locator('#ue-in').fill('F0 9F 98 80 C3 A9');
	await expect(out).toHaveText('😀é');
});
