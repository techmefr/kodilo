import { expect, test } from '@playwright/test';

test('http headers parser decodes cache-control and flags cookie issues', async ({ page }) => {
	await page.goto('tools/http-headers-parser/');
	await expect(page.locator('#hh-status')).toHaveText('200 OK');
	await expect(page.locator('#hh-list')).toContainText('max-age=3600: fresh for 3600 s');
	await expect(page.locator('#hh-warnings')).toContainText('SameSite=None without Secure');
	await expect(page.locator('#hh-warnings')).toContainText('Duplicate header x-frame-options appears 2 times');
	await page.locator('#hh-in').fill('Set-Cookie: id=1; Max-Age=0; Secure; SameSite=Strict');
	await expect(page.locator('#hh-list')).toContainText('Max-Age: 0 (delete now)');
	await expect(page.locator('#hh-warn-count')).toHaveText('0');
	await page.locator('#hh-cookie').fill('a=1; b=hello%20world');
	await expect(page.locator('#hh-cookies')).toContainText('Decoded: hello world');
});

test('license generator fills MIT with holder and year', async ({ page }) => {
	await page.goto('tools/license-generator/');
	await page.locator('#lg-year').fill('2031');
	await page.locator('#lg-holder').fill('Ada Lovelace');
	await expect(page.locator('#lg-out')).toContainText('Copyright (c) 2031 Ada Lovelace');
	await expect(page.locator('#lg-out')).toContainText('Permission is hereby granted, free of charge');
	await page.locator('#lg-tool button[data-value="Apache-2.0"]').click();
	await expect(page.locator('#lg-out')).toContainText('Copyright 2031 Ada Lovelace');
	await expect(page.locator('#lg-out')).toContainText('END OF TERMS AND CONDITIONS');
	await expect(page.locator('#lg-traits')).toContainText('Patent use');
	await page.locator('#lg-tool button[data-value="BSD-3-Clause"]').click();
	await expect(page.locator('#lg-out')).toContainText('Copyright (c) 2031, Ada Lovelace');
});

test('csr generator outputs a PEM request and PKCS#8 key', async ({ page }) => {
	await page.goto('tools/csr-generator/');
	await expect(page.locator('#csr-out')).toHaveText(/^-----BEGIN CERTIFICATE REQUEST-----/, { timeout: 20000 });
	await expect(page.locator('#csr-priv')).toHaveText(/^-----BEGIN PRIVATE KEY-----/);
	await page.locator('#csr-key button[data-value="p256"]').click();
	await expect(page.locator('#csr-status')).toContainText('ECDSA P-256', { timeout: 20000 });
	await expect(page.locator('#csr-out')).toHaveText(/-----END CERTIFICATE REQUEST-----/);
});

test('code screenshot highlights keywords and strings', async ({ page }) => {
	await page.goto('tools/code-screenshot/');
	await page.locator('#cs-in').fill('const name = "kodilo"; // hi');
	await expect(page.locator('#cs-code .tk-k')).toHaveText('const');
	await expect(page.locator('#cs-code .tk-s')).toHaveText('"kodilo"');
	await expect(page.locator('#cs-code .tk-c')).toHaveText('// hi');
	await page.locator('#cs-lang').selectOption('sql');
	await page.locator('#cs-in').fill('select 42');
	await expect(page.locator('#cs-code .tk-k')).toHaveText('select');
	await expect(page.locator('#cs-code .tk-n')).toHaveText('42');
	const download = page.waitForEvent('download');
	await page.locator('#cs-png').click();
	expect((await download).suggestedFilename()).toMatch(/\.png$/);
});

test('placeholder image generator sizes the canvas and builds an svg', async ({ page }) => {
	await page.goto('tools/placeholder-image-generator/');
	await page.locator('#ph-w').fill('300');
	await page.locator('#ph-h').fill('150');
	await expect(page.locator('#ph-canvas')).toHaveAttribute('width', '300');
	await expect(page.locator('#ph-svg')).toContainText('width="300" height="150"');
	await expect(page.locator('#ph-svg')).toContainText('300×150');
	await expect(page.locator('#ph-uri')).toHaveText(/^data:image\/png;base64,/);
	await page.locator('#ph-format button[data-value="svg"]').click();
	await expect(page.locator('#ph-uri')).toHaveText(/^data:image\/svg\+xml,/);
});
