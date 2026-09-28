import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = [
	'type-scale-generator',
	'fluid-clamp-generator',
	'font-pairing-preview',
	'color-harmony-generator',
	'oklch-color-picker',
	'design-tokens-generator',
	'glassmorphism-generator',
	'neumorphism-generator',
	'text-shadow-generator',
	'css-filter-generator',
	'border-radius-generator',
	'scrollbar-styler',
	'css-triangle-generator',
	'css-specificity-calculator',
	'css-selector-tester',
	'tailwind-css-converter',
	'svg-path-editor',
];

test('type scale exports css, tailwind and json', async ({ page }) => {
	await page.goto('tools/type-scale-generator/');
	await expect(page.locator('#ts-out')).toContainText('--text-base: 1rem;');
	await expect(page.locator('#ts-out')).toContainText('--text-lg: 1.25rem;');
	await page.locator('#ts-ratio').selectOption('1.5');
	await expect(page.locator('#ts-out')).toContainText('--text-lg: 1.5rem;');
	await page.getByRole('radio', { name: 'Tailwind' }).click();
	await expect(page.locator('#ts-out')).toContainText("'xl': '2.25rem',");
	await page.getByRole('radio', { name: 'JSON' }).click();
	await expect(page.locator('#ts-out')).toContainText('"sm": "0.667rem"');
	await page.locator('#ts-text').fill('Kodilo');
	await expect(page.locator('#ts-list li').first()).toContainText('Kodilo');
});

test('fluid clamp computes clamp values', async ({ page }) => {
	await page.goto('tools/fluid-clamp-generator/');
	await page.locator('#fc-a2').fill('16');
	await page.locator('#fc-b2').fill('24');
	await page.locator('#fc-vmin').fill('320');
	await page.locator('#fc-vmax').fill('1280');
	await expect(page.locator('#fc-out')).toContainText('--body: clamp(1rem, 0.8333rem + 0.8333vw, 1.5rem);');
	await page.locator('#fc-vw').fill('1600');
	await expect(page.locator('#fc-preview')).toContainText('body · 24px');
});

test('font pairing builds a google fonts link only on demand', async ({ page }) => {
	await page.goto('tools/font-pairing-preview/');
	await expect(page.locator('#fp-link')).toContainText('family=Playfair+Display:wght@700&family=Source+Sans+3');
	await expect(page.locator('#fp-font-link')).toHaveCount(0);
	await page.getByRole('button', { name: 'Next pair' }).click();
	await expect(page.locator('#fp-css')).toContainText("font-family: 'Merriweather', serif;");
	await page.getByLabel('Load fonts from Google Fonts').check();
	await expect(page.locator('#fp-font-link')).toHaveAttribute('href', /fonts\.googleapis\.com\/css2\?family=Montserrat/);
});

test('color harmony rotates hues in oklch', async ({ page }) => {
	await page.goto('tools/color-harmony-generator/');
	await expect(page.locator('#ch-swatches > div')).toHaveCount(2);
	await page.getByRole('radio', { name: 'Tetradic' }).click();
	await expect(page.locator('#ch-swatches > div')).toHaveCount(4);
	await page.locator('#ch-hex').fill('#ff0000');
	await expect(page.locator('#ch-out')).toContainText('--harmony-1: #ff0000;');
	await expect(page.locator('#ch-swatches')).toContainText('White 4.00:1 AA large');
});

test('oklch picker converts and checks gamut', async ({ page }) => {
	await page.goto('tools/oklch-color-picker/');
	await page.locator('#ok-hex').fill('#ff0000');
	await expect(page.locator('#ok-out-hex')).toHaveText('#ff0000');
	await expect(page.locator('#ok-out-rgb')).toHaveText('rgb(255 0 0)');
	await expect(page.locator('#ok-out-hsl')).toHaveText('hsl(0 100% 50%)');
	await expect(page.locator('#ok-out-oklch')).toContainText('oklch(62.8% 0.258 29.2)');
	await expect(page.locator('#ok-badges')).toContainText('Inside sRGB');
	await page.locator('#ok-c').fill('0.35');
	await expect(page.locator('#ok-badges')).toContainText('Outside sRGB');
	await expect(page.locator('#ok-css')).toContainText('@media (color-gamut: p3)');
});

test('design tokens export four formats', async ({ page }) => {
	await page.goto('tools/design-tokens-generator/');
	await expect(page.locator('#dt-out')).toContainText('--color-primary-500: #6d4fe0;');
	await expect(page.locator('#dt-out')).toContainText('--space-4: 16px;');
	await page.getByRole('radio', { name: 'JSON (DTCG)' }).click();
	await expect(page.locator('#dt-out')).toContainText('"$type": "dimension"');
	await expect(page.locator('#dt-out')).toContainText('"$type": "shadow"');
	await page.getByRole('radio', { name: 'SCSS' }).click();
	await expect(page.locator('#dt-out')).toContainText('$radius-md: 8px;');
	await page.getByRole('radio', { name: 'Tailwind' }).click();
	await expect(page.locator('#dt-out')).toContainText('fontFamily');
});

test('glass, neumorphism, text shadow, filter and triangle output css', async ({ page }) => {
	await page.goto('tools/glassmorphism-generator/');
	await page.locator('#gl-blur').fill('24');
	await expect(page.locator('#gl-css')).toContainText('backdrop-filter: blur(24px) saturate(180%);');
	await page.goto('tools/neumorphism-generator/');
	await page.getByRole('radio', { name: 'Pressed' }).click();
	await expect(page.locator('#nm-css')).toContainText('inset 18px 18px 36px');
	await page.goto('tools/text-shadow-generator/');
	await page.getByRole('button', { name: 'Neon' }).click();
	await expect(page.getByRole('button', { name: 'Layer 4' })).toBeVisible();
	await expect(page.locator('#tx-css')).toContainText('text-shadow: 0px 0px 4px');
	await page.goto('tools/css-filter-generator/');
	await page.getByRole('button', { name: 'Noir' }).click();
	await expect(page.locator('#cf-css')).toHaveText('filter: contrast(130%) grayscale(100%);');
	await page.getByRole('radio', { name: 'backdrop-filter' }).click();
	await expect(page.locator('#cf-css')).toContainText('backdrop-filter: contrast(130%) grayscale(100%);');
	await page.goto('tools/css-triangle-generator/');
	await page.getByRole('radio', { name: 'down right' }).click();
	await expect(page.locator('#tr-css')).toContainText('border-left: 120px solid transparent;');
	await page.getByRole('radio', { name: 'clip-path' }).click();
	await expect(page.locator('#tr-css')).toContainText('clip-path: polygon(100% 0, 100% 100%, 0 100%);');
});

test('border radius handles and presets', async ({ page }) => {
	await page.goto('tools/border-radius-generator/');
	await expect(page.locator('#br-css')).toHaveText('border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;');
	await page.getByRole('button', { name: 'Card' }).click();
	const frame = await page.locator('#br-frame').boundingBox();
	await page.locator('.br-handle[data-key="tlh"]').hover();
	await page.mouse.down();
	await page.mouse.move(frame!.x + frame!.width * 0.2, frame!.y);
	await page.mouse.up();
	await expect(page.locator('#br-css')).toHaveText('border-radius: 20% 12% 12% 12% / 12% 12% 12% 12%;');
	await page.getByRole('button', { name: 'Circle' }).click();
	await expect(page.locator('#br-css')).toHaveText('border-radius: 50%;');
});

test('scrollbar styler writes standard and webkit css', async ({ page }) => {
	await page.goto('tools/scrollbar-styler/');
	await page.locator('#sb-selector').fill('.panel');
	await expect(page.locator('#sb-css')).toContainText('.panel {\n  scrollbar-width: thin;\n  scrollbar-color: #8b5cf6 #ede9fe;');
	await expect(page.locator('#sb-css')).toContainText('.panel::-webkit-scrollbar-thumb:hover');
	expect(await page.locator('#sb-live').evaluate((el) => el.textContent)).toContain('#sb-preview::-webkit-scrollbar');
});

test('specificity calculator sorts and explains', async ({ page }) => {
	await page.goto('tools/css-specificity-calculator/');
	await page.locator('#sp-in').fill('a\n#x .y\n:is(#a, .b) p\n:where(#z) div\nli:nth-child(2 of .item)');
	const rows = page.locator('#sp-list > li');
	await expect(rows).toHaveCount(5);
	await expect(rows.nth(0)).toContainText('(1, 1, 0)');
	await expect(rows.nth(1)).toContainText('(1, 0, 1)');
	await expect(rows.nth(2)).toContainText('(0, 2, 1)');
	await expect(page.locator('#sp-list')).toContainText(':where() always counts zero');
	await page.getByRole('radio', { name: 'Input order' }).click();
	await expect(rows.nth(0)).toContainText('(0, 0, 1)');
});

test('selector tester highlights matches', async ({ page }) => {
	await page.goto('tools/css-selector-tester/');
	await expect(page.locator('#st-count')).toHaveText('3 matches');
	await expect(page.locator('#st-tree mark')).toHaveCount(3);
	await page.getByRole('button', { name: 'input:is([required], :checked)' }).click();
	await expect(page.locator('#st-count')).toHaveText('2 matches');
	await page.locator('#st-sel').fill('li[');
	await expect(page.locator('#st-count')).toHaveText('Invalid selector');
});

test('tailwind converter goes both ways and reports gaps', async ({ page }) => {
	await page.goto('tools/tailwind-css-converter/');
	const out = page.locator('#tw-out');
	await expect(out).toContainText('padding-inline: 1.5rem;');
	await expect(out).toContainText('width: 37rem;');
	await expect(out).toContainText('.element:hover {');
	await expect(out).toContainText('@media (width >= 48rem) {');
	await expect(page.locator('#tw-unknown')).toHaveText('Not converted: bg-brand-500');
	await page.getByRole('radio', { name: 'CSS → Tailwind' }).click();
	await expect(out).toHaveText('flex flex-col gap-4 p-6 rounded-xl text-lg max-w-md bg-white [mask-type:luminance]');
});

test('svg path editor converts, minifies and drags', async ({ page }) => {
	await page.goto('tools/svg-path-editor/');
	await page.locator('#pe-d').fill('M10 10 L20 10 L20 20 Z');
	await expect(page.locator('#pe-list li')).toHaveCount(4);
	await page.getByRole('radio', { name: 'Relative' }).click();
	await expect(page.locator('#pe-out')).toHaveText('M 10 10 l 10 0 l 0 10 z');
	await page.getByRole('radio', { name: 'Minified' }).click();
	await expect(page.locator('#pe-out')).toHaveText('M10 10l10 0l0 10Z');
	await page.getByRole('radio', { name: 'Absolute' }).click();
	const point = page.locator('#pe-points rect').nth(1);
	const box = await point.boundingBox();
	await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
	await page.mouse.down();
	await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2 + 40);
	await page.mouse.up();
	await expect(page.locator('#pe-d')).not.toHaveValue('M 10 10 L 20 10 L 20 20 Z');
	await page.locator('#pe-d').fill('M 10 10 X');
	await expect(page.locator('#pe-error')).toBeVisible();
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
			const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).exclude('.user-colors').analyze();
			expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
			expect(errors).toEqual([]);
		});
	}
}
