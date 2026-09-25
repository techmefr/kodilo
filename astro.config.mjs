// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import pwa from './scripts/pwa-integration.mjs';

export default defineConfig({
	site: 'https://techmefr.github.io',
	base: '/kodilo',
	integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') }), pwa()],
});
