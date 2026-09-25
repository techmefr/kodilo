import { execSync, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

const git = (cmd) => {
	try {
		return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	} catch {
		return '';
	}
};

const base = git('merge-base origin/main HEAD').trim() || 'origin/main';
const files = [
	...new Set(
		[git(`diff --name-only ${base}`), git('diff --name-only'), git('diff --name-only --cached'), git('ls-files --others --exclude-standard')]
			.join('\n')
			.split('\n')
			.map((f) => f.trim())
			.filter(Boolean),
	),
];

const sharedPrefixes = ['src/components/', 'src/layouts/', 'src/scripts/', 'src/styles/', 'src/data/'];
const sharedFiles = /^(astro\.config\.|playwright\.config\.|package(-lock)?\.json$)/;
const shared = files.filter((f) => sharedPrefixes.some((p) => f.startsWith(p)) || sharedFiles.test(f));

const run = (args) => {
	console.log(`playwright ${args.join(' ')}`);
	const result = spawnSync('npx', ['playwright', ...args], { stdio: 'inherit' });
	if (result.status !== 0) process.exit(result.status ?? 1);
};

if (shared.length) {
	console.log(`Shared files changed: ${shared.join(', ')}`);
	run(['test', '--project=desktop', 'tests/smoke.spec.ts', 'tests/experience.spec.ts']);
	process.exit(0);
}

const slugs = files.map((f) => f.match(/^src\/pages\/tools\/([^/]+)\.astro$/)?.[1]).filter(Boolean);
const specs = new Set(files.filter((f) => /^tests\/.+\.spec\.ts$/.test(f) && !/(smoke|a11y)\.spec\.ts$/.test(f)));

for (const file of readdirSync('tests').filter((f) => /^tools.*\.spec\.ts$/.test(f))) {
	const source = readFileSync(`tests/${file}`, 'utf8');
	if (slugs.some((slug) => source.includes(`tools/${slug}/`))) specs.add(`tests/${file}`);
}

if (!slugs.length && !specs.size) {
	console.log('No tool or spec changes, nothing to test.');
	process.exit(0);
}

if (specs.size) run(['test', '--project=desktop', ...specs]);
if (slugs.length) {
	const grep = `(^| |/)(${slugs.join('|')})( renders|/ has)`;
	run([
		'test',
		'--project=desktop',
		'--project=mobile',
		'--project=dark',
		'--project=a11y',
		'--project=a11y-dark',
		'tests/smoke.spec.ts',
		'tests/a11y.spec.ts',
		'--grep',
		grep,
	]);
}
