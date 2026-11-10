import { expect, test } from '@playwright/test';

test('json diff: resizing one editor keeps both editors the same height', async ({ page }) => {
	await page.goto('tools/json-diff/');
	const grip = async (id: string) => {
		const box = (await page.locator(`#${id}`).boundingBox())!;
		return { x: box.x + box.width - 6, y: box.y + box.height - 6 };
	};
	const heights = async () => [(await page.locator('#jd-a').boundingBox())!.height, (await page.locator('#jd-b').boundingBox())!.height];

	for (const id of ['jd-b', 'jd-a', 'jd-b']) {
		const before = await heights();
		const from = await grip(id);
		await page.mouse.move(from.x, from.y);
		await page.mouse.down();
		await page.mouse.move(from.x, from.y + 60, { steps: 6 });
		await page.mouse.up();
		const after = await heights();
		expect(after[0]).toBeGreaterThan(before[0] + 40);
		expect(after[1]).toBeGreaterThan(before[1] + 40);
		expect(Math.abs(after[0] - after[1])).toBeLessThanOrEqual(1);
	}
});
