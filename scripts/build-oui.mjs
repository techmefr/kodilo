import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const source = createRequire(import.meta.url)('oui-data');
const vendors = [];
const index = new Map();
const prefixes = {};

for (const [prefix, entry] of Object.entries(source)) {
	const lines = entry.split('\n');
	const country = lines.length > 1 ? lines.at(-1).trim() : '';
	const vendor = `${lines[0].trim()}\t${country}`;
	if (!index.has(vendor)) {
		index.set(vendor, vendors.length);
		vendors.push(vendor);
	}
	prefixes[prefix] = index.get(vendor);
}

writeFileSync(new URL('../src/data/oui.json', import.meta.url), JSON.stringify({ vendors, prefixes }));
console.log(`${Object.keys(prefixes).length} prefixes, ${vendors.length} vendors`);
