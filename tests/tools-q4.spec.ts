import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const rdap = {
	ldhName: 'EXAMPLE.COM',
	status: ['client delete prohibited', 'client transfer prohibited'],
	entities: [{ roles: ['registrar'], vcardArray: ['vcard', [['fn', {}, 'text', 'Example Registrar Inc']]] }],
	events: [
		{ eventAction: 'registration', eventDate: '1995-08-14T04:00:00Z' },
		{ eventAction: 'expiration', eventDate: '2099-08-13T04:00:00Z' },
		{ eventAction: 'last changed', eventDate: '2026-08-14T08:01:43Z' },
	],
	secureDNS: { delegationSigned: true },
	nameservers: [{ ldhName: 'ELLIOTT.NS.CLOUDFLARE.COM' }, { ldhName: 'HERA.NS.CLOUDFLARE.COM' }],
};

const answer = (name: string, type: number, data: string) => ({ name, type, TTL: 300, data });

const dnsFor = (name: string, type: string) => {
	const t = { A: 1, AAAA: 28, CNAME: 5, MX: 15, NS: 2, TXT: 16, SOA: 6, CAA: 257 }[type] ?? 0;
	if (name === 'example.com' && type === 'A') return [answer(name, 1, '93.184.216.34')];
	if (name === 'example.com' && type === 'MX') return [answer(name, 15, '10 mail.example.com.')];
	if (name === 'example.com' && type === 'TXT') return [answer(name, t, '"v=spf1 include:_spf.example.com ~all"')];
	if (name === '_dmarc.example.com' && type === 'TXT') return [answer(name, t, '"v=DMARC1; p=none; rua=mailto:r@example.com"')];
	if (name === 'google._domainkey.example.com' && type === 'TXT') return [answer(name, t, '"v=DKIM1; k=rsa; p=MIGf"')];
	return [];
};

async function track(page: Page, pattern: RegExp) {
	const seen: string[] = [];
	page.on('request', (r) => {
		if (pattern.test(r.url())) seen.push(r.url());
	});
	return seen;
}

test('whois lookup shows the notice, waits for the button and parses rdap', async ({ page }) => {
	const seen = await track(page, /rdap\.org/);
	await page.route('https://rdap.org/domain/*', (route) => route.fulfill({ json: rdap, headers: { 'access-control-allow-origin': '*' } }));
	await page.goto('tools/domain-whois-lookup/');
	await expect(page.locator('.net-note')).toContainText('sends the domain you enter to rdap.org');
	await expect(page.locator('.net-note a')).toHaveAttribute('href', /rdap/);
	await page.waitForTimeout(500);
	expect(seen).toHaveLength(0);
	await page.getByRole('button', { name: 'Look up domain' }).click();
	await expect(page.locator('#dw-result')).toContainText('Example Registrar Inc');
	await expect(page.locator('#dw-result')).toContainText('1995-08-14');
	await expect(page.locator('#dw-result')).toContainText('2099-08-13');
	await expect(page.locator('#dw-result')).toContainText('client delete prohibited');
	await expect(page.locator('#dw-result')).toContainText('elliott.ns.cloudflare.com');
	await expect(page.locator('#dw-result')).toContainText('Signed');
	await expect(page.locator('#dw-result .stat b').first()).toHaveText(/^\d+ years, \d+ months, \d+ days$/);
	await page.getByRole('button', { name: 'Show raw JSON' }).click();
	await expect(page.locator('.net-raw')).toContainText('"ldhName": "EXAMPLE.COM"');
	expect(seen).toEqual(['https://rdap.org/domain/example.com']);
});

test('whois lookup converts idn to punycode and explains a 404', async ({ page }) => {
	await page.route('https://rdap.org/domain/*', (route) => route.fulfill({ status: 404, body: '' }));
	await page.goto('tools/domain-whois-lookup/');
	await page.locator('#dw-domain').fill('https://Bücher.example/path');
	await page.getByRole('button', { name: 'Look up domain' }).click();
	await expect(page.locator('#dw-domain')).toHaveValue('xn--bcher-kva.example');
	await expect(page.locator('#dw-msg')).toContainText('No RDAP record found');
});

test('whois lookup explains rate limits and bad input', async ({ page }) => {
	await page.route('https://rdap.org/domain/*', (route) => route.fulfill({ status: 429, body: '' }));
	await page.goto('tools/domain-whois-lookup/');
	await page.getByRole('button', { name: 'Look up domain' }).click();
	await expect(page.locator('#dw-msg')).toContainText('rate limiting');
	await page.locator('#dw-domain').fill('not a domain');
	await page.getByRole('button', { name: 'Look up domain' }).click();
	await expect(page.locator('#dw-msg')).toContainText('valid domain');
});

test('dns checker reads records and grades the email setup', async ({ page }) => {
	const seen = await track(page, /cloudflare-dns\.com/);
	await page.route('https://cloudflare-dns.com/dns-query**', (route) => {
		const url = new URL(route.request().url());
		expect(route.request().headers()['accept']).toBe('application/dns-json');
		const Answer = dnsFor(url.searchParams.get('name') ?? '', url.searchParams.get('type') ?? '');
		return route.fulfill({ json: { Status: 0, Answer }, headers: { 'access-control-allow-origin': '*' } });
	});
	await page.goto('tools/dns-records-checker/');
	await expect(page.locator('.net-note')).toContainText('sends the domain you enter to Cloudflare');
	await page.locator('#dr-domain').fill('example.com');
	await page.waitForTimeout(500);
	expect(seen).toHaveLength(0);
	await page.getByRole('button', { name: 'Check records' }).click();
	const health = page.locator('#dr-result .net-list');
	await expect(health).toContainText('1 mail server published');
	await expect(health).toContainText('Policy is p=none');
	await expect(health).toContainText('Key found for selector google');
	await expect(health).toContainText('1 DNS lookups counted');
	await expect(health.locator('li').filter({ hasText: 'DMARC' }).locator('.net-badge')).toHaveText('Warning');
	await expect(page.locator('#dr-result .net-table')).toContainText('93.184.216.34');
	await expect(page.locator('#dr-result .net-table')).toContainText('v=spf1 include:_spf.example.com ~all');
	await expect(page.locator('#dr-result .net-table')).toContainText('No record');
});

test('dns checker reports a missing domain and failing mail setup', async ({ page }) => {
	await page.route('https://cloudflare-dns.com/dns-query**', (route) => route.fulfill({ json: { Status: 3 } }));
	await page.goto('tools/dns-records-checker/');
	await page.getByRole('button', { name: 'Check records' }).click();
	await expect(page.locator('#dr-msg')).toContainText('NXDOMAIN');
	await page.unroute('https://cloudflare-dns.com/dns-query**');
	await page.route('https://cloudflare-dns.com/dns-query**', (route) => route.fulfill({ json: { Status: 0 } }));
	await page.getByRole('button', { name: 'Check records' }).click();
	const health = page.locator('#dr-result .net-list');
	await expect(health).toContainText('No SPF record found');
	await expect(health).toContainText('No DMARC record');
	await expect(health).toContainText('No MX record');
});

const ranks = Array.from({ length: 30 }, (_, i) => ({ date: `2026-11-${String(30 - i).padStart(2, '0')}`, rank: 180 + (i % 5) }));

test('rank checker shows rank, history and waits for the button', async ({ page }) => {
	const seen = await track(page, /tranco-list\.eu/);
	await page.route('https://tranco-list.eu/api/ranks/domain/*', (route) => route.fulfill({ json: { ranks }, headers: { 'access-control-allow-origin': '*' } }));
	await page.goto('tools/domain-rank-checker/');
	await expect(page.locator('.net-note')).toContainText('sends the domain you enter to Tranco');
	await expect(page.locator('.rk-explain')).toContainText('not the paid Ahrefs Domain Rating');
	await page.waitForTimeout(500);
	expect(seen).toHaveLength(0);
	await page.getByRole('button', { name: 'Check rank' }).click();
	await expect(page.locator('#rk-result .stat b').first()).toHaveText('#180');
	await expect(page.locator('#rk-result')).toContainText('#184');
	await expect(page.locator('#rk-result svg.rk-spark')).toBeVisible();
	await expect(page.locator('#rk-result tbody tr')).toHaveCount(14);
	expect(seen).toEqual(['https://tranco-list.eu/api/ranks/domain/github.com']);
});

test('rank checker says when the domain is not in the top million', async ({ page }) => {
	await page.route('https://tranco-list.eu/api/ranks/domain/*', (route) => route.fulfill({ json: { ranks: [], domain: 'tiny.example' } }));
	await page.goto('tools/domain-rank-checker/');
	await page.getByRole('button', { name: 'Check rank' }).click();
	await expect(page.locator('#rk-result')).toContainText('not in the Tranco top 1 million');
});

for (const slug of ['domain-whois-lookup', 'dns-records-checker', 'domain-rank-checker']) {
	for (const scheme of ['light', 'dark'] as const) {
		test(`${slug} has no axe violations in ${scheme} mode`, async ({ page }) => {
			await page.emulateMedia({ colorScheme: scheme });
			await page.route('https://rdap.org/**', (route) => route.fulfill({ json: rdap }));
			await page.route('https://tranco-list.eu/**', (route) => route.fulfill({ json: { ranks } }));
			await page.route('https://cloudflare-dns.com/**', (route) => {
				const url = new URL(route.request().url());
				return route.fulfill({ json: { Status: 0, Answer: dnsFor(url.searchParams.get('name') ?? '', url.searchParams.get('type') ?? '') } });
			});
			await page.goto(`tools/${slug}/`);
			await page.locator('form button[type="submit"]').click();
			await expect(page.locator('.net-msg')).toContainText(/RDAP record|Results for|Tranco result/);
			const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
			expect(report.violations).toEqual([]);
		});
	}
}
