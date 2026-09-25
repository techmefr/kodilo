import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = ['sql-explain-explainer', 'sql-er-diagram', 'openapi-viewer', 'json-to-openapi-schema', 'webhook-signature-verifier'];

test('explain explainer flags the slow parts of each format', async ({ page }) => {
	await page.goto('tools/sql-explain-explainer/');
	const findings = page.locator('#se-findings');
	await expect(findings).toContainText('Sort spilled to disk (9.641 MB)');
	await expect(findings).toContainText('Sequential scan reads 500,000 rows of orders');
	await expect(findings).toContainText('Row estimate off by 980×');
	await expect(findings).toContainText('Nested loop over 9,800 rows');
	await expect(page.locator('#se-stats')).toContainText('513 ms');
	await expect(page.locator('#se-tree .se-node')).toHaveCount(7);
	await page.getByRole('button', { name: 'Postgres JSON' }).click();
	await expect(findings).toContainText('Nested loop over 402,113 rows');
	await expect(findings).toContainText('Sequential scan reads 402,113 rows of order_items');
	await page.getByRole('button', { name: 'MySQL table' }).click();
	await expect(findings).toContainText('Full table scan of o (248,130 rows examined)');
	await expect(findings).toContainText('Using filesort');
	await page.getByRole('button', { name: 'MySQL JSON' }).click();
	await expect(findings).toContainText('Join on order_items has no index');
	await page.locator('#se-in').fill('Index Scan using users_pkey on users  (cost=0.29..8.30 rows=1 width=64)');
	await expect(findings).toContainText('No obvious problems');
});

test('er diagram draws tables, cardinality and exports', async ({ page }) => {
	await page.goto('tools/sql-er-diagram/');
	await expect(page.locator('#er-svg .er-table')).toHaveCount(5);
	await expect(page.locator('#er-svg .er-edge')).toHaveCount(4);
	await expect(page.locator('#er-rels')).toContainText('customer_profiles.customer_id → customers.id');
	await expect(page.locator('#er-rels')).toContainText('one-to-one, required');
	await expect(page.locator('#er-rels')).toContainText('orders.customer_id → customers.id');
	const mm = page.locator('#er-mm');
	await expect(mm).toContainText('customers ||--o| customer_profiles : "customer_id"');
	await expect(mm).toContainText('orders ||--o{ order_items : "order_id"');
	await expect(mm).toContainText('bigint order_id PK, FK');
	await page
		.locator('#er-in')
		.fill(
			'CREATE TABLE a (id INT PRIMARY KEY);\nCREATE TABLE b (id INT PRIMARY KEY, a_id INT);\nALTER TABLE b ADD CONSTRAINT fk FOREIGN KEY (a_id) REFERENCES a(id);',
		);
	await expect(mm).toContainText('a |o--o{ b : "a_id"');
});

test('openapi viewer validates and lists endpoints', async ({ page }) => {
	await page.goto('tools/openapi-viewer/');
	await expect(page.locator('#oa-stats')).toContainText('Valid');
	await expect(page.locator('#oa-stats')).toContainText('OpenAPI 3.0.3');
	await expect(page.locator('.oa-op')).toHaveCount(3);
	await page.locator('.oa-op summary', { hasText: '/books/{bookId}' }).click();
	await expect(page.locator('.oa-op[open]')).toContainText('bookId');
	await expect(page.locator('.oa-op[open] .oa-schema').first()).toContainText('author?: string  nullable');
	await page.locator('#oa-filter').fill('orders');
	await expect(page.locator('.oa-op')).toHaveCount(1);
	const spec = await page.locator('#oa-in').inputValue();
	await page
		.locator('#oa-in')
		.fill(spec.replace('- name: bookId', '- name: id').replace("$ref: '#/components/schemas/Order'", "$ref: '#/components/schemas/Missing'"));
	await expect(page.locator('#oa-issues')).toContainText('Path template {bookId} has no matching path parameter');
	await expect(page.locator('#oa-issues')).toContainText('Unresolved reference #/components/schemas/Missing');
	await expect(page.locator('#oa-stats')).toContainText('errors');
});

test('json to openapi schema detects formats and required', async ({ page }) => {
	await page.goto('tools/json-to-openapi-schema/');
	const out = page.locator('#jo-out');
	await expect(out).toContainText('components:');
	await expect(out).toContainText('format: uuid');
	await expect(out).toContainText('format: email');
	await expect(out).toContainText('format: date-time');
	await expect(out).toContainText('$ref: "#/components/schemas/Address"');
	await expect(out).toContainText('- "null"');
	await page.getByRole('button', { name: 'JSON Schema' }).click();
	await page.getByRole('button', { name: 'JSON', exact: true }).click();
	const json = JSON.parse((await out.textContent()) ?? '');
	expect(json.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
	expect(json.required).not.toContain('birthday');
	expect(json.required).toContain('email');
	expect(json.properties.website.type).toEqual(['string', 'null']);
	expect(json.$defs.Order.properties.placedAt.format).toBe('date-time');
});

test('webhook verifier validates and detects tampering', async ({ page }) => {
	await page.goto('tools/webhook-signature-verifier/');
	const verdict = page.locator('#wh-verdict');
	await expect(verdict).toHaveText('Valid signature');
	await page.locator('#wh-body').fill('{"action":"closed"}');
	await expect(verdict).toHaveText('Signature mismatch');
	await page.getByRole('button', { name: 'Use expected' }).click();
	await expect(verdict).toHaveText('Valid signature');
	for (const name of ['Stripe', 'Slack', 'Shopify', 'Generic HMAC']) {
		await page.getByRole('button', { name, exact: true }).click();
		await expect(verdict).toHaveText('Valid signature');
	}
	await page.getByRole('button', { name: 'Stripe', exact: true }).click();
	await expect(page.locator('#wh-expected')).toContainText('v1=');
	await page.locator('#wh-header').fill('t=1600000000,v1=00');
	await expect(verdict).toHaveText('Signature mismatch');
	await page.getByRole('button', { name: 'Use expected' }).click();
	await expect(verdict).toHaveText('Signature matches, but the timestamp is too old');
	await page.getByRole('button', { name: 'GitHub', exact: true }).click();
	await page.locator('#wh-secret').fill('gh_webhook_s3cret');
	await page.locator('#wh-header').fill('sha256=682c1a6a6c7a5f3c3ed0c5e7c7e2c9f1f1e57dcbd4b4d4ba6fbb6f1b2a3f0f2e');
	await expect(verdict).toHaveText('Signature mismatch');
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
