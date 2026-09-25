type Action = { label: string; run: () => void };

function toast(message: string, action?: Action) {
	document.querySelector('.pwa-toast')?.remove();
	const box = document.createElement('div');
	box.className = 'pwa-toast';
	box.setAttribute('role', 'status');
	box.setAttribute('aria-live', 'polite');
	const text = document.createElement('span');
	text.textContent = message;
	box.append(text);
	if (action) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'btn pwa-toast-action';
		button.textContent = action.label;
		button.addEventListener('click', action.run);
		box.append(button);
	}
	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'pwa-toast-close';
	close.setAttribute('aria-label', 'Dismiss');
	close.textContent = '×';
	close.addEventListener('click', () => box.remove());
	box.append(close);
	document.body.append(box);
	if (!action) setTimeout(() => box.remove(), 5000);
}

function promptUpdate(worker: ServiceWorker) {
	toast('Update available', {
		label: 'Reload',
		run: () => {
			navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
			worker.postMessage('skip-waiting');
		},
	});
}

export async function registerServiceWorker(url: string, scope: string) {
	if (!('serviceWorker' in navigator)) return;
	const firstInstall = !navigator.serviceWorker.controller;
	const registration = await navigator.serviceWorker.register(url, { scope });
	if (registration.waiting && navigator.serviceWorker.controller) promptUpdate(registration.waiting);
	registration.addEventListener('updatefound', () => {
		const worker = registration.installing;
		if (!worker) return;
		worker.addEventListener('statechange', () => {
			if (worker.state === 'installed' && navigator.serviceWorker.controller) promptUpdate(worker);
			if (worker.state === 'activated' && firstInstall) toast('Available offline');
		});
	});
}
