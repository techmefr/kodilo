import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = ['docker-command-explainer', 'docker-compose-visualizer', 'dockerfile-layer-visualizer', 'docker-container-lifecycle'];

test('command explainer maps a published port', async ({ page }) => {
	await page.goto('tools/docker-command-explainer/');
	await page.locator('#dx-in').fill('docker run -p 8080:80 nginx');
	await expect(page.locator('#dx-svg .k-port')).toHaveCount(1);
	await expect(page.locator('#dx-svg .k-port')).toContainText('port 8080 → 80');
	await expect(page.locator('#dx-list')).toContainText('host port 8080');
	await expect(page.locator('#dx-list')).toContainText('latest');
});

test('command explainer flags risky options', async ({ page }) => {
	await page.goto('tools/docker-command-explainer/');
	await page.getByRole('button', { name: 'risky run' }).click();
	await expect(page.locator('#dx-list')).toContainText('Privileged mode');
	await expect(page.locator('#dx-list')).toContainText('Docker socket');
	await expect(page.locator('#dx-tokens .risky').first()).toBeVisible();
});

test('command explainer explains a build', async ({ page }) => {
	await page.goto('tools/docker-command-explainer/');
	await page.getByRole('button', { name: 'build with args' }).click();
	await expect(page.locator('#dx-svg')).toContainText('ARG NODE_VERSION');
	await expect(page.locator('#dx-list')).toContainText('Stop at the stage named runtime');
});

test('compose visualizer renders one card per service', async ({ page }) => {
	await page.goto('tools/docker-compose-visualizer/');
	await expect(page.locator('#cv-svg .cv-card')).toHaveCount(4);
	await expect(page.locator('#cv-svg .cv-net')).toHaveCount(2);
	await expect(page.locator('#cv-svg .cv-vol')).toHaveCount(1);
	await expect(page.locator('#cv-svg')).toContainText('healthy');
	await page.locator('#cv-in').fill('services:\n  a:\n    image: x\n  b:\n    image: y\n    depends_on: [a]\n');
	await expect(page.locator('#cv-svg .cv-card')).toHaveCount(2);
	await expect(page.locator('#cv-list li')).toHaveCount(3);
});

test('layer visualizer rebuilds npm install when package.json changes', async ({ page }) => {
	await page.goto('tools/dockerfile-layer-visualizer/');
	const npmCi = page.locator('#dl-svg .dl-row', { hasText: 'npm ci' });
	await page.locator('#dl-change').selectOption({ label: 'Nothing changed' });
	await expect(npmCi).toHaveAttribute('data-state', 'cached');
	const option = await page.locator('#dl-change option', { hasText: 'package.json' }).textContent();
	await page.locator('#dl-change').selectOption({ label: option! });
	await expect(npmCi).toHaveAttribute('data-state', 'rebuilt');
	await expect(page.locator('#dl-svg .dl-row', { hasText: 'WORKDIR' }).first()).toHaveAttribute('data-state', 'cached');
	const src = await page.locator('#dl-change option', { hasText: 'Edit .' }).textContent();
	await page.locator('#dl-change').selectOption({ label: src! });
	await expect(npmCi).toHaveAttribute('data-state', 'cached');
	await expect(page.locator('#dl-svg .dl-row', { hasText: 'npm run build' })).toHaveAttribute('data-state', 'rebuilt');
});

test('lifecycle disallows unpause while running', async ({ page }) => {
	await page.goto('tools/docker-container-lifecycle/');
	const btn = (name: string) => page.locator('#lc-buttons button', { hasText: new RegExp(`^${name}$`) });
	await expect(btn('unpause')).toBeDisabled();
	await btn('run').click();
	await expect(page.locator('#lc-state')).toHaveText('running');
	await expect(btn('unpause')).toBeDisabled();
	await expect(btn('pause')).toBeEnabled();
	await btn('pause').click();
	await expect(btn('unpause')).toBeEnabled();
	await btn('unpause').click();
	await btn('stop').click();
	await expect(page.locator('#lc-state')).toHaveText('exited');
	await expect(page.locator('#lc-log')).toContainText('docker stop web');
	await page.locator('[data-k="e:kill"] .lc-tag').click();
	await expect(page.locator('#lc-info')).toContainText('SIGKILL');
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
