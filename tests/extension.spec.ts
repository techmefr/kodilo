import { chromium, expect, test } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const EXTENSION_DIR = resolve('dist-extension/chrome');

test('the packaged extension opens tools without console errors', async () => {
	const context = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'kodilo-ext-')), {
		headless: false,
		args: ['--headless=new', `--disable-extensions-except=${EXTENSION_DIR}`, `--load-extension=${EXTENSION_DIR}`],
	});
	try {
		const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
		const origin = `chrome-extension://${worker.url().split('/')[2]}`;
		const page = await context.newPage();
		const errors: string[] = [];
		const SANDBOXED_PREVIEW = /Blocked script execution in 'about:blank'/;
		page.on('console', (message) => message.type() === 'error' && !SANDBOXED_PREVIEW.test(message.text()) && errors.push(message.text()));
		page.on('pageerror', (error) => errors.push(error.message));

		await page.setViewportSize({ width: 400, height: 800 });
		await page.goto(`${origin}/index.html`);
		await expect(page).toHaveTitle(/kodilo/);

		await page.locator('.tool-grid a, a[href*="tools/"]').first().click();
		await expect(page).toHaveURL(/\/tools\/[^/]+\/index\.html$/);

		await page.goto(`${origin}/tools/json-formatter/index.html`);
		await page.locator('textarea').first().fill('{"a":1}');
		await expect(page.getByText('"a": 1')).toBeVisible();
		expect(errors).toEqual([]);
	} finally {
		await context.close();
	}
});
