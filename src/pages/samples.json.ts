import type { APIRoute } from 'astro';
import { samples } from '../data/samples';
import { builtCategories } from '../data/tools';

export const GET: APIRoute = () => {
	const body = Object.fromEntries(
		builtCategories.flatMap((c) =>
			c.tools.map((t) => [
				t.slug,
				[samples[t.slug]?.[0] ?? t.description, samples[t.slug]?.[1] ?? '', `${t.name} ${t.slug} ${t.description} ${c.name}`.toLowerCase()],
			]),
		),
	);
	return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
};
