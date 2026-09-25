import { statSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const openSearch = async (page: import('@playwright/test').Page) => {
	await page.keyboard.press('Control+k');
	await expect(page.locator('#palette')).toBeVisible();
};

const firstResults = async (page: import('@playwright/test').Page, query: string) => {
	await page.locator('#palette-q').fill(query);
	await expect(page.locator('#palette-list [role="option"]').first()).toBeVisible();
	return page.locator('#palette-list [role="option"] b').allTextContents();
};

test('pages stay light and the catalogue ships once', () => {
	for (const file of ['dist/index.html', 'dist/404.html', 'dist/tools/base64/index.html']) {
		expect(statSync(file).size, file).toBeLessThan(200 * 1024);
	}
	expect(statSync('dist/tools.json').size).toBeGreaterThan(10 * 1024);
});

test('mega menu loads tools lazily and works with the keyboard', async ({ page }) => {
	await page.goto('./');
	const first = page.locator('.cat-btn').first();
	await first.focus();
	await page.keyboard.press('ArrowDown');
	await expect(page.locator('.cat-btn').nth(1)).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('.cat-btn').nth(1)).toHaveAttribute('aria-expanded', 'true');
	const panel = page.locator('#mega-1');
	await expect(panel.locator('.mega-grid a').first()).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(panel.locator('.mega-grid a').nth(1)).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(panel).toBeHidden();
	await expect(page.locator('.cat-btn').nth(1)).toBeFocused();
});

test('search understands synonyms and ranks names first', async ({ page }) => {
	await page.goto('./');
	await openSearch(page);
	expect((await firstResults(page, 'b64'))[0]).toMatch(/^Base64/);
	expect(await firstResults(page, 'k8s')).toEqual(expect.arrayContaining([expect.stringMatching(/Kubernetes/)]));
	expect((await firstResults(page, 'regexp')).slice(0, 3).join(' ')).toMatch(/Regex/i);
	expect((await firstResults(page, 'jwt'))[0]).toMatch(/^JWT/);
	expect((await firstResults(page, 'json'))[0]).toMatch(/^JSON/);
	await expect(page.locator('#palette-list [role="option"] b mark').first()).toHaveText(/json/i);
	await page.locator('#palette-q').fill('zzzzqqq');
	await expect(page.locator('.palette-empty')).toBeVisible();
});

test('keyboard only: search to a tool, pin it with f, find it again', async ({ page }) => {
	await page.goto('./');
	await page.keyboard.press('/');
	await expect(page.locator('#palette-q')).toBeFocused();
	await page.keyboard.type('base64');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('Enter');
	await expect(page.locator('main h1')).toHaveText('Base64');
	await expect(page.locator('#pin-tool')).toHaveAttribute('aria-pressed', 'false');
	await page.keyboard.press('f');
	await expect(page.locator('#pin-tool')).toHaveAttribute('aria-pressed', 'true');

	await page.reload();
	await expect(page.locator('#pin-tool')).toHaveAttribute('aria-pressed', 'true');
	await page.keyboard.press('g');
	await page.keyboard.press('f');
	await expect(page).toHaveURL(/#favorites$/);
	await expect(page.locator('#favorites')).toBeFocused();
	await expect(page.locator('#favorites-list a')).toHaveText([/Base64/]);
	await expect(page.locator('#recents-list a').first()).toHaveText(/Base64/);

	await openSearch(page);
	await expect(page.locator('#palette-list [role="presentation"]').first()).toHaveText('Pinned');
	await expect(page.locator('#palette-list [role="option"] b').first()).toHaveText(/^Base64/);
});

test('recents keep the last eight tools, newest first', async ({ page }) => {
	const slugs = ['base64', 'jwt-decoder', 'json-formatter', 'uuid-generator', 'hash-text', 'url-encoder', 'json-to-yaml', 'json-diff', 'json-viewer'];
	for (const slug of slugs) await page.goto(`tools/${slug}/`);
	const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('kodilo-recents') ?? '[]'));
	expect(stored).toHaveLength(8);
	expect(stored[0]).toBe('json-viewer');
	expect(stored).not.toContain('base64');
	await page.keyboard.press('g');
	await page.keyboard.press('h');
	await expect(page.locator('#recents-list a')).toHaveCount(8);
});

test('shortcuts dialog opens with ?, traps focus and closes with Esc', async ({ page }) => {
	await page.goto('tools/base64/');
	await page.locator('body').click({ position: { x: 900, y: 700 } });
	await page.keyboard.press('Shift+?');
	const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
	await expect(dialog).toBeVisible();
	await expect(page.locator('#shortcuts-close')).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.locator('#shortcuts-close')).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
});

test('single-key shortcuts are ignored while typing', async ({ page }) => {
	await page.goto('tools/base64/');
	await page.locator('#b64-in').fill('');
	await page.locator('#b64-in').press('f');
	await page.locator('#b64-in').press('Shift+?');
	await expect(page.locator('#b64-in')).toHaveValue('f?');
	await expect(page.locator('#pin-tool')).toHaveAttribute('aria-pressed', 'false');
	await expect(page.locator('#shortcuts')).toBeHidden();
	await page.locator('#b64-in').press('Control+k');
	await expect(page.locator('#palette')).toBeVisible();
});

test('segmented controls follow the radio group pattern', async ({ page }) => {
	await page.goto('tools/base64/');
	const group = page.locator('#b64-mode');
	await expect(group).toHaveAttribute('role', 'radiogroup');
	const encode = group.getByRole('radio', { name: 'Encode' });
	const decode = group.getByRole('radio', { name: 'Decode' });
	await expect(encode).toHaveAttribute('aria-checked', 'true');
	await expect(decode).toHaveAttribute('tabindex', '-1');
	await encode.focus();
	await page.keyboard.press('ArrowRight');
	await expect(decode).toBeFocused();
	await expect(decode).toHaveAttribute('aria-checked', 'true');
	await expect(decode).toHaveAttribute('tabindex', '0');
	await page.keyboard.press('Home');
	await expect(encode).toHaveAttribute('aria-checked', 'true');
	await page.keyboard.press('End');
	await expect(decode).toBeFocused();
});

test('copy shortcut clicks the first copy button', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('tools/base64/');
	await page.locator('#b64-in').fill('hi');
	await page.locator('#b64-in').press('Control+Shift+C');
	await expect(page.locator('#b64-copy')).toHaveText('Copied');
});

test('skip link moves focus to the main content', async ({ page }) => {
	await page.goto('tools/base64/');
	await page.keyboard.press('Tab');
	const skip = page.getByRole('link', { name: 'Skip to content' });
	await expect(skip).toBeFocused();
	await expect(skip).toBeInViewport();
	await page.keyboard.press('Enter');
	await expect(page.locator('#main')).toBeFocused();
});
