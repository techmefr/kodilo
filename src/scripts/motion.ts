const KEY = 'kodilo-motion';

export const motionPaused = () => document.documentElement.dataset.motion === 'paused';

export async function whileMotionPaused() {
	while (motionPaused()) await new Promise<void>((resolve) => setTimeout(resolve, 300));
}

function stored(): boolean {
	try {
		return localStorage.getItem(KEY) === 'paused';
	} catch {
		return false;
	}
}

function remember(paused: boolean) {
	try {
		localStorage.setItem(KEY, paused ? 'paused' : 'playing');
	} catch {}
}

export function setupMotionToggle() {
	const button = document.getElementById('lp-motion');
	if (!button) return;
	const apply = (paused: boolean) => {
		if (paused) document.documentElement.dataset.motion = 'paused';
		else delete document.documentElement.dataset.motion;
		button.textContent = paused ? 'Play animations' : 'Pause animations';
	};
	apply(stored());
	button.addEventListener('click', () => {
		const next = !motionPaused();
		apply(next);
		remember(next);
	});
}
