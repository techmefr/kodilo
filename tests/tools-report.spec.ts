import { expect, test } from '@playwright/test';

test('every tool has a report link that fills in the browser, device and theme', async ({ page }) => {
	await page.goto('tools/json-diff/');
	const report = page.getByRole('link', { name: 'Report a problem' });
	await expect(report).toBeVisible();
	await report.hover();
	const url = new URL((await report.getAttribute('href'))!);
	expect(url.searchParams.get('template')).toBe('bug-report.yml');
	expect(url.searchParams.get('tool-url')).toMatch(/\/kodilo\/tools\/json-diff\/$/);
	expect(url.searchParams.get('browser')).toMatch(/^\w+ \d+ on \w+, viewport \d+×\d+, language en$/);
	expect(url.searchParams.get('theme')).toBe('Light');
});

test.describe('dark', () => {
	test.use({ colorScheme: 'dark' });

	test('the theme is detected', async ({ page }) => {
		await page.goto('tools/json-diff/');
		const report = page.getByRole('link', { name: 'Report a problem' });
		await report.hover();
		expect(new URL((await report.getAttribute('href'))!).searchParams.get('theme')).toBe('Dark');
	});
});

test('the sidebar feedback link carries the current page', async ({ page }) => {
	await page.goto('tools/base64/');
	const feedback = page.locator('.side-feedback').first();
	await feedback.hover();
	const url = new URL((await feedback.getAttribute('href'))!);
	expect(url.searchParams.get('template')).toBe('feedback.yml');
	expect(url.searchParams.get('page-url')).toMatch(/\/kodilo\/tools\/base64\/$/);
});
