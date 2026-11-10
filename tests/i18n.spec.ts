import { expect, test } from '@playwright/test';

test('the language selector lists every locale with flag and native name', async ({ page }) => {
	await page.goto('./');
	const options = await page.locator('#lang-select option').allTextContents();
	expect(options.length).toBeGreaterThanOrEqual(20);
	expect(options).toContain('🇫🇷 Français');
	expect(options).toContain('🇯🇵 日本語');
	expect(options).toContain('🇸🇦 العربية');
});

test('choosing a language translates the page and sets lang and dir', async ({ page }) => {
	await page.goto('./');
	await page.locator('#lang-select').selectOption('fr');
	await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
	await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
	await expect(page.locator('#hero-search')).not.toContainText('Search a tool');
	await page.locator('#lang-select').selectOption('ar');
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	await page.locator('#lang-select').selectOption('en');
	await expect(page.locator('#hero-search')).toContainText('Search a tool');
});

test('the stored language survives navigation to a tool page', async ({ page }) => {
	await page.goto('./');
	await page.locator('#lang-select').selectOption('de');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await page.goto('tools/json-formatter/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.locator('.search-label')).not.toHaveText(/^Search/);
});
