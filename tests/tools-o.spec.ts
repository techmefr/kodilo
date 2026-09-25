import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = ['media-query-tester', 'srcset-generator', 'html-meta-audit'];

test('media query tester matches queries at the chosen width', async ({ page }) => {
	await page.goto('tools/media-query-tester/');
	const row = (text: string) => page.locator('#mq-list li', { hasText: text }).first();
	await expect(row('(min-width: 640px)')).toHaveAttribute('data-match', 'false');
	await expect(row('(hover: none)')).toHaveAttribute('data-match', 'true');
	await page.getByRole('button', { name: 'Desktop' }).click();
	await expect(row('(min-width: 1024px)')).toHaveAttribute('data-match', 'true');
	await expect(row('width >= 1440px')).toHaveAttribute('data-match', 'true');
	await expect(row('(orientation: landscape)')).toHaveAttribute('data-match', 'true');
	await expect(row('(hover: none)')).toHaveAttribute('data-match', 'false');
	await page.getByRole('radio', { name: 'Dark' }).click();
	await expect(row('prefers-color-scheme: dark')).toHaveAttribute('data-match', 'true');
	await page.getByLabel('Reduced motion').check();
	await expect(row('prefers-reduced-motion')).toHaveAttribute('data-match', 'true');
	await page.getByRole('button', { name: 'Set width to 640px' }).click();
	await expect(page.locator('#mq-width-value')).toHaveText('640px');
	await expect(row('(min-width: 640px)')).toHaveAttribute('data-match', 'true');
	await expect(page.locator('#mq-frame')).toHaveAttribute('srcdoc', /@media not all/);
});

test('srcset generator builds markup and explains the pick', async ({ page }) => {
	await page.goto('tools/srcset-generator/');
	await expect(page.locator('#sr-img')).toContainText('/images/hero-480.jpg 480w');
	await expect(page.locator('#sr-picture')).toContainText('<source type="image/avif"');
	await expect(page.locator('#sr-picture')).toContainText('/images/hero-2400.webp 2400w');
	await expect(page.locator('#sr-explain')).toContainText('wants 1170 pixels, so it picks /images/hero-1200.avif');
	await page.locator('#sr-vw').fill('1440');
	await page.getByRole('radio', { name: '2x' }).click();
	await expect(page.locator('#sr-explain')).toContainText('slot is 720px ((min-width: 1024px) 50vw)');
	await expect(page.locator('#sr-explain')).toContainText('picks /images/hero-1600.avif');
	await page.getByLabel('AVIF').uncheck();
	await expect(page.locator('#sr-picture')).not.toContainText('avif');
});

test('srcset generator resizes an uploaded image', async ({ page }) => {
	await page.goto('tools/srcset-generator/');
	await page.locator('#sr-widths').fill('200, 400');
	const png = await page.evaluate(() => {
		const c = document.createElement('canvas');
		c.width = 800;
		c.height = 400;
		c.getContext('2d')!.fillRect(0, 0, 800, 400);
		return c.toDataURL('image/png').split(',')[1];
	});
	await page.locator('#sr-file').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
	await expect(page.locator('#sr-downloads a', { hasText: 'hero-400.jpg' })).toHaveAttribute('download', 'hero-400.jpg');
	await expect(page.locator('#sr-downloads')).toContainText('400 × 200');
});

test('html meta audit scores the sample and reacts to edits', async ({ page }) => {
	await page.goto('tools/html-meta-audit/');
	const item = (label: string) => page.locator('#ma-groups li', { hasText: label }).first();
	await expect(item('og:image')).toHaveAttribute('data-status', 'fail');
	await expect(item('Image alt text')).toContainText('/funnel.png');
	await expect(item('Heading levels')).toContainText('h1 to h3');
	await expect(item('JSON-LD block 1')).toContainText('Organization');
	await expect(page.locator('#ma-card-title')).toHaveText('Acme Analytics');
	await expect(page.locator('#ma-outline li')).toHaveCount(3);
	const score = Number(await page.locator('#ma-score').textContent());
	expect(score).toBeGreaterThan(50);
	await page.locator('#ma-html').fill('<html><body><p>Hi</p></body></html>');
	await expect(item('Title')).toHaveAttribute('data-status', 'fail');
	await expect(item('Language')).toHaveAttribute('data-status', 'fail');
	await expect(page.locator('#ma-score')).not.toHaveText(String(score));
});

for (const slug of slugs) {
	for (const scheme of ['light', 'dark'] as const) {
		test(`${slug} passes axe in ${scheme} mode without page overflow`, async ({ page }) => {
			const errors: string[] = [];
			page.on('pageerror', (e) => errors.push(e.message));
			page.on('console', (m) => m.type() === 'error' && !/sandboxed and the 'allow-scripts'/.test(m.text()) && errors.push(m.text()));
			await page.emulateMedia({ colorScheme: scheme });
			await page.setViewportSize({ width: 375, height: 800 });
			await page.goto(`tools/${slug}/`);
			await page.waitForTimeout(300);
			const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
			expect(overflow).toBeLessThanOrEqual(0);
			const { violations } = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
			expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
			expect(errors).toEqual([]);
		});
	}
}
