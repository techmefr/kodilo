import { expect, test } from '@playwright/test';

test('the search shortcut is shown with a plus', async ({ page }) => {
	await page.goto('./');
	await expect(page.locator('#search-kbd')).toHaveText('Ctrl + K');
	await page.keyboard.press('?');
	await expect(page.locator('#shortcuts .plus').first()).toHaveText('+');
});

test('the palette filters by category with the left and right arrows', async ({ page }) => {
	await page.goto('./');
	await page.keyboard.press('/');
	const chips = page.locator('#palette-cats button');
	await expect(chips.first()).toHaveText('All');
	await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');
	expect(await chips.count()).toBeGreaterThan(8);

	await page.keyboard.press('ArrowRight');
	await expect(chips.nth(1)).toHaveAttribute('aria-pressed', 'true');
	const category = (await chips.nth(1).textContent()) ?? '';
	const labels = await page.locator('#palette-list [role="option"] em').allTextContents();
	expect(labels.length).toBeGreaterThan(0);
	expect(new Set(labels)).toEqual(new Set([category]));

	await page.keyboard.press('ArrowLeft');
	await expect(chips.first()).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('#palette-list [role="option"]').nth(30)).toBeAttached();
});

test('a typed query is narrowed by the selected category and the caret keeps moving inside the text', async ({ page }) => {
	await page.goto('./');
	await page.keyboard.press('/');
	await page.keyboard.type('json');
	await page.keyboard.press('ArrowLeft');
	await expect(page.locator('#palette-cats button').first()).toHaveAttribute('aria-pressed', 'true');
	await page.keyboard.press('End');
	await page.keyboard.press('ArrowRight');
	const pressed = page.locator('#palette-cats button[aria-pressed="true"]');
	await expect(pressed).not.toHaveText('All');
	const category = (await pressed.textContent()) ?? '';
	const labels = await page.locator('#palette-list [role="option"] em').allTextContents();
	for (const label of labels) expect(label).toBe(category);

	await page.keyboard.press('Escape');
	await page.keyboard.press('Escape');
	await expect(page.locator('#palette')).not.toHaveAttribute('open', '');
	await page.keyboard.press('/');
	await expect(page.locator('#palette-cats button').first()).toHaveAttribute('aria-pressed', 'true');
});
