import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

test('utm builder keeps the query and hash, encodes and normalises case', async ({ page }) => {
	await page.goto('tools/utm-builder/');
	const out = page.locator('#utm-out');
	await expect(out).toHaveText(
		'https://example.com/pricing?ref=nav&utm_source=newsletter&utm_medium=email&utm_campaign=spring%20sale%202026&utm_content=hero%20button#plans',
	);
	await expect(page.locator('#utm-count')).toHaveText('4 UTM parameters added');
	await page.getByLabel('Lowercase values').uncheck();
	await expect(out).toContainText('utm_source=Newsletter&');
	await page.locator('#utm-base').fill('example.com/a?utm_source=old&x=1 2');
	await page.locator('#utm-term').fill('a&b');
	await expect(out).toHaveText(
		'https://example.com/a?x=1%202&utm_source=Newsletter&utm_medium=email&utm_campaign=Spring%20Sale%202026&utm_term=a%26b&utm_content=hero%20button',
	);
	await page.locator('#utm-base').fill('http://');
	await expect(page.locator('#utm-error')).toContainText('not a valid URL');
});

test('url query tool parses repeated keys, edits rows and rebuilds', async ({ page }) => {
	await page.goto('tools/url-query-tool/');
	const out = page.locator('#uq-out');
	await expect(page.locator('.uq-row')).toHaveCount(6);
	await expect(out).toHaveText('https://shop.example.com/search?q=red%20shoes&size=42&size=43&tag[]=sale&tag[]=new&note=50%25%20off#results');
	await expect(page.locator('#uq-json')).toContainText('"size": [');
	await expect(page.locator('#uq-json')).toContainText('"tag": [');
	await page.getByLabel('Remove row 1').click();
	await expect(page.locator('.uq-row')).toHaveCount(5);
	await page.getByLabel('Value 1').fill('a b&c');
	await expect(out).toContainText('?size=a%20b%26c&size=43');
	await page.getByLabel('Encode spaces as +').check();
	await expect(out).toContainText('size=a+b%26c');
	await page.getByRole('button', { name: 'Add row' }).click();
	await page.getByLabel('Key 6').fill('new');
	await page.getByLabel('Value 6').fill('é');
	await expect(out).toContainText('&new=%C3%A9#results');
	await page.locator('#uq-in').fill('a=1&b=2&a=3');
	await expect(out).toHaveText('?a=1&b=2&a=3');
});

test('auth header parser decodes bearer, basic and digest', async ({ page }) => {
	await page.goto('tools/auth-header-parser/');
	await expect(page.locator('#ah-chips')).toContainText('Valid, not expired');
	await expect(page.locator('#ah-rows')).toContainText('2100-01-01T00:00:00.000Z');
	await expect(page.locator('#ah-json')).toContainText('"name": "Kodilo User"');
	const expired = `${b64({ alg: 'HS256' })}.${b64({ exp: 1000000000 })}.sig`;
	await page.locator('#ah-in').fill(`Bearer ${expired}`);
	await expect(page.locator('#ah-chips')).toContainText('Expired');
	await expect(page.locator('#ah-rows')).toContainText('2001-09-09T01:46:40.000Z');
	await page.getByRole('button', { name: 'Basic example' }).click();
	await expect(page.locator('#ah-rows dd').nth(0)).toHaveText('user');
	await expect(page.locator('#ah-rows dd').nth(1)).toHaveText('password');
	await page.getByLabel('Hide password').check();
	await expect(page.locator('#ah-rows dd').nth(1)).toHaveText('••••••••');
	await page.getByRole('button', { name: 'Digest example' }).click();
	await expect(page.locator('#ah-rows dd').nth(1)).toHaveText('testrealm@host.com');
	await expect(page.locator('#ah-chips')).toContainText('All required fields present');
	await page.locator('#ah-in').fill('Digest username="x", realm="r"');
	await expect(page.locator('#ah-chips')).toContainText('Missing: nonce, uri, response');
	await page.locator('#ah-in').fill('Basic !!!');
	await expect(page.locator('#ah-error')).toBeVisible();
});

test('date difference counts calendar parts and survives a DST change', async ({ page }) => {
	await page.goto('tools/date-difference/');
	await page.locator('#dd-zone').selectOption('America/New_York');
	await expect(page.locator('#dd-summary')).toHaveText('6 years, 9 months, 10 days, 9 hours, 30 minutes, 0 seconds');
	await page.locator('#dd-start').fill('2026-03-07T12:00');
	await page.locator('#dd-end').fill('2026-03-09T12:00');
	await expect(page.locator('#dd-summary')).toHaveText('0 years, 0 months, 2 days, 0 hours, 0 minutes, 0 seconds');
	await expect(page.locator('[data-key="days"] b')).toHaveText('2');
	await expect(page.locator('[data-key="hours"] b')).toHaveText('47');
	await expect(page.locator('[data-key="business"] b')).toHaveText('0');
	await page.locator('#dd-end').fill('2026-03-14T12:00');
	await expect(page.locator('[data-key="business"] b')).toHaveText('5');
	await expect(page.locator('[data-key="weeks"] b')).toHaveText('1 w 0 d');
	await page.getByRole('radio', { name: 'Add or subtract' }).click();
	await expect(page.locator('#dd-summary')).toHaveText('Sun 2026-03-08 12:00:00 EDT');
	await page.locator('#dd-i-days').fill('0');
	await page.locator('#dd-i-hours').fill('24');
	await expect(page.locator('#dd-summary')).toHaveText('Sun 2026-03-08 13:00:00 EDT');
	await page.getByRole('radio', { name: 'Subtract', exact: true }).click();
	await expect(page.locator('#dd-summary')).toHaveText('Fri 2026-03-06 12:00:00 EST');
	await page.locator('#dd-start').fill('2026-01-31T10:00');
	await page.locator('#dd-i-hours').fill('0');
	await page.locator('#dd-i-months').fill('1');
	await page.getByRole('radio', { name: 'Add', exact: true }).click();
	await expect(page.locator('#dd-summary')).toHaveText('Sat 2026-02-28 10:00:00 EST');
});

test('hash compare normalises, locates the first difference and verifies a text', async ({ page }) => {
	await page.goto('tools/hash-compare/');
	await expect(page.locator('#hc-verdict')).toContainText('Different. 1 character differs. First difference at position 64.');
	await expect(page.locator('#hc-verdict')).toContainText('SHA-256');
	await expect(page.locator('#hc-show-b mark.hc-first')).toHaveText('5');
	await expect(page.locator('#hc-digest')).toHaveText('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
	await expect(page.locator('#hc-check')).toHaveText('The SHA-256 matches Hash A.');
	await page.locator('#hc-b').fill(' 2CF24DBA 5FB0A30E26E83B2AC5B9E29E\n1B161E5C1FA7425E73043362938B9824 ');
	await expect(page.locator('#hc-verdict')).toContainText('Match. The hashes are identical.');
	await page.getByLabel('Ignore case').uncheck();
	await expect(page.locator('#hc-verdict')).toContainText('Different.');
	await page.locator('#hc-b').fill('d41d8cd98f00b204e9800998ecf8427e');
	await expect(page.locator('#hc-verdict')).toContainText('lengths differ (64 vs 32)');
	await expect(page.locator('#hc-verdict')).toContainText('MD5');
	await page.locator('#hc-text').fill('hellp');
	await expect(page.locator('#hc-check')).toHaveText('The SHA-256 does not match Hash A.');
	await page.locator('#hc-text').fill('');
	await expect(page.locator('#hc-digest')).toHaveText('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('regex generator tests library patterns and builds one', async ({ page }) => {
	await page.goto('tools/regex-generator/');
	await expect(page.locator('#rg-count')).toHaveText('2 matches');
	await expect(page.locator('#rg-code')).toHaveText('/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$/gm');
	await page.getByRole('radio', { name: 'Python' }).click();
	await expect(page.locator('#rg-code')).toHaveText('re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", re.MULTILINE)');
	await page.getByRole('radio', { name: 'PHP' }).click();
	await expect(page.locator('#rg-code')).toHaveText("'/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$/m'");
	await page.locator('#rg-pattern').selectOption('uuid');
	await expect(page.locator('#rg-count')).toHaveText('2 matches');
	await page.locator('#rg-pattern').selectOption('ipv4');
	await expect(page.locator('#rg-count')).toHaveText('2 matches');
	await page.locator('#rg-pattern').selectOption('semver');
	await expect(page.locator('#rg-count')).toHaveText('3 matches');
	await page.locator('#rg-pattern').selectOption('ipv6');
	await expect(page.locator('#rg-count')).toHaveText('3 matches');
	await page.getByRole('radio', { name: 'Builder' }).click();
	await expect(page.locator('#rg-source')).toHaveValue('^INV-\\d{4,6}');
	await expect(page.locator('#rg-count')).toHaveText('2 matches');
	await page.getByLabel('Part 2 minimum').fill('2');
	await expect(page.locator('#rg-source')).toHaveValue('^INV-\\d{2,6}');
	await expect(page.locator('#rg-count')).toHaveText('3 matches');
	await page.locator('#rg-source').fill('(');
	await expect(page.locator('#rg-error')).toBeVisible();
});

const slugs = ['utm-builder', 'url-query-tool', 'auth-header-parser', 'date-difference', 'hash-compare', 'regex-generator'];

for (const slug of slugs) {
	for (const scheme of ['light', 'dark'] as const) {
		test(`${slug} has no console error, no horizontal scroll and passes axe in ${scheme}`, async ({ page }) => {
			const errors: string[] = [];
			page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
			page.on('pageerror', (e) => errors.push(e.message));
			await page.setViewportSize({ width: 375, height: 800 });
			await page.emulateMedia({ colorScheme: scheme });
			await page.goto(`tools/${slug}/`);
			await page.waitForTimeout(300);
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
			const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
			expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
			expect(errors).toEqual([]);
		});
	}
}
