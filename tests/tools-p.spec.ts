import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = ['har-viewer', 'protobuf-msgpack-decoder', 'cron-to-systemd-timer'];

test('har viewer lists, filters and details the sample capture', async ({ page }) => {
	await page.goto('tools/har-viewer/');
	await expect(page.locator('#hv-count')).toHaveText('11 of 11 requests');
	await expect(page.locator('#hv-fall rect').first()).toBeVisible();
	await page.getByRole('radio', { name: 'XHR' }).click();
	await expect(page.locator('#hv-count')).toHaveText('3 of 11 requests');
	await page.getByRole('radio', { name: 'All' }).click();
	await page.locator('#hv-q').fill('500');
	await expect(page.locator('#hv-body tr')).toHaveCount(1);
	await page.getByRole('button', { name: 'Show details for request 8' }).click();
	await expect(page.locator('#hv-detail')).toContainText('upstream timeout');
	await expect(page.locator('#hv-detail')).toContainText('Authorization');
	await page.locator('#hv-q').fill('');
	await page.getByRole('button', { name: 'Time', exact: true }).click();
	await page.getByRole('button', { name: 'Time', exact: true }).click();
	await expect(page.locator('#hv-body tr').first()).toContainText('recommendations');
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export sanitized' }).click();
	const file = await download;
	const text = await (await file.createReadStream()).toArray().then((c) => Buffer.concat(c).toString());
	expect(text).not.toContain('Authorization');
	expect(text).not.toContain('session=');
	expect(text).toContain('Content-Type');
});

test('protobuf and msgpack decoder decodes, uses a schema and encodes', async ({ page }) => {
	await page.goto('tools/protobuf-msgpack-decoder/');
	await expect(page.locator('#pm-out')).toContainText('"name": "kodilo"');
	await expect(page.locator('#pm-out')).toContainText('"delta": -7');
	await page.getByRole('radio', { name: 'Protobuf' }).click();
	await expect(page.locator('#pm-out')).toContainText('1 [varint] 150');
	await expect(page.locator('#pm-out')).toContainText('string "kodilo"');
	await expect(page.locator('#pm-out')).toContainText('packed varints [1, 2, 300]');
	await expect(page.locator('#pm-out')).toContainText('sint -3');
	await expect(page.locator('#pm-named')).toContainText('"label": "dev"');
	await expect(page.locator('#pm-named')).toContainText('"delta": -3');
	await page.locator('#pm-json').fill('{"a":[1,-1,300]}');
	await expect(page.locator('#pm-hex')).toHaveText('81 a1 61 93 01 ff cd 01 2c');
	await page.getByRole('button', { name: 'Decode' }).click();
	await expect(page.getByRole('radio', { name: 'MessagePack' })).toHaveAttribute('aria-checked', 'true');
	await expect(page.locator('#pm-out')).toContainText('300');
	await page.locator('#pm-in').fill('zz');
	await expect(page.locator('#pm-error')).toBeVisible();
});

test('cron to systemd timer builds units and reverses OnCalendar', async ({ page }) => {
	await page.goto('tools/cron-to-systemd-timer/');
	await expect(page.locator('#st-timer')).toContainText('OnCalendar=Mon..Fri *-*-* 09:30:00');
	await expect(page.locator('#st-timer')).toContainText('Persistent=true');
	await expect(page.locator('#st-service')).toContainText('ExecStart=/usr/local/bin/backup.sh --compress');
	await expect(page.locator('#st-analyze')).toContainText('Next elapse');
	await page.locator('#st-cron').fill('*/15 * * * *');
	await expect(page.locator('#st-timer')).toContainText('OnCalendar=*-*-* *:00/15:00');
	await page.getByRole('button', { name: '1st or Monday' }).click();
	await expect(page.locator('#st-timer')).toContainText('OnCalendar=*-*-01 03:00:00');
	await expect(page.locator('#st-timer')).toContainText('OnCalendar=Mon *-*-* 03:00:00');
	await page.getByRole('button', { name: 'at boot' }).click();
	await expect(page.locator('#st-timer')).toContainText('OnBootSec=1min');
	await page.locator('#st-delay').fill('5min');
	await expect(page.locator('#st-timer')).toContainText('RandomizedDelaySec=5min');
	await expect(page.locator('#st-rev')).toHaveText('30 9 * * 1-5');
	await page.locator('#st-cal').fill('quarterly');
	await expect(page.locator('#st-rev')).toHaveText('0 0 1 1,4,7,10 *');
	await page.locator('#st-cal').fill('*:*:30');
	await expect(page.locator('#st-rev')).toHaveText('Not expressible in cron');
	await expect(page.locator('#st-rev-explain')).toContainText('Seconds');
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
