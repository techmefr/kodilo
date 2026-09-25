import { categoryOf, categorySlug } from '../data/tools';

const REPO = 'https://github.com/techmefr/kodilo';

export interface Crumb {
	name: string;
	path: string;
}

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export const sitePath = (path = '') => `${base}${path}`;

export const absoluteUrl = (site: URL | undefined, path = '') => new URL(sitePath(path), site).href;

export const breadcrumbLd = (site: URL | undefined, crumbs: Crumb[]) => ({
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: crumbs.map((c, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name: c.name,
		item: absoluteUrl(site, c.path),
	})),
});

export const toolCrumbs = (slug: string, title: string): Crumb[] => {
	const category = categoryOf(slug);
	return [
		{ name: 'Home', path: '' },
		...(category ? [{ name: category.name, path: `categories/${categorySlug(category.name)}/` }] : []),
		{ name: title, path: `tools/${slug}/` },
	];
};

export const toolJsonLd = (site: URL | undefined, slug: string, title: string, description: string) => [
	breadcrumbLd(site, toolCrumbs(slug, title)),
	{
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: title,
		description,
		url: absoluteUrl(site, `tools/${slug}/`),
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
	},
];

export const bugReportUrl = (site: URL | undefined, slug: string, title: string) =>
	`${REPO}/issues/new?${new URLSearchParams({ template: 'bug-report.yml', 'tool-url': absoluteUrl(site, `tools/${slug}/`), title: `[Bug] ${title}` })}`;

export const itemListLd = (site: URL | undefined, name: string, items: Crumb[]) => ({
	'@context': 'https://schema.org',
	'@type': 'ItemList',
	name,
	numberOfItems: items.length,
	itemListElement: items.map((item, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name: item.name,
		url: absoluteUrl(site, item.path),
	})),
});
