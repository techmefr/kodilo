import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const origin = process.env.KODILO_ORIGIN ?? 'http://127.0.0.1:4331/kodilo/';
const chromePages = ['', 'categories/', 'categories/json/', 'tools/json-formatter/', 'tools/aura-gradient-generator/', '404.html'];
const catalogue = await (await fetch(origin + 'tools.json')).json();
const pages = [...new Set([...chromePages, ...catalogue.tools.map((t) => `tools/${t.s}/`)])];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const found = new Set();

for (const path of pages) {
	await page.goto(origin + path);
	await page.waitForTimeout(600);
	for (const key of await page.evaluate(() => window.kodiloI18n.collect())) found.add(key);
	if (!chromePages.includes(path)) continue;
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

for (const t of catalogue.tools) {
	found.add(t.n);
	found.add(t.d);
	found.add(t.c);
}
await browser.close();

const dynamic = [/^(All|Search|Layer|Stop) \d/, /^\d+ (tools|open-source)/, / · \d+ tools?$/];
const generalise = (k) => (dynamic.some((re) => re.test(k)) ? k.replace(/\d+/g, '{n}') : k);
const codeLike = /[_\\{}<>=|$^*~`]|(?<=\S)\/(?=\S)|^[\da-f]{12,}$|^\d|^[a-z]+(\.[a-z]+)+$|^[a-z0-9-]+$/;
const isProse = (key) => {
	const k = key.replace(/\{n\}/g, 'N');
	return k && /\p{L}/u.test(k) && (/\s/.test(k) ? k.split(/\s+/).length >= 4 || !codeLike.test(k) : /^\p{Lu}\p{Ll}+$/u.test(k) || /[^\x00-\x7f]/.test(k));
};
const keys = [...new Set([...found].map(generalise))].filter(isProse).sort((a, b) => a.localeCompare(b));
writeFileSync(new URL('../src/i18n/source.json', import.meta.url), JSON.stringify(keys, null, 1) + '\n');
console.log(keys.length, 'strings');
