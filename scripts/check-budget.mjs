import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const KB = 1024;
const rules = [
	{ match: /^_astro\/pdf\.worker/, max: 1400 * KB },
	{ match: /^_astro\/.*\.m?js$/, max: 600 * KB },
	{ match: /^_astro\/.*\.css$/, max: 60 * KB },
	{ match: /^oui\/.*\.json$/, max: 200 * KB },
	{ match: /\.html$/, max: 300 * KB },
	{ match: /\.(png|ico|svg)$/, max: 250 * KB },
];

const root = 'dist';
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));
const over = [];
let total = 0;

for (const file of files(root)) {
	const path = file.slice(root.length + 1).replaceAll('\\', '/');
	const size = statSync(file).size;
	total += size;
	const rule = rules.find((r) => r.match.test(path));
	if (rule && size > rule.max) over.push(`${path}: ${(size / KB).toFixed(0)} KB, limit ${(rule.max / KB).toFixed(0)} KB`);
}

if (over.length) {
	console.error(`Size budget exceeded:\n${over.join('\n')}`);
	process.exit(1);
}
console.log(`Size budget OK, ${(total / KB / KB).toFixed(1)} MB in total`);
