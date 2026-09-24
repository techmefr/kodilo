// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://techmefr.github.io',
	base: '/kodilo',
	integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
});
