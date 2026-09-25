import { readFileSync, writeFileSync } from 'node:fs';
import { builtCategories } from '../src/data/tools.ts';

const path = new URL('../README.md', import.meta.url);
const readme = readFileSync(path, 'utf8');
const start = readme.indexOf("## What's in here");
const end = readme.indexOf('## Stack');
const total = builtCategories.reduce((n, c) => n + c.tools.length, 0);

const sections = builtCategories.map(
	(c) =>
		`### ${c.name} (${c.tools.length})\n\n${c.tools.map((t) => `- [${t.name}](https://techmefr.github.io/kodilo/tools/${t.slug}/) — ${t.description}`).join('\n')}\n`,
);

const body = `## What's in here

**${total} tools** in ${builtCategories.length} categories. No sign-up, no account, no tracking: every tool runs entirely in your browser.

- Find any tool from the sidebar mega menu or the ⌘K / Ctrl K search. Ideas for new ones are welcome as issues.

${sections.join('\n')}
Inspired partly by [it-tools](https://github.com/CorentinTh/it-tools), [devbench.site](https://devbench.site/),
[OpenFormatter](https://openformatter.com/tools) and [CyberChef](https://github.com/gchq/CyberChef).

`;

const next = readme.slice(0, start) + body + readme.slice(end);
if (process.argv.includes('--check')) {
	if (next !== readme) {
		console.error('README.md is out of date. Run npm run readme.');
		process.exit(1);
	}
	console.log('README.md is up to date');
} else {
	writeFileSync(path, next);
	console.log(`README.md lists ${total} tools`);
}
