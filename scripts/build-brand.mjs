import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const pub = new URL('../public/', import.meta.url);
const svg = readFileSync(new URL('favicon.svg', pub), 'utf8');
const mark = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(html, width, height) {
	await page.setViewportSize({ width, height });
	await page.setContent(`<style>html,body{margin:0}</style>${html}`);
	await page.evaluate(() => document.fonts.ready);
	return page.screenshot({ omitBackground: true });
}

const icon = (size) => shot(`<img src="${mark}" width="${size}" height="${size}" style="display:block">`, size, size);

const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(icon));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
	const at = 6 + 16 * i;
	header.writeUInt8(size, at);
	header.writeUInt8(size, at + 1);
	header.writeUInt16LE(1, at + 4);
	header.writeUInt16LE(32, at + 6);
	header.writeUInt32LE(pngs[i].length, at + 8);
	header.writeUInt32LE(offset, at + 12);
	offset += pngs[i].length;
});
writeFileSync(new URL('favicon.ico', pub), Buffer.concat([header, ...pngs]));

writeFileSync(
	new URL('apple-touch-icon.png', pub),
	await shot(`<div style="width:180px;height:180px;background:#6d4fe0"><img src="${mark}" width="180" height="180" style="display:block"></div>`, 180, 180),
);

writeFileSync(
	new URL('og-image.png', pub),
	await shot(
		`<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;800&display=swap" rel="stylesheet">
		<div style="width:1200px;height:630px;box-sizing:border-box;padding:90px 100px;background:linear-gradient(135deg,#f5f3ff,#ede9fe);font-family:'Plus Jakarta Sans',system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;gap:28px">
			<div style="display:flex;align-items:center;gap:28px"><img src="${mark}" width="120" height="120"><span style="font-size:110px;font-weight:800;letter-spacing:-0.03em;color:#1e1b2e">kodilo</span></div>
			<div style="font-size:44px;font-weight:500;color:#4c4466;max-width:900px;line-height:1.3">Open-source tools for developers. No sign-up, nothing leaves your browser.</div>
		</div>`,
		1200,
		630,
	),
);

await browser.close();
console.log('favicon.ico, apple-touch-icon.png and og-image.png written');
