export interface CategoryBar {
	load: (names: string[]) => void;
	step: (direction: 1 | -1) => void;
	reset: () => void;
	current: () => string | null;
}

export function createCategoryBar(host: HTMLElement, onChange: () => void): CategoryBar {
	let names: string[] = [];
	let index = 0;

	const label = (i: number) => (i === 0 ? 'All' : names[i - 1]);

	const paint = () => {
		host.querySelectorAll<HTMLButtonElement>('button').forEach((button, i) => {
			const on = i === index;
			button.setAttribute('aria-pressed', String(on));
			if (on) button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		});
	};

	const select = (next: number) => {
		if (next === index) return;
		index = next;
		paint();
		onChange();
	};

	return {
		load(list) {
			if (list.join('|') === names.join('|') && host.childElementCount) return;
			names = list;
			index = 0;
			host.replaceChildren(
				...[0, ...names.map((_, i) => i + 1)].map((i) => {
					const button = document.createElement('button');
					button.type = 'button';
					button.tabIndex = -1;
					button.textContent = label(i);
					button.addEventListener('click', () => select(i));
					return button;
				}),
			);
			paint();
		},
		step(direction) {
			const total = names.length + 1;
			select((index + direction + total) % total);
		},
		reset() {
			if (index === 0) return;
			index = 0;
			paint();
			onChange();
		},
		current: () => (index === 0 ? null : names[index - 1]),
	};
}
