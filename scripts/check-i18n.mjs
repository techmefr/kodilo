import { existsSync, readFileSync } from 'node:fs';

const source = JSON.parse(readFileSync(new URL('../src/i18n/source.json', import.meta.url), 'utf8'));
const locales = readFileSync(new URL('../src/i18n/locales.ts', import.meta.url), 'utf8')
	.match(/code: '([^']+)'/g)
	.map((m) => m.slice(7, -1))
	.filter((c) => c !== 'en');

const only = process.argv.slice(2);
let failed = false;

for (const code of only.length ? only : locales) {
	const file = new URL(`../public/i18n/${code}.json`, import.meta.url);
	if (!existsSync(file)) {
		console.log(`${code}: missing`);
		failed = true;
		continue;
	}
	let data;
	try {
		data = JSON.parse(readFileSync(file, 'utf8'));
	} catch (error) {
		console.log(`${code}: invalid JSON (${error.message})`);
		failed = true;
		continue;
	}
	const missing = source.filter((k) => typeof data[k] !== 'string' || !data[k].trim());
	const extra = Object.keys(data).filter((k) => !source.includes(k));
	const badPlaceholders = source.filter((k) => data[k] && (k.match(/\{n\}/g) ?? []).length !== (data[k].match(/\{n\}/g) ?? []).length);
	const problems = [];
	if (missing.length) problems.push(`${missing.length} missing (e.g. ${JSON.stringify(missing.slice(0, 3))})`);
	if (extra.length) problems.push(`${extra.length} unknown keys`);
	if (badPlaceholders.length) problems.push(`${badPlaceholders.length} placeholder mismatches (e.g. ${JSON.stringify(badPlaceholders.slice(0, 3))})`);
	console.log(`${code}: ${problems.length ? problems.join('; ') : 'ok'}`);
	if (problems.length) failed = true;
}

process.exit(failed ? 1 : 0);
