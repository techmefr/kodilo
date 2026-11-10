const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

export function setupLangPicker(current: string, choose: (code: string) => void) {
	const button = el<HTMLButtonElement>('lang-btn');
	const list = el('lang-list');
	if (!button || !list) return;
	const options = [...list.querySelectorAll<HTMLElement>('[role="option"]')];
	let focused = Math.max(
		0,
		options.findIndex((o) => o.dataset.code === current),
	);

	const markCurrent = () => {
		const option = options.find((o) => o.dataset.code === current);
		button.querySelector('img')?.setAttribute('src', option?.querySelector('img')?.getAttribute('src') ?? '');
		const name = button.querySelector('.lang-name');
		if (name) name.textContent = option?.querySelector('.lang-name')?.textContent ?? '';
		options.forEach((o) => o.setAttribute('aria-selected', String(o.dataset.code === current)));
	};
	const focusOption = (index: number) => {
		focused = (index + options.length) % options.length;
		options.forEach((o, i) => o.classList.toggle('focus', i === focused));
		options[focused].scrollIntoView({ block: 'nearest' });
		list.setAttribute('aria-activedescendant', options[focused].id);
	};
	const close = (refocus = true) => {
		list.hidden = true;
		button.setAttribute('aria-expanded', 'false');
		if (refocus) button.focus();
	};
	const open = () => {
		list.hidden = false;
		button.setAttribute('aria-expanded', 'true');
		focusOption(focused);
		list.focus();
	};
	const pick = (index: number) => {
		const code = options[index].dataset.code!;
		close();
		if (code !== current) choose(code);
	};

	markCurrent();
	button.addEventListener('click', () => (list.hidden ? open() : close()));
	options.forEach((option, i) => {
		option.addEventListener('click', () => pick(i));
		option.addEventListener('mousemove', () => focusOption(i));
	});
	list.addEventListener('keydown', (e) => {
		const keys: Record<string, () => void> = {
			ArrowDown: () => focusOption(focused + 1),
			ArrowUp: () => focusOption(focused - 1),
			Home: () => focusOption(0),
			End: () => focusOption(options.length - 1),
			Enter: () => pick(focused),
			' ': () => pick(focused),
			Escape: () => close(),
			Tab: () => close(false),
		};
		const action = keys[e.key];
		if (!action) return;
		if (e.key !== 'Tab') e.preventDefault();
		action();
	});
	document.addEventListener('click', (e) => {
		if (!list.hidden && !(e.target as Element).closest('#lang-picker')) close(false);
	});
}
