export function copyButton(button: HTMLElement, getText: () => string) {
	const label = button.textContent;
	button.dataset.copy = '';
	button.addEventListener('click', async () => {
		await navigator.clipboard.writeText(getText());
		button.textContent = 'Copied';
		button.classList.add('copied');
		setTimeout(() => {
			button.textContent = label;
			button.classList.remove('copied');
		}, 1200);
	});
}

export function segmented(group: HTMLElement, onChange: (value: string) => void) {
	const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('button'));
	const sync = () => {
		const current = buttons.find((b) => b.getAttribute('aria-checked') === 'true') ?? buttons.find((b) => !b.disabled);
		buttons.forEach((b) => (b.tabIndex = b === current ? 0 : -1));
	};
	const adopt = (b: HTMLButtonElement) => {
		const pressed = b.getAttribute('aria-pressed');
		if (pressed === null) return;
		b.removeAttribute('aria-pressed');
		b.setAttribute('aria-checked', pressed);
	};
	group.setAttribute('role', 'radiogroup');
	buttons.forEach((b) => {
		b.setAttribute('role', 'radio');
		if (!b.hasAttribute('aria-pressed') && !b.hasAttribute('aria-checked')) b.setAttribute('aria-checked', 'false');
		adopt(b);
	});
	sync();
	new MutationObserver((records) => {
		records.forEach((r) => adopt(r.target as HTMLButtonElement));
		sync();
	}).observe(group, { subtree: true, attributeFilter: ['aria-pressed', 'aria-checked', 'disabled'] });
	const select = (button: HTMLButtonElement) => {
		buttons.forEach((b) => b.setAttribute('aria-checked', String(b === button)));
		onChange(button.dataset.value ?? '');
	};
	buttons.forEach((button) => {
		button.addEventListener('click', () => select(button));
		button.addEventListener('keydown', (e) => {
			const enabled = buttons.filter((b) => !b.disabled);
			const index = enabled.indexOf(button);
			const target =
				e.key === 'ArrowRight' || e.key === 'ArrowDown'
					? enabled[(index + 1) % enabled.length]
					: e.key === 'ArrowLeft' || e.key === 'ArrowUp'
						? enabled[(index - 1 + enabled.length) % enabled.length]
						: e.key === 'Home'
							? enabled[0]
							: e.key === 'End'
								? enabled[enabled.length - 1]
								: undefined;
			if (!target) return;
			e.preventDefault();
			target.focus();
			target.click();
		});
	});
}

export function onPage(rootId: string, setup: () => void) {
	document.addEventListener('astro:page-load', () => {
		if (document.getElementById(rootId)) setup();
	});
}

export function byId<T extends HTMLElement>(id: string): T {
	return document.getElementById(id) as T;
}
