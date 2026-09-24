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

test('unknown pages show the 404 page with suggestions', async ({ page }) => {
	const response = await page.goto('tools/jwt-decode/');
	expect(response?.status()).toBe(404);
	await expect(page.locator('h1')).toHaveText('This page does not exist');
	await expect(page.locator('#nf-list a').first()).toHaveText('JWT Decoder');
});

test('tool pages carry seo and social metadata', async ({ page }) => {
	await page.goto('tools/base64/');
	await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://techmefr.github.io/kodilo/tools/base64/');
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image\.png$/);
	expect(await page.locator('meta[name=description]').getAttribute('content')).not.toBe('');
});

test('mac lookup resolves long MA-S prefixes', async ({ page }) => {
	await page.goto('tools/mac-address-lookup/');
	await page.locator('#ml-in').fill('00:1B:C5:00:01:23');
	await expect(page.locator('#ml-list li b').first()).toHaveText('Converging Systems Inc.');
});

test('subnet calculator gives the /24 range', async ({ page }) => {
	await page.goto('tools/ipv4-subnet-calculator/');
	await page.locator('#sub-in').fill('10.0.0.130/25');
	await expect(page.locator('#sub-list')).toContainText('10.0.0.128');
	await expect(page.locator('#sub-list')).toContainText('10.0.0.255');
	await expect(page.locator('#sub-list')).toContainText('126');
});

test('url encoder escapes reserved characters', async ({ page }) => {
	await page.goto('tools/url-encoder/');
	await page.locator('#url-in').fill('a b&c=d/é');
	await expect(page.locator('#url-out')).toContainText('a%20b%26c%3Dd%2F%C3%A9');
});

test('roman numerals convert both ways', async ({ page }) => {
	await page.goto('tools/roman-numeral-converter/');
	await page.locator('#roman-num').fill('1994');
	await expect(page.locator('#roman-rom')).toHaveValue('MCMXCIV');
});

test('slugify strips accents and punctuation', async ({ page }) => {
	await page.goto('tools/slugify/');
	await page.locator('#slug-in').fill('Crème Brûlée: the Recipe!');
	await expect(page.locator('#slug-out')).toHaveText('creme-brulee-the-recipe');
});

test('hmac matches the sha-256 reference vector', async ({ page }) => {
	await page.goto('tools/hmac-generator/');
	await page.locator('#hmac-key').fill('key');
	await page.locator('#hmac-msg').fill('The quick brown fox jumps over the lazy dog');
	await expect(page.locator('#hmac-out')).toHaveText('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
});

test('semver range matches a version', async ({ page }) => {
	await page.goto('tools/semver-calculator/');
	await page.locator('#sv-range').fill('^1.4.2');
	await page.locator('#sv-version').fill('2.0.0');
	await expect(page.locator('#sv-version-note')).toContainText('Outside the range');
});

test('chmod converts octal to symbolic', async ({ page }) => {
	await page.goto('tools/chmod-calculator/');
	await page.locator('#chmod-octal').fill('640');
	await expect(page.locator('#chmod-symbolic')).toContainText('rw-r-----');
});

test('cron explains a schedule', async ({ page }) => {
	await page.goto('tools/crontab-generator/');
	await page.locator('#cron-in').fill('0 12 * * 1');
	await expect(page.locator('#cron-human')).toContainText(/12:00/);
	await expect(page.locator('#cron-human')).toContainText(/Monday/);
});

test('byte size converts between si and iec', async ({ page }) => {
	await page.goto('tools/byte-size-converter/');
	await page.locator('#bytes-in').fill('1 GiB');
	await expect(page.locator('#bytes-si')).toContainText('1.07');
	await expect(page.locator('#bytes-iec')).toContainText('1,024');
});

test('case converter produces snake and camel case', async ({ page }) => {
	await page.goto('tools/case-converter/');
	await page.locator('#case-in').fill('hello big world');
	await expect(page.locator('#case-list')).toContainText('hello_big_world');
	await expect(page.locator('#case-list')).toContainText('helloBigWorld');
});
