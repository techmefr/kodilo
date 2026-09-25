import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEMPLATE = `JSON.parse('{"version":"dev","base":"/kodilo/","precache":[]}')`;

function walk(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
}

export default function pwa() {
	let base = '/';
	return {
		name: 'kodilo-pwa',
		hooks: {
			'astro:config:done': ({ config }) => {
				base = config.base.replace(/\/?$/, '/');
			},
			'astro:build:done': ({ dir }) => {
				const root = fileURLToPath(dir);
				const swPath = join(root, 'sw.js');
				const files = walk(root)
					.map((file) => relative(root, file).replaceAll('\\', '/'))
					.filter((path) => path !== 'sw.js')
					.sort();
				const hash = createHash('sha256');
				for (const path of files) hash.update(path).update(readFileSync(join(root, path)));
				const version = hash.digest('hex').slice(0, 12);

				const home = readFileSync(join(root, 'index.html'), 'utf8');
				const assetPattern = new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(_astro/[^"'\\s)]+)`, 'g');
				const shellAssets = [...home.matchAll(assetPattern)].map((match) => match[1]);
				const catalogue = files.filter((path) => /^[^/]+\.json$/.test(path));
				const statics = ['manifest.webmanifest', 'favicon.svg', 'icons.svg', 'icons/icon-192.png', '404.html'].filter((path) => existsSync(join(root, path)));
				const css = files.filter((path) => /^_astro\/.*\.css$/.test(path));
				const precache = ['', ...new Set([...statics, ...catalogue, ...css, ...shellAssets])].map((path) => `${base}${path}`);

				const config = JSON.stringify({ version, base, precache });
				const source = readFileSync(swPath, 'utf8').replace(TEMPLATE, `JSON.parse(${JSON.stringify(config)})`);
				writeFileSync(swPath, source);
			},
		},
	};
}
