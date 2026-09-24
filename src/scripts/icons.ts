const modules = import.meta.glob('/node_modules/lucide-static/icons/*.svg', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

export function icon(name: string): string {
	return modules[`/node_modules/lucide-static/icons/${name}.svg`] ?? '';
}
