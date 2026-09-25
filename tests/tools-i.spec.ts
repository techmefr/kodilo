import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const slugs = ['php-formatter', 'python-formatter', 'yaml-formatter', 'csv-cleaner', 'sql-csv-converter', 'ascii-table-generator', 'ascii-art-generator'];

test('php formatter formats a class with PER braces', async ({ page }) => {
	await page.goto('tools/php-formatter/');
	await page.locator('#phf-in').fill('<?php class A{public function b($x){if($x){return "y";}return 1;}}');
	await expect(page.locator('#phf-out')).toContainText("return 'y';");
	const text = await page.locator('#phf-out').textContent();
	expect(text).toContain('class A\n{\n    public function b($x)\n    {');
	await page.getByRole('button', { name: 'Same line' }).click();
	await expect(page.locator('#phf-out')).toContainText('class A {');
	await page.locator('#phf-in').fill('<?php function (');
	await expect(page.locator('#phf-error')).toBeVisible();
});

test('python formatter normalizes indentation, spacing and quotes', async ({ page }) => {
	await page.goto('tools/python-formatter/');
	await page.locator('#pyf-in').fill("def f(a,b = 1)->int:\n  x=a+b   #sum\n  return f'{x}'\nprint('it\\'s')");
	const out = page.locator('#pyf-out');
	await expect(out).toContainText('def f(a, b=1) -> int:');
	const text = (await out.textContent()) ?? '';
	expect(text).toContain('\n    x = a+b  # sum\n');
	expect(text).toContain('    return f"{x}"\n');
	expect(text).toContain("\n\n\nprint('it\\'s')");
	await page.getByRole('button', { name: 'Single quotes' }).click();
	await expect(out).toContainText("return f'{x}'");
});

test('python formatter keeps docstrings verbatim', async ({ page }) => {
	await page.goto('tools/python-formatter/');
	await page.locator('#pyf-in').fill('def g():\n  """a=1 , b\n  keep"""\n  return 1');
	await expect(page.locator('#pyf-out')).toContainText('    """a=1 , b\n    keep"""\n    return 1');
});

test('yaml formatter reindents, normalizes quotes and sorts keys', async ({ page }) => {
	await page.goto('tools/yaml-formatter/');
	await expect(page.locator('#ymf-docs')).toHaveText('2');
	await page.locator('#ymf-in').fill("b:   'x'\na: {c: 1, d: [1, 2]}\n");
	await expect(page.locator('#ymf-out')).toHaveText('b: "x"\na:\n  c: 1\n  d:\n    - 1\n    - 2\n');
	await page.locator('#ymf-sort').check();
	await expect(page.locator('#ymf-out')).toHaveText('a:\n  c: 1\n  d:\n    - 1\n    - 2\nb: "x"\n');
	await page.locator('#ymf-in').fill('a: [1, 2');
	await expect(page.locator('#ymf-error')).toBeVisible();
});

test('csv cleaner trims, dedupes, drops empty rows and columns', async ({ page }) => {
	await page.goto('tools/csv-cleaner/');
	await expect(page.locator('#csc-dupes')).toHaveText('2');
	await expect(page.locator('#csc-blank')).toHaveText('1');
	await expect(page.locator('#csc-cols')).toHaveText('1');
	await expect(page.locator('#csc-rows')).toHaveText('4');
	await expect(page.locator('#csc-table thead th')).toHaveText(['name', 'email', 'city', 'signup']);
	await expect(page.locator('#csc-out')).toContainText('Ada Lovelace,ada@example.com,London,2024-03-02');
	await page.locator('#csc-sort').selectOption({ label: 'signup' });
	await page.locator('#csc-order').selectOption('desc');
	await expect(page.locator('#csc-table tbody tr').first()).toContainText('Ada Lovelace');
	await expect(page.locator('#csc-table tbody tr').last()).toContainText('Linus Torvalds');
	await page.locator('#csc-dedupe').uncheck();
	await expect(page.locator('#csc-rows')).toHaveText('6');
});

test('sql csv converter builds inserts per dialect and parses them back', async ({ page }) => {
	await page.goto('tools/sql-csv-converter/');
	const out = page.locator('#scc-out');
	await expect(out).toContainText('INSERT INTO `users` (`id`, `name`, `email`, `plan`, `credits`, `joined`) VALUES');
	await expect(out).toContainText("(2, 'Grace Hopper', 'grace@example.com', 'team', NULL, '2023-11-19')");
	await expect(out).toContainText("'Alan O''Brien'");
	await page.locator('#scc-dialect').selectOption('postgres');
	await page.locator('#scc-table').fill('app.users');
	await page.locator('#scc-batch').uncheck();
	await expect(out).toContainText('INSERT INTO "app"."users" ("id"');
	await expect(page.locator('#scc-rows')).toHaveText('3');
	await page.getByRole('button', { name: 'SQL → CSV' }).click();
	await expect(out).toHaveText(
		'id,name,price,stock,tags\r\n1,Mechanical keyboard,89.9,14,"hardware,input"\r\n2,USB-C hub,34.5,,hardware\r\n3,Monitor arm,59,3,desk\'s best',
	);
	await expect(page.locator('#scc-table')).toBeHidden();
});

test('ascii table generator draws boxes and aligns numbers', async ({ page }) => {
	await page.goto('tools/ascii-table-generator/');
	await page.locator('#atg-in').fill('Name,Qty\napple,5\nkiwi,12');
	await expect(page.locator('#atg-out')).toHaveText('+-------+-----+\n| Name  | Qty |\n+=======+=====+\n| apple |   5 |\n| kiwi  |  12 |\n+-------+-----+');
	await page.getByRole('button', { name: 'Rounded' }).click();
	await expect(page.locator('#atg-out')).toHaveText('╭───────┬─────╮\n│ Name  │ Qty │\n├───────┼─────┤\n│ apple │   5 │\n│ kiwi  │  12 │\n╰───────┴─────╯');
});

test('ascii art generator renders figlet banners', async ({ page }) => {
	await page.goto('tools/ascii-art-generator/');
	await page.locator('#aag-in').fill('Hi');
	await expect(page.locator('#aag-out')).toHaveText(' _   _ _\n| | | (_)\n| |_| | |\n|  _  | |\n|_| |_|_|');
	await page.getByRole('button', { name: 'ANSI Shadow' }).click();
	await expect(page.locator('#aag-out')).toContainText('██╗');
	await page.locator('#aag-comment').check();
	await expect(page.locator('#aag-out')).toContainText('// ██╗');
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
