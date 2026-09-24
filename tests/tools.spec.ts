import { expect, test } from '@playwright/test';

test('base64 encodes and decodes', async ({ page }) => {
	await page.goto('tools/base64/');
	await page.locator('#b64-in').fill('hello kodilo');
	await expect(page.locator('#b64-out')).toHaveText('aGVsbG8ga29kaWxv');
});

test('hash gives the known sha-256 of abc', async ({ page }) => {
	await page.goto('tools/hash-text/');
	await page.locator('#hash-in').fill('abc');
	await expect(page.locator('#hash-list')).toContainText('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('json formatter reports invalid json', async ({ page }) => {
	await page.goto('tools/json-formatter/');
	await page.locator('#json-in').fill('{"a": 1,}');
	await expect(page.locator('#json-error')).toBeVisible();
});

test('uuid generator returns version 4 uuids', async ({ page }) => {
	await page.goto('tools/uuid-generator/');
	const text = (await page.locator('#uuid-out').textContent()) ?? '';
	expect(text.trim().split('\n')[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('bcrypt hash verifies against its password', async ({ page }) => {
	await page.goto('tools/bcrypt/');
	await expect(page.locator('#bc-out')).toHaveText(/^\$2[aby]\$10\$/, { timeout: 15000 });
	const hash = (await page.locator('#bc-out').textContent()) ?? '';
	await page.locator('#bc-verify').fill(hash);
	await expect(page.locator('#bc-verify-note')).toContainText('matches');
});

test('totp matches the RFC 6238 test vector', async ({ page }) => {
	await page.clock.setFixedTime(59_000);
	await page.goto('tools/totp-generator/');
	await page.locator('#to-digits button[data-value="8"]').click();
	await page.locator('#to-secret').fill('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
	await expect(page.locator('#to-code')).toHaveText('9428 7082');
});

test('jwt generator signs a token that verifies', async ({ page }) => {
	await page.goto('tools/jwt-generator/');
	await expect(page.locator('#jg-token')).toHaveText(/^ey[\w-]+\.ey[\w-]+\.[\w-]+$/);
	const token = (await page.locator('#jg-token').textContent()) ?? '';
	await page.locator('#jg-verify').fill(token);
	await expect(page.locator('#jg-verify-note')).toContainText('Valid signature');
	await page.locator('#jg-verify').fill(token.slice(0, -2) + 'xx');
	await expect(page.locator('#jg-verify-note')).toContainText('✕');
});

test('wcag checker flags #777 on white as failing AA', async ({ page }) => {
	await page.goto('tools/wcag-contrast-checker/');
	await page.locator('#wc-fg').fill('#777777');
	await page.locator('#wc-bg').fill('#ffffff');
	await expect(page.locator('#wc-ratio')).toHaveText('4.47:1');
	await expect(page.locator('#wc-aa')).toHaveText('Fail');
	await expect(page.locator('#wc-aa-large')).toHaveText('Pass');
});

test('json to typescript marks missing keys optional', async ({ page }) => {
	await page.goto('tools/json-to-typescript/');
	await page.locator('#jt-in').fill('[{"a":1,"b":"x"},{"a":2}]');
	await expect(page.locator('#jt-out')).toContainText('b?: string;');
});

test('search palette opens a tool', async ({ page }) => {
	await page.goto('./');
	await page.keyboard.press('Control+k');
	await page.locator('#palette-q').fill('jwt dec');
	await page.keyboard.press('Enter');
	await expect(page.locator('main h1')).toHaveText('JWT Decoder');
});

test('mac lookup finds the vendor and country', async ({ page }) => {
	await page.goto('tools/mac-address-lookup/');
	await page.locator('#ml-in').fill('3C:22:FB:12:34:56');
	await expect(page.locator('#ml-list li b').first()).toHaveText('Apple, Inc.');
	await expect(page.locator('#ml-list li span').first()).toContainText('United States');
});

test('avif option only shows when the browser can encode it', async ({ page }) => {
	await page.goto('tools/webp-avif-converter/');
	const canEncode = await page.evaluate(() => {
		const c = document.createElement('canvas');
		return c.toDataURL('image/avif').startsWith('data:image/avif');
	});
	await expect(page.locator('#wa-format [data-value="image/avif"]')).toBeVisible({ visible: canEncode });
});
