import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = ['regex-explainer', 'cron-tester', 'glob-tester', 'json-to-zod', 'json-to-go', 'xml-json-converter', 'code-minifier', 'sql-to-typescript'];

test('regex explainer describes each token', async ({ page }) => {
	await page.goto('tools/regex-explainer/');
	await page.locator('#rx-pattern').fill('^(?<year>\\d{4})-\\d+?$');
	const list = page.locator('#rx-list');
	await expect(list).toContainText('start of the string');
	await expect(list).toContainText('capture group named "year"');
	await expect(list).toContainText('exactly 4 times');
	await expect(list).toContainText('one or more times, as few as possible');
	await expect(list).toContainText('any digit');
	await page.locator('#rx-pattern').fill('[a-z');
	await expect(page.locator('#rx-field')).toHaveClass(/invalid/);
	await page.getByRole('button', { name: 'repeated word' }).click();
	await expect(list).toContainText('same text as capture group 1');
	await expect(page.locator('#rx-flag-list')).toContainText('ignore case');
});

test('cron tester describes weekdays and lists ten runs', async ({ page }) => {
	await page.goto('tools/cron-tester/');
	await page.locator('#ct-expr').fill('30 9 * * 1-5');
	await expect(page.locator('#ct-desc')).toHaveText('At 09:30, on Monday through Friday.');
	const runs = page.locator('#ct-runs li');
	await expect(runs).toHaveCount(10);
	for (const text of await runs.allTextContents()) {
		expect(text).toMatch(/^(Mon|Tue|Wed|Thu|Fri),/);
		expect(text).toContain('09:30');
	}
	await page.locator('#ct-expr').fill('*/15 * * * *');
	await expect(page.locator('#ct-desc')).toHaveText('Every 15 minutes.');
	await page.locator('#ct-expr').fill('61 * * * *');
	await expect(page.locator('#ct-field')).toHaveClass(/invalid/);
	await expect(page.locator('#ct-note')).toContainText('out of range');
	await page.getByRole('button', { name: 'leap day' }).click();
	await expect(page.locator('#ct-runs li').first()).toContainText('Feb 29');
});

test('glob tester highlights matches and exclusions', async ({ page }) => {
	await page.goto('tools/glob-tester/');
	await expect(page.locator('#gt-count')).toHaveText('5 of 11 paths match');
	await expect(page.locator('#gt-list li', { hasText: 'src/components/Button.test.ts' })).toHaveClass(/excluded/);
	await expect(page.locator('#gt-list li', { hasText: 'docs/guide/setup.md' })).toHaveClass(/miss/);
	await expect(page.locator('#gt-list li', { hasText: 'src/.hidden/secret.ts' })).toHaveAttribute('data-match', 'false');
	await page.locator('#gt-dot').check();
	await expect(page.locator('#gt-list li', { hasText: 'src/.hidden/secret.ts' })).toHaveAttribute('data-match', 'true');
	await page.locator('#gt-patterns').fill('**/*.md');
	await expect(page.locator('#gt-count')).toHaveText('2 of 11 paths match');
	await page.locator('#gt-only').check();
	await expect(page.locator('#gt-list li')).toHaveCount(2);
});

test('json to zod infers nested and optional fields', async ({ page }) => {
	await page.goto('tools/json-to-zod/');
	const out = page.locator('#jz-out');
	await expect(out).toContainText('export const UserSchema = z.object({');
	await expect(out).toContainText('id: z.number().int(),');
	await expect(out).toContainText('score: z.number(),');
	await expect(out).toContainText('manager: z.null(),');
	await expect(out).toContainText('tags: z.array(z.string()),');
	await expect(out).toContainText('archived: z.boolean().optional(),');
	await expect(out).toContainText('export type User = z.infer<typeof UserSchema>;');
	await page.locator('#jz-in').fill('[{"a": 1, "b": null}, {"a": "x", "b": true}]');
	await page.locator('#jz-name').fill('item');
	await expect(out).toContainText('export const ItemSchema = z.array(');
	await expect(out).toContainText('a: z.union([z.number().int(), z.string()]),');
	await expect(out).toContainText('b: z.boolean().nullable(),');
	await page.locator('#jz-in').fill('{oops');
	await expect(page.locator('#jz-error')).toBeVisible();
});

test('json to go generates structs with tags', async ({ page }) => {
	await page.goto('tools/json-to-go/');
	const out = page.locator('#jg-out');
	await expect(out).toContainText('type User struct {');
	await expect(out).toContainText('type Plan struct {');
	await expect(out).toContainText('type Repo struct {');
	await expect(out).toContainText('`json:"html_url"`');
	await expect(out).toContainText('Repos');
	await expect(out).toContainText('[]Repo');
	await expect(out).toContainText('`json:"license,omitempty"`');
	const text = (await out.textContent()) ?? '';
	expect(text).toMatch(/\tID\s+int64\s+`json:"id"`/);
	expect(text).toMatch(/\tHTMLURL\s+string/);
	expect(text).toMatch(/\tScore\s+float64/);
	await page.locator('#jg-in').fill('{"count": 3}');
	await expect(out).toHaveText(/type User struct \{\n\tCount int64 `json:"count"`\n\}/);
});

test('xml json converter round trips attributes and arrays', async ({ page }) => {
	await page.goto('tools/xml-json-converter/');
	const out = page.locator('#xj-out');
	await expect(out).toContainText('"@id": "bk101"');
	await expect(out).toContainText('"#text": 44.95');
	const json = JSON.parse((await out.textContent()) ?? '{}');
	expect(json.catalog.book).toHaveLength(2);
	expect(json.catalog.book[0].tags.tag).toEqual(['xml', 'reference']);
	await page.getByRole('radio', { name: 'JSON → XML' }).click();
	await expect(page.locator('#xj-out-label')).toHaveText('XML');
	await expect(out).toContainText('<book id="bk101" lang="en">');
	await expect(out).toContainText('<price currency="USD">44.95</price>');
	await expect(out).toContainText('<tag>reference</tag>');
	await page.locator('#xj-in').fill('{"note": {"to": "Tove & Jani"}}');
	await expect(out).toContainText('<to>Tove &amp; Jani</to>');
	await page.getByRole('radio', { name: 'XML → JSON' }).click();
	await page.locator('#xj-in').fill('<a><b></a>');
	await expect(page.locator('#xj-error')).toContainText('Invalid XML');
});

test('code minifier shrinks js css and html', async ({ page }) => {
	await page.goto('tools/code-minifier/');
	const out = page.locator('#cm-out');
	await expect(out).toContainText('export function debounce');
	await expect(out).not.toContainText('Reset the pending');
	await expect(page.locator('#cm-saved')).toHaveText(/^[1-9]\d*(\.\d)?%$/);
	await page.locator('#cm-lang button[data-value=css]').click();
	await expect(out).toHaveText(/^\.card\{display:flex;flex-direction:column;gap:12px;/);
	await expect(out).toContainText('rgba(0,0,0,.12)');
	await expect(out).toContainText('@media (max-width:600px){.card{padding:12px}}');
	await page.locator('#cm-lang button[data-value=html]').click();
	await expect(out).not.toContainText('Page styles');
	await expect(out).toContainText('<head><meta charset="utf-8"/>');
	await expect(out).toContainText('<style>body{margin:0;font-family:system-ui,sans-serif}</style>');
	await expect(out).toContainText('keep   this');
	await page.locator('#cm-in').fill('a   b');
	await expect(page.locator('#cm-before')).toHaveText('5 B');
	await expect(page.locator('#cm-after')).toHaveText('3 B');
	await page.locator('#cm-lang button[data-value=css]').click();
	await expect(page.locator('#cm-in')).toHaveValue(/Card component/);
});

test('sql to typescript builds interfaces and prisma relations', async ({ page }) => {
	await page.goto('tools/sql-to-typescript/');
	const ts = page.locator('#st-ts');
	const prisma = page.locator('#st-prisma');
	await expect(ts).toContainText('export interface User {');
	await expect(ts).toContainText('email: string;');
	await expect(ts).toContainText('display_name: string | null;');
	await expect(ts).toContainText('balance: string | null;');
	await expect(ts).toContainText('created_at: Date;');
	await expect(ts).toContainText('id: bigint;');
	const schema = (await prisma.textContent()) ?? '';
	expect(schema).toMatch(/model User \{\n\s+id\s+Int\s+@id @default\(autoincrement\(\)\)/);
	expect(schema).toMatch(/email\s+String\s+@unique @db\.VarChar\(255\)/);
	expect(schema).toMatch(/is_admin\s+Boolean\s+@default\(false\)/);
	expect(schema).toMatch(/author\s+User\s+@relation\(fields: \[author_id\], references: \[id\]\)/);
	expect(schema).toMatch(/posts\s+Post\[\]/);
	expect(schema).toContain('@@map("users")');
	expect(schema).toMatch(/status\s+String\s+@default\("draft"\)/);
	await page.getByRole('radio', { name: 'camelCase' }).click();
	await expect(ts).toContainText('displayName: string | null;');
	await expect(prisma).toContainText('@map("display_name")');
	await page.locator('#st-type').check();
	await expect(ts).toContainText('export type Post = {');
	await page.locator('#st-in').fill('select 1');
	await expect(page.locator('#st-error')).toHaveText('No CREATE TABLE statement found');
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
