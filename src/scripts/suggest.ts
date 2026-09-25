const issueUrl = 'https://github.com/techmefr/kodilo/issues/new';

export function suggestUrl(name = '') {
	const params = new URLSearchParams({ template: 'tool-suggestion.yml' });
	const clean = name.trim();
	params.set('title', clean ? `[Tool] ${clean}` : '[Tool] ');
	if (clean) params.set('name', clean);
	return `${issueUrl}?${params.toString().replace(/\+/g, '%20')}`;
}

export function humanize(slug: string) {
	const words = slug
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.join(' ');
	return words.charAt(0).toUpperCase() + words.slice(1);
}
