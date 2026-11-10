import { expect, test, type Page } from '@playwright/test';

async function pickLanguage(page: Page, code: string) {
	await page.locator('#lang-btn').click();
	await page.locator(`#lang-${code}`).click();
}

test('the language picker lists every locale with flag and native name', async ({ page }) => {
	await page.goto('./');
	await page.locator('#lang-btn').click();
	const options = page.locator('#lang-list [role="option"]');
	expect(await options.count()).toBeGreaterThanOrEqual(20);
	await expect(page.locator('#lang-fr')).toHaveText('Français');
	await expect(page.locator('#lang-ja')).toHaveText('日本語');
	await expect(page.locator('#lang-ar')).toHaveText('العربية');
	const flags = await options.evaluateAll((items) => items.map((li) => (li.querySelector('img') as HTMLImageElement).src));
	expect(flags.every((src) => /\/flags\/[a-z]{2}\.svg$/.test(src))).toBe(true);
	const loaded = await page.locator('#lang-fr img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
	expect(loaded).toBe(true);
});

test('the language picker works from the keyboard', async ({ page }) => {
	await page.goto('./');
	await page.locator('#lang-btn').focus();
	await page.keyboard.press('Enter');
	await expect(page.locator('#lang-list')).toBeVisible();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Escape');
	await expect(page.locator('#lang-list')).toBeHidden();
	await expect(page.locator('#lang-btn')).toBeFocused();
});

test('choosing a language translates the page and sets lang and dir', async ({ page }) => {
	await page.goto('./');
	await pickLanguage(page, 'fr');
	await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
	await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
	await expect(page.locator('#hero-search')).not.toContainText('Search a tool');
	await expect(page.locator('#lang-btn .lang-name')).toHaveText('Français');
	await pickLanguage(page, 'ar');
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	await pickLanguage(page, 'en');
	await expect(page.locator('#hero-search')).toContainText('Search a tool');
});

test('the stored language survives navigation to a tool page', async ({ page }) => {
	await page.goto('./');
	await pickLanguage(page, 'de');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await page.goto('tools/json-formatter/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.locator('.search-label')).not.toHaveText(/^Search/);
});

test('the sidebar footer links carry an icon and French feedback is not "Retour"', async ({ page }) => {
	await page.goto('./');
	await expect(page.locator('.side-suggest svg')).toBeVisible();
	await expect(page.locator('.side-feedback svg')).toBeVisible();
	await pickLanguage(page, 'fr');
	await expect(page.locator('.side-feedback')).not.toContainText('Retour');
});

test('hyphenated option labels are translated', async ({ page }) => {
	await page.goto('./');
	await pickLanguage(page, 'fr');
	await page.goto('tools/csv-tools/');
	await expect(page.locator('option').first()).toHaveText('Détection automatique');
});
