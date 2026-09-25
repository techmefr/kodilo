import { expect, test } from '@playwright/test';

test('timezone converter handles offsets, DST and day changes', async ({ page }) => {
	await page.goto('tools/timezone-converter/');
	await page.locator('#tz-source').selectOption('UTC');
	await page.locator('#tz-when').fill('2026-01-15T20:00');
	const ny = page.locator('.tz-row[data-zone="America/New_York"]');
	const tokyo = page.locator('.tz-row[data-zone="Asia/Tokyo"]');
	await expect(ny.locator('.tz-time')).toHaveText('15:00');
	await expect(ny.locator('.tz-meta')).toContainText('UTC−05:00');
	await expect(tokyo.locator('.tz-time')).toHaveText('05:00');
	await expect(tokyo.locator('.tz-diff')).toHaveText('+1 day');
	await page.locator('#tz-when').fill('2026-07-15T12:00');
	await expect(ny.locator('.tz-meta')).toContainText('UTC−04:00');
	await expect(ny.locator('.tz-time')).toHaveText('08:00');
	await page.locator('#tz-add-input').fill('Europe/Paris');
	await page.locator('#tz-add').click();
	await expect(page.locator('.tz-row[data-zone="Europe/Paris"] .tz-time')).toHaveText('14:00');
	await page.getByRole('button', { name: 'Remove Asia/Tokyo', exact: true }).click();
	await expect(tokyo).toHaveCount(0);
});

test('line tools sorts, dedupes and counts', async ({ page }) => {
	await page.goto('tools/line-tools/');
	await page.locator('#lt-in').fill('b\n a\nb\n\nitem10\nitem2');
	await page.locator('#lt-dedupe').check();
	await page.getByRole('button', { name: 'Natural', exact: true }).click();
	await expect(page.locator('#lt-out')).toHaveText('a\nb\nitem2\nitem10');
	await expect(page.locator('#lt-in-count')).toHaveText('6');
	await expect(page.locator('#lt-out-count')).toHaveText('4');
	await page.locator('#lt-filter').fill('^item\\d$');
	await page.locator('#lt-regex').check();
	await page.locator('#lt-number').check();
	await expect(page.locator('#lt-out')).toHaveText('1. item2');
});

test('base encoder encodes and decodes Base32, Base58 and hex', async ({ page }) => {
	await page.goto('tools/base-encoder/');
	await page.locator('#be-in').fill('foobar');
	await expect(page.locator('#be-out')).toHaveText('MZXW6YTBOI======');
	await page.getByRole('button', { name: 'Base58', exact: true }).click();
	await page.locator('#be-in').fill('hello world');
	await expect(page.locator('#be-out')).toHaveText('StV1DL6CwTryKyV');
	await page.getByRole('button', { name: 'Hex', exact: true }).click();
	await page.locator('#be-in').fill('é');
	await expect(page.locator('#be-out')).toHaveText('c3a9');
	await expect(page.locator('#be-codes')).toContainText('U+00E9');
	await page.getByRole('button', { name: 'Decode', exact: true }).click();
	await page.locator('#be-in').fill('68656c6c6f');
	await expect(page.locator('#be-out')).toHaveText('hello');
	await page.getByRole('button', { name: 'Base32', exact: true }).click();
	await page.locator('#be-in').fill('MZXW6YTBOI======');
	await expect(page.locator('#be-out')).toHaveText('foobar');
	await page.locator('#be-in').fill('M1!');
	await expect(page.locator('#be-error')).toContainText('Invalid Base32 character');
});

test('markdown table generator pads, aligns and escapes pipes', async ({ page }) => {
	await page.goto('tools/markdown-table-generator/');
	await expect(page.locator('#mt-out')).toContainText('| Name          | Language   |  Stars |');
	await expect(page.locator('#mt-out')).toContainText('| ------------- | ---------- | -----: |');
	await expect(page.locator('#mt-out')).toContainText('Rust \\| Cargo');
	await page.locator('#mt-csv').fill('a\tb\n1\tx');
	await page.getByRole('button', { name: 'Import', exact: true }).click();
	await expect(page.locator('#mt-out')).toHaveText('| a   | b   |\n| --: | --- |\n|   1 | x   |');
	await page.getByLabel('Row 1, column 2').fill('long value');
	await page.getByLabel('Column 2 alignment').selectOption('center');
	await expect(page.locator('#mt-out')).toHaveText('| a   |     b      |\n| --: | :--------: |\n|   1 | long value |');
});

test('color shades generator builds a scale around the base', async ({ page }) => {
	await page.goto('tools/color-shades-generator/');
	await page.locator('#cs-hex').fill('#3b82f6');
	await expect(page.locator('.cs-shade')).toHaveCount(11);
	await expect(page.locator('.cs-shade[data-step="500"] .cs-hex')).toHaveText('#3b82f6');
	await expect(page.locator('.cs-shade[data-step="500"] .cs-ratios')).toHaveText('White 3.68 · Black 5.71');
	await expect(page.locator('#cs-out')).toContainText("500: '#3b82f6',");
	await page.getByRole('button', { name: 'CSS variables', exact: true }).click();
	await expect(page.locator('#cs-out')).toContainText('--brand-500: #3b82f6;');
	await page.locator('#cs-hex').fill('#fef08a');
	await page.getByRole('button', { name: 'Nearest step', exact: true }).click();
	await expect(page.locator('.cs-shade[data-step="100"] .cs-hex')).toHaveText('#fef08a');
	await page.getByRole('button', { name: 'List', exact: true }).click();
	await expect(page.locator('#cs-out')).toContainText('100 #fef08a');
});
