import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('all tools can be saved for offline use and removed again', async ({ page, context }) => {
	test.setTimeout(120_000);
	await page.goto('./');
	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.reload();
	const button = page.locator('#offline-all');
	await expect(button).toBeVisible();
	await expect(button).toHaveAttribute('data-state', 'idle');
	await button.click();
	await expect(button).toHaveAttribute('data-state', 'saved', { timeout: 100_000 });
	await context.setOffline(true);
	await page.goto('tools/json-diff/');
	await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
	await page.goto('tools/jwt-decoder/');
	await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
	await context.setOffline(false);
	await button.click();
	await expect(button).toHaveAttribute('data-state', 'idle');
});
