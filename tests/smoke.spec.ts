import { expect, test } from '@playwright/test';
import { allTools } from '../src/data/tools';

const IGNORED = [/sandboxed and the 'allow-scripts'/i, /Failed to load resource/i, /net::ERR_/i, /CORS/i];

function luminance(rgb: string) {
	const [r, g, b] = (rgb.match(/\d+(\.\d+)?/g) ?? ['0', '0', '0']).slice(0, 3).map((v) => {
		const s = Number(v) / 255;
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

test('home lists every built tool', async ({ page }) => {
	await page.goto('./');
	const built = allTools.filter((t) => t.built).length;
	await expect(page.locator('.home-cat li > a')).toHaveCount(built);
});

for (const tool of allTools.filter((t) => t.built)) {
	test(`${tool.slug} renders without errors`, async ({ page }, info) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		page.on('console', (m) => {
			if (m.type() === 'error' && !IGNORED.some((re) => re.test(m.text()))) errors.push(m.text());
		});

		await page.goto(`tools/${tool.slug}/`);
		await expect(page.locator('.tool-head h1, main h1').first()).toBeVisible();
		await page.waitForTimeout(400);

		expect(errors, 'console and page errors').toEqual([]);

		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow, 'horizontal page scroll').toBeLessThanOrEqual(1);

		if (info.project.name === 'dark') {
			const [bg, fg] = await page.evaluate(() => {
				const body = getComputedStyle(document.body).backgroundColor;
				const h1 = getComputedStyle(document.querySelector('main h1')!).color;
				return [body, h1];
			});
			expect(luminance(bg), 'dark background').toBeLessThan(0.2);
			const ratio = (Math.max(luminance(bg), luminance(fg)) + 0.05) / (Math.min(luminance(bg), luminance(fg)) + 0.05);
			expect(ratio, 'title contrast in dark mode').toBeGreaterThanOrEqual(4.5);
		}
	});
}
