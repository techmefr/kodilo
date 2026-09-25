import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const pub = new URL('../public/', import.meta.url);
const svg = readFileSync(new URL('favicon.svg', pub), 'utf8');
const toUrl = (source) => `data:image/svg+xml;base64,${Buffer.from(source).toString('base64')}`;
const mark = toUrl(svg);
const glyph = toUrl(svg.replace(/<rect[^>]*\/>/, ''));

mkdirSync(new URL('icons/', pub), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(html, size) {
	await page.setViewportSize({ width: size, height: size });
	await page.setContent(`<style>html,body{margin:0}</style>${html}`);
	return page.screenshot({ omitBackground: true });
}

for (const size of [192, 512]) {
	writeFileSync(new URL(`icons/icon-${size}.png`, pub), await shot(`<img src="${mark}" width="${size}" height="${size}" style="display:block">`, size));
	const inner = Math.round(size * 0.7);
	writeFileSync(
		new URL(`icons/maskable-${size}.png`, pub),
		await shot(
			`<div style="width:${size}px;height:${size}px;background:#6d4fe0;display:flex;align-items:center;justify-content:center"><img src="${glyph}" width="${inner}" height="${inner}"></div>`,
			size,
		),
	);
}

await browser.close();
console.log('PWA icons written');
