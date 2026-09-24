import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { allTools } from '../src/data/tools';

const pages = ['./', 'tools/not-a-tool/', ...allTools.filter((t) => t.built).map((t) => `tools/${t.slug}/`)];
const userColors = ['#wc-preview', '.wc-ui', '.contrast-card'];

test.describe.configure({ timeout: 120_000 });

for (const path of pages) {
	test(`${path} has no accessibility violations`, async ({ page }) => {
		await page.goto(path);
		await page.waitForTimeout(300);
		const axe = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).options({ iframes: false }).exclude('iframe');
		userColors.forEach((selector) => axe.exclude(selector));
		const { violations } = await axe.analyze();
		expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
	});
}
