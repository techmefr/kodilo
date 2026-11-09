import { expect, test } from '@playwright/test';

const schedules: [string, string][] = [
	['every weekday at 9:30', '30 9 * * 1-5'],
	['every 15 minutes', '*/15 * * * *'],
	['on the 1st of every month at midnight', '0 0 1 * *'],
	['every sunday at 2am', '0 2 * * 0'],
	['every day at 9am and 5pm', '0 9,17 * * *'],
	['every january 1st at 6:30', '30 6 1 1 *'],
];

test('cron from plain english builds the expression for each phrase', async ({ page }) => {
	await page.goto('tools/cron-from-english/');
	await expect(page.locator('#ce-expr')).toHaveText('30 9 * * 1-5');
	for (const [phrase, expression] of schedules) {
		await page.locator('#ce-text').fill(phrase);
		await expect(page.locator('#ce-expr')).toHaveText(expression);
	}
});

test('cron from plain english fills the field breakdown and examples', async ({ page }) => {
	await page.goto('tools/cron-from-english/');
	await page.getByRole('button', { name: 'Sunday 2am' }).click();
	await expect(page.locator('#ce-fields dd')).toHaveText(['0', '2', '*', '*', '0']);
});

test('cron from plain english explains what it cannot express', async ({ page }) => {
	await page.goto('tools/cron-from-english/');
	await page.locator('#ce-text').fill('last day of the month');
	await expect(page.locator('#ce-field')).toHaveClass(/invalid/);
	await expect(page.locator('#ce-note')).toContainText('not part of standard cron');
	await expect(page.locator('#ce-expr')).toHaveText('');
	await page.locator('#ce-text').fill('sometimes');
	await expect(page.locator('#ce-note')).toContainText('not understood');
});

test('text compressor round trips through gzip and reports the saving', async ({ page }) => {
	await page.goto('tools/text-compressor/');
	await expect(page.locator('#tc-out')).toHaveText(/^H4sI/);
	await expect(page.locator('#tc-stats')).toContainText('smaller');
	const packed = (await page.locator('#tc-out').textContent()) ?? '';
	await page.getByRole('radio', { name: 'Decompress' }).click();
	await page.locator('#tc-in').fill(packed);
	await expect(page.locator('#tc-out')).toContainText('"name":"kodilo"');
});

test('text compressor supports deflate-raw in hex and rejects bad input', async ({ page }) => {
	await page.goto('tools/text-compressor/');
	await page.locator('#tc-in').fill('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
	await page.getByRole('radio', { name: 'deflate-raw' }).click();
	await page.getByRole('radio', { name: 'Hex' }).click();
	await expect(page.locator('#tc-out')).toHaveText(/^[0-9a-f]+$/);
	await page.getByRole('radio', { name: 'Decompress' }).click();
	await page.locator('#tc-in').fill('zz');
	await expect(page.locator('#tc-out')).toHaveText('Not valid hex');
});
