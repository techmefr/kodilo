import { expect, test } from '@playwright/test';

test('log graph explainer renders the sample history', async ({ page }) => {
	await page.goto('tools/git-log-graph-explainer/');
	await expect(page.locator('#lg-svg .lg-commit')).toHaveCount(8);
	await expect(page.locator('#lg-svg .lg-node.merge')).toHaveCount(1);
	await expect(page.locator('#lg-list')).toContainText('You are on main');
	await expect(page.locator('#lg-list')).toContainText('feature/checkout');
	await expect(page.locator('#lg-list')).toContainText('already merged');
	await page.locator('#lg-in').fill('* abc1234 (HEAD) Detached work\n* def5678 First');
	await expect(page.locator('#lg-svg .lg-commit')).toHaveCount(2);
	await expect(page.locator('#lg-list')).toContainText('detached');
});

test('rebase visualizer switches operations', async ({ page }) => {
	await page.goto('tools/git-rebase-visualizer/');
	await expect(page.locator('#rv-after [data-id="M"]')).toHaveCount(1);
	await page.getByRole('button', { name: 'Rebase', exact: true }).click();
	await expect(page.locator('#rv-after .rv-node.new')).toHaveCount(2);
	await expect(page.locator('#rv-cmd')).toHaveText('git switch feature\ngit rebase main');
	await page.locator('#rv-ff').check();
	await expect(page.locator('#rv-cmd')).toContainText('--ff-only');
	await page.getByRole('button', { name: 'Cherry-pick' }).click();
	await expect(page.locator('#rv-cmd')).toContainText('git cherry-pick');
	await expect(page.locator('#rv-ff-wrap')).toBeHidden();
});

test('gitattributes generator reacts to options', async ({ page }) => {
	await page.goto('tools/gitattributes-generator/');
	const out = page.locator('#ga-out');
	await expect(out).toContainText('* text=auto');
	await expect(out).toContainText('filter=lfs diff=lfs merge=lfs -text');
	await expect(out).toContainText('*.sln');
	await page.locator('#ga-lfs').uncheck();
	await expect(out).toContainText('*.png             binary');
	await page.getByRole('button', { name: 'Force LF' }).click();
	await expect(out).toContainText('text=auto eol=lf');
	await page.getByLabel('PHP').check();
	await expect(out).toContainText('diff=php');
});

test('clip-path editor moves a point with the keyboard', async ({ page }) => {
	await page.goto('tools/clip-path-editor/');
	const css = page.locator('#cp-css');
	await expect(css).toHaveText('clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);');
	await page.getByRole('slider', { name: 'Point 1' }).press('ArrowDown');
	await expect(css).toContainText('polygon(25% 1%');
	await page.getByRole('button', { name: 'Circle' }).click();
	await expect(css).toHaveText('clip-path: circle(40% at 50% 50%);');
	await page.getByRole('button', { name: 'Inset' }).click();
	await expect(css).toContainText('inset(15% 10% 15% 10% round 8px)');
});

test('keyframes generator builds css from presets', async ({ page }) => {
	await page.goto('tools/css-keyframes-generator/');
	const css = page.locator('#kf-css');
	await expect(css).toContainText('@keyframes bounce');
	await expect(css).toContainText('transform: translate(0px, -40px) scale(1.05);');
	await expect(css).toContainText('prefers-reduced-motion: reduce');
	await page.getByRole('button', { name: 'Spin' }).click();
	await expect(css).toContainText('animation: spin 1500ms linear infinite normal both;');
	await page.locator('#kf-iter').fill('2');
	await expect(css).toContainText('linear 2 normal');
	await page.locator('#kf-add').click();
	await expect(page.locator('#kf-rows tr')).toHaveCount(3);
});

test('color blindness simulator renders filtered frames', async ({ page }) => {
	await page.goto('tools/color-blindness-simulator/');
	await expect(page.locator('#cb-html')).toHaveValue(/Deploy status/);
	await page.getByRole('tab', { name: 'Deuteranopia' }).click();
	const frame = page.locator('#cb-frames iframe');
	await expect(frame).toHaveCount(1);
	await expect(frame).toHaveAttribute('srcdoc', /feColorMatrix/);
	await expect(page.locator('#cb-info')).toContainText('green cones');
	await page.getByRole('tab', { name: 'All' }).click();
	await expect(frame).toHaveCount(9);
	await page.getByRole('tab', { name: 'HTML' }).click();
	await page.locator('#cb-html').fill('<p>Hello red</p>');
	await page.getByRole('tab', { name: 'Normal' }).click();
	await expect(frame).toHaveAttribute('srcdoc', '<p>Hello red</p>');
});

test('svg shape generator is deterministic per seed', async ({ page }) => {
	await page.goto('tools/svg-shape-generator/');
	const svg = page.locator('#sg-svg');
	await expect(page.locator('#sg-stage path')).toHaveCount(3);
	const first = await svg.textContent();
	await page.locator('#sg-seed').fill('1');
	await expect(svg).not.toHaveText(first!);
	await page.locator('#sg-seed').fill('4217');
	await expect(svg).toHaveText(first!);
	await page.getByRole('button', { name: 'Blob' }).click();
	await expect(page.locator('#sg-stage path')).toHaveCount(1);
	await expect(svg).toContainText('viewBox="0 0 400 400"');
	await expect(page.locator('#sg-css')).toContainText('data:image/svg+xml');
});
