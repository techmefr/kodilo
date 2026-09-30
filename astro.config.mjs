// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import pwa from './scripts/pwa-integration.mjs';

const OUT_DIRS = { extension: './dist-extension/site', app: './dist-app' };
const bundledTarget = OUT_DIRS[process.env.KODILO_TARGET ?? ''];

const webConfig = {
	site: 'https://techmefr.github.io',
	base: '/kodilo',
	integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') }), pwa()],
};

const bundledConfig = {
	site: 'https://techmefr.github.io',
	base: '/',
	outDir: bundledTarget,
	build: { inlineStylesheets: 'never' },
	vite: { build: { assetsInlineLimit: 0 } },
	integrations: [],
};

export default defineConfig(bundledTarget ? bundledConfig : webConfig);
