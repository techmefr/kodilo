import type { APIRoute } from 'astro';
import { synonyms } from '../data/synonyms';
import { builtCategories } from '../data/tools';
import { icon } from '../scripts/icons';

export const GET: APIRoute = () => {
	const tools = builtCategories.flatMap((c) => c.tools.map((t) => ({ s: t.slug, n: t.name, d: t.description, c: c.name, i: t.icon ?? 'wrench' })));
	const icons = Object.fromEntries([...new Set(tools.map((t) => t.i))].map((name) => [name, icon(name)]));
	return new Response(JSON.stringify({ tools, icons, synonyms }), { headers: { 'Content-Type': 'application/json' } });
};
