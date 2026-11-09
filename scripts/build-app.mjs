import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist-app';
const REMOVED = ['sw.js', 'manifest.webmanifest', 'og-image.png'];

rmSync(OUT, { recursive: true, force: true });

const build = spawnSync('npx', ['astro', 'build'], { stdio: 'inherit', env: { ...process.env, KODILO_TARGET: 'app', PUBLIC_PAGE_SUFFIX: 'index.html' } });
if (build.status !== 0) process.exit(build.status ?? 1);

for (const file of REMOVED) rmSync(join(OUT, file), { force: true });
console.log(`App bundle built in ${OUT}`);
