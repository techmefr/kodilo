import { expect, test, type Page } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const secret = 'TOP-SECRET-INPUT-42';

interface Fired {
	name: string;
	data?: Record<string, unknown>;
}

async function stubUmami(page: Page) {
	await page.addInitScript(() => {
		const read = () => JSON.parse(sessionStorage.getItem('fired') ?? '[]');
		Object.assign(window, {
			umami: {
				track: (name: string, data?: unknown) => sessionStorage.setItem('fired', JSON.stringify([...read(), { name, data }])),
			},
		});
	});
}

const fired = (page: Page): Promise<Fired[]> => page.evaluate(() => JSON.parse(sessionStorage.getItem('fired') ?? '[]'));

test('feedback vote persists per tool and reveals prefilled links', async ({ page }) => {
	await page.goto('tools/csv-to-json/');
	const widget = page.locator('[data-feedback]');
	await expect(widget.getByRole('heading', { name: 'Was this tool useful?' })).toBeVisible();
	const up = widget.getByRole('button', { name: 'Yes, useful' });
	const down = widget.getByRole('button', { name: 'No, not useful' });
	await expect(widget.locator('[data-feedback-links]')).toBeHidden();
	await down.click();
	await expect(down).toHaveAttribute('aria-pressed', 'true');
	await expect(up).toHaveAttribute('aria-pressed', 'false');
	await expect(widget.getByRole('status')).toHaveText('Thanks for your feedback');
	const bug = new URL((await widget.getByRole('link', { name: 'Report a bug' }).getAttribute('href'))!);
	expect(bug.searchParams.get('template')).toBe('bug-report.yml');
	expect(bug.searchParams.get('tool-url')).toMatch(/\/kodilo\/tools\/csv-to-json\/$/);
	const improve = new URL((await widget.getByRole('link', { name: 'Suggest an improvement' }).getAttribute('href'))!);
	expect(improve.searchParams.get('template')).toBe('improvement.yml');
	expect(improve.searchParams.get('tool-url')).toMatch(/\/kodilo\/tools\/csv-to-json\/$/);
	await page.reload();
	await expect(down).toHaveAttribute('aria-pressed', 'true');
	await expect(widget.locator('[data-feedback-links]')).toBeVisible();
	await page.goto('tools/javascript-formatter/');
	await expect(page.getByRole('button', { name: 'No, not useful' })).toHaveAttribute('aria-pressed', 'false');
});

test('inbox tester has the widget and the sidebar links to the feedback form', async ({ page }) => {
	await page.goto('tools/inbox-tester/');
	await expect(page.locator('[data-feedback]')).toHaveCount(1);
	const href = await page.locator('.side-feedback').first().getAttribute('href');
	expect(new URL(href!).searchParams.get('template')).toBe('feedback.yml');
});

test('track is a no-op without umami', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('tools/csv-to-json/');
	expect(await page.evaluate(() => 'umami' in window)).toBe(false);
	await expect(page.locator('script[src*="umami"]')).toHaveCount(0);
	await page.getByRole('button', { name: 'Yes, useful' }).click();
	await page.getByRole('button', { name: 'Share link' }).click();
	await expect(page.locator('[data-share-status]')).toContainText('Link copied');
	expect(errors).toEqual([]);
});

test('named events fire without input content', async ({ page }) => {
	await stubUmami(page);
	await page.goto('tools/csv-to-json/');
	await page.locator('#c2j-in').fill(`a,b\n${secret},1`);
	await page.locator('main [data-copy]').first().click();
	await page.getByRole('button', { name: 'Share link' }).click();
	await expect(page.locator('[data-share-status]')).toContainText('Link copied');
	await page.locator('#pin-tool').click();
	await page.getByRole('button', { name: 'No, not useful' }).click();
	await page.locator('main h1').click();
	await page.keyboard.press('/');
	await page.locator('#palette-q').fill('javascript formatter');
	await page.keyboard.press('Enter');
	await page.waitForURL(/javascript-formatter/);
	const events = await fired(page);
	const byName = Object.fromEntries(events.map((e) => [e.name, e.data]));
	expect(byName['tool-copy']).toEqual({ tool: 'csv-to-json' });
	expect(byName['tool-share']).toEqual({ tool: 'csv-to-json' });
	expect(byName['tool-pin']).toEqual({ tool: 'csv-to-json', pinned: true });
	expect(byName['tool-feedback']).toEqual({ tool: 'csv-to-json', value: 'down' });
	expect(byName['shortcut-used']).toEqual({ key: '/' });
	expect(byName['search-select']).toEqual({ tool: 'javascript-formatter', queryLength: 'javascript formatter'.length });
	const serialized = JSON.stringify(events);
	expect(serialized).not.toContain(secret);
	expect(serialized).not.toContain('javascript formatter');
});
