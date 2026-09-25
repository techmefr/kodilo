import type { APIRoute } from 'astro';
import { builtCategories } from '../data/tools';
import { iconSymbol } from '../scripts/icons';

export const GET: APIRoute = () => {
	const names = new Set(builtCategories.flatMap((c) => [c.icon, ...c.tools.map((t) => t.icon ?? 'wrench')]));
	const body = `<svg xmlns="http://www.w3.org/2000/svg">${[...names].map(iconSymbol).join('')}</svg>`;
	return new Response(body, { headers: { 'Content-Type': 'image/svg+xml' } });
};
