// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import pwa from './scripts/pwa-integration.mjs';

const isExtension = process.env.KODILO_TARGET === 'extension';

const webConfig = {
	site: 'https://techmefr.github.io',
	base: '/kodilo',
	integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') }), pwa()],
};

const extensionConfig = {
	site: 'https://techmefr.github.io',
	base: '/',
	outDir: './dist-extension/site',
	build: { inlineStylesheets: 'never' },
	vite: { build: { assetsInlineLimit: 0 } },
	integrations: [],
};

export default defineConfig(isExtension ? extensionConfig : webConfig);
