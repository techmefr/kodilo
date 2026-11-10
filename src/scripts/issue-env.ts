const BROWSERS: [string, RegExp][] = [
	['Edge', /Edg\/([\d.]+)/],
	['Opera', /OPR\/([\d.]+)/],
	['Firefox', /Firefox\/([\d.]+)/],
	['Chrome', /Chrome\/([\d.]+)/],
	['Safari', /Version\/([\d.]+).*Safari/],
];

const SYSTEMS: [string, RegExp][] = [
	['Windows', /Windows/],
	['Android', /Android/],
	['iOS', /iPhone|iPad|iPod/],
	['macOS', /Macintosh|Mac OS X/],
	['Linux', /Linux|X11/],
];

function browserName(agent: string) {
	const brave = (navigator as Navigator & { brave?: unknown }).brave;
	for (const [name, pattern] of BROWSERS) {
		const match = agent.match(pattern);
		if (match) return `${brave ? 'Brave' : name} ${match[1].split('.')[0]}`;
	}
	return 'Unknown browser';
}

export function environmentSummary(): string {
	const agent = navigator.userAgent;
	const system = SYSTEMS.find(([, pattern]) => pattern.test(agent))?.[0] ?? 'Unknown system';
	const viewport = `${window.innerWidth}×${window.innerHeight}`;
	return `${browserName(agent)} on ${system}, viewport ${viewport}, language ${document.documentElement.lang || navigator.language}`;
}

export function currentTheme(): 'Light' | 'Dark' {
	const forced = document.documentElement.dataset.theme;
	if (forced === 'dark') return 'Dark';
	if (forced === 'light') return 'Light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light';
}

export function prefillIssueLink(link: HTMLAnchorElement) {
	const url = new URL(link.href);
	const fields = (link.dataset.issueFields ?? '').split(',').filter(Boolean);
	if (fields.includes('browser')) url.searchParams.set('browser', environmentSummary());
	if (fields.includes('theme')) url.searchParams.set('theme', currentTheme());
	if (fields.includes('page-url')) url.searchParams.set('page-url', location.href);
	link.href = url.toString();
}

export function prefillIssueLinks(root: ParentNode = document) {
	root.querySelectorAll<HTMLAnchorElement>('a[data-issue-fields]').forEach((link) => {
		if (link.dataset.issueBound) return;
		link.dataset.issueBound = '1';
		link.addEventListener('click', () => prefillIssueLink(link));
		link.addEventListener('focus', () => prefillIssueLink(link));
		link.addEventListener('pointerenter', () => prefillIssueLink(link));
	});
}
