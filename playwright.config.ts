import { defineConfig, devices } from '@playwright/test';

const port = 4399;

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['list']] : 'list',
	use: {
		baseURL: `http://localhost:${port}/kodilo/`,
		trace: 'retain-on-failure',
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] }, testMatch: /smoke|tools/ },
		{ name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /smoke/ },
		{ name: 'dark', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' }, testMatch: /smoke/ },
		{ name: 'a11y', use: { ...devices['Desktop Chrome'] }, testMatch: /a11y/ },
		{ name: 'a11y-dark', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' }, testMatch: /a11y/ },
	],
	webServer: {
		command: `npx astro preview --port ${port}`,
		url: `http://localhost:${port}/kodilo/`,
		reuseExistingServer: !process.env.CI,
	},
});
