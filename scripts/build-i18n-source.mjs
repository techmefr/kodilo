import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const origin = process.env.KODILO_ORIGIN ?? 'http://127.0.0.1:4331/kodilo/';
const pages = ['', 'categories/', 'categories/json/', 'tools/json-formatter/', 'tools/aura-gradient-generator/', '404.html'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const found = new Set();

for (const path of pages) {
	await page.goto(origin + path);
	await page.waitForTimeout(600);
	for (const key of await page.evaluate(() => window.kodiloI18n.collect())) found.add(key);
	await page.keyboard.press('Control+k');
	await page.waitForTimeout(300);
	for (const key of await page.evaluate(() => window.kodiloI18n.collect())) found.add(key);
	await page.keyboard.press('Escape');
	const cat = page.locator('.cat-btn').nth(2);
	if (await cat.count()) {
		await cat.click();
		await page.waitForTimeout(500);
		for (const key of await page.evaluate(() => window.kodiloI18n.collect())) found.add(key);
	}
}

const catalogue = await (await fetch(origin + 'tools.json')).json();
for (const t of catalogue.tools) {
	found.add(t.n);
	found.add(t.d);
	found.add(t.c);
}
await browser.close();

const dynamic = [/^(All|Search|Layer|Stop) \d/, /^\d+ (tools|open-source)/, / · \d+ tools?$/];
const generalise = (k) => (dynamic.some((re) => re.test(k)) ? k.replace(/\d+/g, '{n}') : k);
const keys = [...new Set([...found].map(generalise))].filter((k) => k && /\p{L}/u.test(k)).sort((a, b) => a.localeCompare(b));
writeFileSync(new URL('../src/i18n/source.json', import.meta.url), JSON.stringify(keys, null, 1) + '\n');
console.log(keys.length, 'strings');
