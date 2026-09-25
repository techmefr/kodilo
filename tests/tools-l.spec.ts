import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = ['rbac-matrix-builder', 'permission-tester', 'policy-diff'];

test('matrix builder shows inherited cells and exports', async ({ page }) => {
	await page.goto('tools/rbac-matrix-builder/');
	const cell = page.getByLabel('admin create customers scope');
	await expect(cell.locator('option[value="none"]')).toHaveText('team (via editor)');
	await cell.selectOption('all');
	await expect(page.locator('#rb-out')).toContainText('"create": "all"');
	await page.getByRole('radio', { name: 'Spatie seeder' }).click();
	await expect(page.locator('#rb-out')).toContainText("Role::findOrCreate('admin', 'web')");
	await expect(page.locator('#rb-out')).toContainText('customers.create.all');
	await page.getByRole('radio', { name: 'CASL', exact: true }).click();
	await expect(page.locator('#rb-out')).toContainText("can('read', 'Customer', { teamId: user.teamId });");
	await page.getByRole('radio', { name: 'SQL', exact: true }).click();
	await expect(page.locator('#rb-out')).toContainText('INSERT INTO role_has_permissions');
});

test('matrix builder adds, renames and imports', async ({ page }) => {
	await page.goto('tools/rbac-matrix-builder/');
	await page.getByLabel('New action name').fill('approve');
	await page.getByRole('button', { name: 'Add action' }).click();
	await expect(page.getByLabel('viewer approve invoices scope')).toBeVisible();
	await page.getByLabel('Rename role viewer').fill('reader');
	await page.getByLabel('Rename role viewer').press('Tab');
	await expect(page.getByLabel('reader read customers scope')).toHaveValue('team');
	await page.locator('#rb-json').fill('{"roles":["a"],"resources":["x"],"actions":["go"],"permissions":{"a":{"x":{"go":"own"}}}}');
	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page.getByLabel('a go x scope')).toHaveValue('own');
});

test('permission tester explains the decision', async ({ page }) => {
	await page.goto('tools/permission-tester/');
	await expect(page.locator('#pt-answer')).toHaveText('Denied');
	await page.locator('#pt-target').selectOption('own');
	await expect(page.locator('#pt-answer')).toHaveText('Allowed');
	await page.locator('#pt-role').selectOption('admin');
	await page.locator('#pt-target').selectOption('all');
	await expect(page.locator('#pt-answer')).toHaveText('Allowed');
	await page.locator('#pt-action').selectOption('create');
	await expect(page.locator('#pt-rule')).toContainText('editor: customers.create = team');
	await expect(page.locator('#pt-chain li')).toHaveCount(4);
});

test('policy diff flags risky escalations', async ({ page }) => {
	await page.goto('tools/policy-diff/');
	await expect(page.locator('#pd-stats')).toContainText('Granted');
	await expect(page.locator('#pd-roles li[data-kind="granted"]', { hasText: 'invoices.delete' }).first()).toBeVisible();
	await expect(page.locator('#pd-roles li', { hasText: 'users.update' }).first()).toContainText('Risky escalation');
	await expect(page.locator('#pd-roles li[data-kind="narrowed"]', { hasText: 'customers.read' }).first()).toBeVisible();
	await page.locator('#pd-b').fill(await page.locator('#pd-a').inputValue());
	await expect(page.locator('#pd-roles')).toContainText('exactly the same access');
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
