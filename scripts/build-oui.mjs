import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const source = createRequire(import.meta.url)('oui-data');
const out = new URL('../public/oui/', import.meta.url);
const shards = new Map();

for (const [prefix, entry] of Object.entries(source)) {
	const lines = entry.split('\n');
	const country = lines.length > 1 ? lines.at(-1).trim() : '';
	const shard = prefix.slice(0, 3);
	if (!shards.has(shard)) shards.set(shard, {});
	shards.get(shard)[prefix.slice(3)] = `${lines[0].trim()}\t${country}`;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const [shard, entries] of shards) writeFileSync(new URL(`${shard}.json`, out), JSON.stringify(entries));
writeFileSync(new URL('count.json', out), JSON.stringify(Object.keys(source).length));
console.log(`${Object.keys(source).length} prefixes in ${shards.size} files`);
