import { expect, test, type Page } from '@playwright/test';
import { builtCategories, categoryDescription, categorySlug } from '../src/data/tools';

const jsonLd = async (page: Page) => {
	const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
	return blocks.map((b) => JSON.parse(b));
};

test('categories index links every category', async ({ page }) => {
	await page.goto('categories/');
	await expect(page.locator('main .tool-grid li > a')).toHaveCount(builtCategories.length);
	const types = (await jsonLd(page)).map((d) => d['@type']);
	expect(types).toEqual(['BreadcrumbList', 'ItemList']);
});

test('category slugs and descriptions are unique', () => {
	const slugs = builtCategories.map((c) => categorySlug(c.name));
	const descriptions = builtCategories.map((c) => categoryDescription(c));
	expect(new Set(slugs).size).toBe(builtCategories.length);
	expect(new Set(descriptions).size).toBe(builtCategories.length);
});

for (const category of builtCategories) {
	const slug = categorySlug(category.name);

	test(`category ${slug} lists its tools with valid structured data`, async ({ page }) => {
		const response = await page.goto(`categories/${slug}/`);
		expect(response?.status()).toBe(200);
		await expect(page.locator('main h1')).toContainText(category.name);
		await expect(page.locator('main .tool-grid li > a')).toHaveCount(category.tools.length);

		expect(await page.title()).toBe(`${category.name} tools — free, in your browser — kodilo`);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', categoryDescription(category));

		const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
		expect(canonical).toBe(`https://techmefr.github.io/kodilo/categories/${slug}/`);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical ?? '');

		const [breadcrumbs, list] = await jsonLd(page);
		expect(breadcrumbs['@type']).toBe('BreadcrumbList');
		expect(breadcrumbs.itemListElement.at(-1).item).toBe(canonical);
		expect(list['@type']).toBe('ItemList');
		expect(list.numberOfItems).toBe(category.tools.length);
		expect(list.itemListElement.map((i: { url: string }) => i.url)).toEqual(category.tools.map((t) => `https://techmefr.github.io/kodilo/tools/${t.slug}/`));
	});
}

test('tool pages link back to their category and describe the app', async ({ page }) => {
	const category = builtCategories.find((c) => c.tools.some((t) => t.slug === 'base64'))!;
	await page.goto('tools/base64/');
	await expect(page.locator('nav[aria-label="Breadcrumb"] a', { hasText: category.name })).toHaveAttribute(
		'href',
		`/kodilo/categories/${categorySlug(category.name)}/`,
	);
	const types = (await jsonLd(page)).map((d) => d['@type']);
	expect(types).toEqual(['BreadcrumbList', 'WebApplication']);
	const report = page.getByRole('link', { name: 'Report a problem with this tool' });
	const href = new URL((await report.getAttribute('href')) ?? '');
	expect(href.searchParams.get('template')).toBe('bug-report.yml');
	expect(href.searchParams.get('tool-url')).toBe('https://techmefr.github.io/kodilo/tools/base64/');
});

test('sitemap lists category pages', async ({ request }) => {
	const response = await request.get('sitemap-0.xml');
	const xml = await response.text();
	for (const category of builtCategories) expect(xml).toContain(`/kodilo/categories/${categorySlug(category.name)}/`);
});
