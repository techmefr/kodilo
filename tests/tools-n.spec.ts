import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = ['access-log-analyzer', 'password-strength-checker', 'saml-decoder', 'oauth-helper', 'ssh-key-generator'];

test('access log analyzer summarizes, filters and supports custom formats', async ({ page }) => {
	await page.goto('tools/access-log-analyzer/');
	await expect(page.locator('#al-format')).toHaveText('Combined format');
	await expect(page.locator('#al-stats .stat').first()).toContainText('72');
	await expect(page.locator('#al-chart svg rect').first()).toBeVisible();
	await expect(page.locator('#al-status')).toContainText('404');
	await expect(page.locator('#al-errors tr').first()).toBeVisible();
	await expect(page.locator('#al-bots')).toContainText('Googlebot');
	await page.locator('#al-q').fill('wp-login');
	await expect(page.locator('#al-stats .stat').first()).toContainText('requests matching');
	await expect(page.locator('#al-errors')).toContainText('/wp-login.php');
	await page.locator('#al-q').fill('');
	await page.locator('#al-in').fill('10.0.0.1|2026-09-24T10:00:00Z|GET /health HTTP/1.1|503\n10.0.0.2|2026-09-24T10:01:00Z|GET / HTTP/1.1|200');
	await expect(page.locator('#al-error')).toBeVisible();
	await page.getByRole('button', { name: 'Custom format' }).click();
	await page.locator('#al-custom').fill('$remote_addr|$time_iso8601|$request|$status');
	await expect(page.locator('#al-error')).toBeHidden();
	await expect(page.locator('#al-stats .stat').first()).toContainText('2');
	await expect(page.locator('#al-errors')).toContainText('/health');
});

test('password strength checker scores and explains', async ({ page }) => {
	await page.goto('tools/password-strength-checker/');
	await expect(page.locator('#pw-verdict')).toHaveText(/weak/i);
	await expect(page.locator('#pw-patterns')).toContainText('2024');
	await expect(page.locator('#pw-patterns')).toContainText('most used passwords');
	await page.locator('#pw-in').fill('password');
	await expect(page.locator('#pw-verdict')).toHaveText('Very weak');
	await expect(page.locator('#pw-feedback')).toContainText('breach');
	await page.locator('#pw-in').fill('correct-Horse7-staple-Battery-zq');
	await expect(page.locator('#pw-verdict')).toHaveText(/strong/i);
	await page.getByRole('button', { name: 'Hide' }).click();
	await expect(page.locator('#pw-in')).toHaveAttribute('type', 'password');
});

test('saml decoder reads a response and a deflated request', async ({ page }) => {
	await page.goto('tools/saml-decoder/');
	await expect(page.locator('#sm-summary')).toContainText('https://idp.example.org/metadata');
	await expect(page.locator('#sm-summary')).toContainText('ada.lovelace@example.com');
	await expect(page.locator('#sm-summary')).toContainText('Present on Assertion');
	await expect(page.locator('#sm-attrs')).toContainText('engineering, admins');
	await expect(page.locator('#sm-warn')).toContainText('Expired');
	await expect(page.locator('#sm-xml')).toContainText('<saml:Audience>https://app.example.com/saml/metadata</saml:Audience>');
	const encoded = await page.evaluate(async () => {
		const xml =
			'<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_abc" Version="2.0" IssueInstant="2026-09-24T09:00:00Z" AssertionConsumerServiceURL="https://sp.example.com/acs"><saml:Issuer>https://sp.example.com</saml:Issuer></samlp:AuthnRequest>';
		const stream = new Blob([xml]).stream().pipeThrough(new CompressionStream('deflate-raw'));
		const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
		return encodeURIComponent(btoa(String.fromCharCode(...bytes)));
	});
	await page.locator('#sm-in').fill(`https://idp.example.org/sso?SAMLRequest=${encoded}&RelayState=x`);
	await expect(page.locator('#sm-steps')).toHaveText('SAMLRequest parameter → URL-decoded → base64 → inflated → XML');
	await expect(page.locator('#sm-summary')).toContainText('AuthnRequest');
	await expect(page.locator('#sm-summary')).toContainText('https://sp.example.com/acs');
	await page.locator('#sm-in').fill('<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"><samlp:Status/></samlp:Response>');
	await expect(page.locator('#sm-warn')).toContainText('No signature');
	await page.locator('#sm-in').fill('not saml at all!');
	await expect(page.locator('#sm-error')).toBeVisible();
});

test('oauth helper builds a PKCE url and decodes callbacks', async ({ page }) => {
	await page.goto('tools/oauth-helper/');
	const verifier = await page.locator('#oa-verifier').inputValue();
	expect(verifier).toMatch(/^[\w-]{43}$/);
	const expected = await page.evaluate(async (v) => {
		const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)));
		return btoa(String.fromCharCode(...d))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
	}, verifier);
	await expect(page.locator('#oa-challenge')).toHaveValue(expected);
	const url = new URL((await page.locator('#oa-url').textContent()) ?? '');
	expect(url.searchParams.get('code_challenge')).toBe(expected);
	expect(url.searchParams.get('code_challenge_method')).toBe('S256');
	expect(url.searchParams.get('scope')).toBe('openid profile email');
	await expect(page.locator('#oa-curl')).toContainText(`code_verifier=${verifier}`);
	await expect(page.locator('#oa-checks')).toContainText('state matches the request.');
	await page.locator('#oa-state').fill('changed');
	await expect(page.locator('#oa-checks')).toContainText('state does not match');
	await page.getByRole('button', { name: 'Token response' }).click();
	await expect(page.locator('#oa-jwts')).toContainText('"email": "ada@example.com"');
	await expect(page.locator('#oa-checks')).toContainText('nonce does not match');
	await page.locator('#oa-pkce').uncheck();
	await expect(page.locator('#oa-url')).not.toContainText('code_challenge');
});

test('ssh key generator creates keys that parse like ssh-keygen output', async ({ page }) => {
	for (const type of ['Ed25519', 'RSA 2048']) {
		await page.goto('tools/ssh-key-generator/');
		if (type !== 'Ed25519') await page.getByRole('button', { name: type }).click();
		await expect(page.locator('#sg-status')).toContainText('ready', { timeout: 20000 });
		const pub = (await page.locator('#sg-pub').textContent()) ?? '';
		expect(pub).toMatch(type === 'Ed25519' ? /^ssh-ed25519 AAAAC3NzaC1lZDI1NTE5\S+ ada@laptop$/ : /^ssh-rsa AAAAB3NzaC1yc2E\S+ ada@laptop$/);
		await expect(page.locator('#sg-priv')).toContainText('-----BEGIN OPENSSH PRIVATE KEY-----');
		const priv = (await page.locator('#sg-priv').textContent()) ?? '';
		const body = Buffer.from(priv.replace(/-----[^-]+-----|\s/g, ''), 'base64');
		expect(body.subarray(0, 15).toString('latin1')).toBe('openssh-key-v1\0');
		expect(body.includes(Buffer.from(pub.split(' ')[1], 'base64'))).toBe(true);
		const fp = (await page.locator('#sg-fp').textContent()) ?? '';
		await page.goto('tools/ssh-key-fingerprint/');
		await page.locator('#sk-in').fill(pub);
		await expect(page.locator('#sk-list')).toContainText(fp);
		await expect(page.locator('#sk-list')).toContainText(type === 'Ed25519' ? 'ED25519 256' : 'RSA 2048');
		await expect(page.locator('#sk-list')).toContainText('ada@laptop');
	}
});

for (const slug of slugs) {
	for (const scheme of ['light', 'dark'] as const) {
		test(`${slug} passes axe in ${scheme} mode without page overflow`, async ({ page }) => {
			const errors: string[] = [];
			page.on('pageerror', (e) => errors.push(e.message));
			page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
			await page.emulateMedia({ colorScheme: scheme });
			await page.setViewportSize({ width: 375, height: 800 });
			await page.goto(`tools/${slug}/`);
			await page.waitForTimeout(300);
			const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
			expect(overflow).toBeLessThanOrEqual(0);
			const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
			expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
			expect(errors).toEqual([]);
		});
	}
}
