import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist-extension';
const SITE = join(OUT, 'site');
const REMOVED_FROM_SITE = ['sw.js', 'manifest.webmanifest', 'og-image.png', 'apple-touch-icon.png'];
const ICON_SIZES = { 16: 'icons/icon-192.png', 48: 'icons/icon-192.png', 128: 'icons/icon-512.png' };

rmSync(OUT, { recursive: true, force: true });

const build = spawnSync('npx', ['astro', 'build'], { stdio: 'inherit', env: { ...process.env, KODILO_TARGET: 'extension', PUBLIC_PAGE_SUFFIX: 'index.html' } });
if (build.status !== 0) process.exit(build.status ?? 1);

for (const file of REMOVED_FROM_SITE) rmSync(join(SITE, file), { force: true });

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

const common = {
	manifest_version: 3,
	name: 'Kodilo',
	version,
	description: 'Developer tools that run entirely in your browser. No sign-up, no account, nothing leaves your machine.',
	icons: ICON_SIZES,
	action: { default_title: 'Kodilo', default_icon: ICON_SIZES },
	content_security_policy: { extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'" },
};

const targets = {
	chrome: {
		...common,
		background: { service_worker: 'background.js' },
		side_panel: { default_path: 'index.html' },
		permissions: ['sidePanel'],
	},
	firefox: {
		...common,
		background: { scripts: ['background.js'] },
		sidebar_action: { default_panel: 'index.html', default_title: 'Kodilo', default_icon: ICON_SIZES, open_at_install: false },
		browser_specific_settings: { gecko: { id: 'kodilo@techmefr', strict_min_version: '121.0' } },
	},
};

for (const [name, manifest] of Object.entries(targets)) {
	const dir = join(OUT, name);
	mkdirSync(dir, { recursive: true });
	cpSync(SITE, dir, { recursive: true });
	cpSync('extension/background.js', join(dir, 'background.js'));
	writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, '\t')}\n`);
}
rmSync(SITE, { recursive: true, force: true });
console.log(`Extension built in ${OUT}/chrome and ${OUT}/firefox`);
