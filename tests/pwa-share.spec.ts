import { expect, test, type Page } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

async function share(page: Page) {
	await page.getByRole('button', { name: 'Share link' }).click();
	await expect(page.locator('[data-share-status]')).toContainText('Link copied');
	const url = page.url();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
	expect(new URL(url).hash).toMatch(/^#s=[\w-]+$/);
	return url;
}

async function decode(page: Page, url: string) {
	return page.evaluate(async (code) => {
		const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
		const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
		const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
		return JSON.parse(await new Response(stream).text()) as Record<string, unknown>;
	}, new URL(url).hash.slice(3));
}

test('manifest is linked and valid', async ({ page, request }) => {
	await page.goto('./');
	const href = await page.locator('link[rel="manifest"]').getAttribute('href');
	expect(href).toBe('/kodilo/manifest.webmanifest');
	const manifest = await (await request.get(href!)).json();
	expect(manifest.name).toBe('Kodilo');
	expect(manifest.start_url).toBe('/kodilo/');
	expect(manifest.scope).toBe('/kodilo/');
	expect(manifest.display).toBe('standalone');
	expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
	const sizes = manifest.icons.map((icon: { sizes: string; purpose: string }) => `${icon.sizes}:${icon.purpose}`);
	expect(sizes).toEqual(expect.arrayContaining(['192x192:any', '512x512:any', '512x512:maskable']));
	for (const icon of manifest.icons) {
		const response = await request.get(new URL(icon.src, `http://localhost${href}`).pathname);
		expect(response.headers()['content-type']).toContain('image/png');
	}
});

test('service worker registers and serves a tool page offline', async ({ page, context }) => {
	await page.goto('./');
	await page.evaluate(() => navigator.serviceWorker.ready);
	await expect(page.locator('.pwa-toast')).toContainText('Available offline');
	await page.goto('tools/json-formatter/');
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	await page.reload();
	await expect(page.locator('main h1')).toHaveText('JSON Formatter');
	await context.setOffline(true);
	await page.reload();
	await expect(page.locator('main h1')).toHaveText('JSON Formatter');
	await page.goto('./');
	await expect(page.locator('body')).toContainText('kodilo');
	await context.setOffline(false);
});

test('regex tester state round-trips through the link', async ({ page, browser }) => {
	await page.goto('tools/regex-tester/');
	await page.locator('#re-pattern').fill('item-(\\d+)');
	await page.locator('#re-text').fill('item-1 item-22 item-333');
	await expect(page.locator('#re-count')).toHaveText('3 matches');
	const url = await share(page);
	const other = await browser.newPage();
	await other.goto(url);
	await expect(other.locator('#re-pattern')).toHaveValue('item-(\\d+)');
	await expect(other.locator('#re-count')).toHaveText('3 matches');
	await other.close();
});

test('json formatter restores text, segmented choice and checkbox', async ({ page, browser }) => {
	await page.goto('tools/json-formatter/');
	await page.locator('#json-in').fill('{"b":1,"a":2}');
	await page.locator('#json-indent button[data-value="4"]').click();
	await page.locator('#json-sort').check();
	const expected = await page.locator('#json-out').textContent();
	expect(expected).toContain('    "a": 2');
	const url = await share(page);
	const other = await browser.newPage();
	await other.goto(url);
	await expect(other.locator('#json-in')).toHaveValue('{"b":1,"a":2}');
	await expect(other.locator('#json-indent [data-value="4"]:is([aria-pressed="true"], [aria-checked="true"])')).toHaveCount(1);
	await expect(other.locator('#json-sort')).toBeChecked();
	await expect(other.locator('#json-out')).toHaveText(expected!);
	await other.close();
});

test('cron tester restores the expression and recomputes', async ({ page, browser }) => {
	await page.goto('tools/cron-tester/');
	await page.locator('#ct-expr').fill('15 3 * * 1');
	const description = page.locator('#ct-desc');
	await expect(description).not.toBeEmpty();
	const expected = await description.textContent();
	const url = await share(page);
	const other = await browser.newPage();
	await other.goto(url);
	await expect(other.locator('#ct-expr')).toHaveValue('15 3 * * 1');
	await expect(other.locator('#ct-desc')).toHaveText(expected!);
	await other.close();
});

test('fields marked data-no-share stay out of the link', async ({ page, browser }) => {
	await page.goto('tools/hmac-generator/');
	await page.locator('#hmac-key').fill('top-secret-value');
	await page.locator('#hmac-msg').fill('hello');
	const url = await share(page);
	const state = await decode(page, url);
	expect(state).toEqual({ 'hmac-msg': 'hello' });
	const other = await browser.newPage();
	await other.goto(url);
	await expect(other.locator('#hmac-msg')).toHaveValue('hello');
	await expect(other.locator('#hmac-key')).not.toHaveValue('top-secret-value');
	await other.close();
});

test('password fields are never shared', async ({ page }) => {
	await page.goto('tools/text-encryption/');
	await page.locator('#te-pass').fill('hunter2-hunter2');
	await page.locator('#te-in').fill('secret plaintext');
	await page.getByRole('button', { name: 'Share link' }).click();
	await expect(page.locator('[data-share-status]')).toContainText('Link copied');
	const hash = new URL(page.url()).hash;
	if (hash) expect(JSON.stringify(await decode(page, page.url()))).not.toContain('hunter2');
});
