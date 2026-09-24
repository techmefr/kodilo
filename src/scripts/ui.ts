export function copyButton(button: HTMLElement, getText: () => string) {
	const label = button.textContent;
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
	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
			onChange(button.dataset.value ?? '');
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
