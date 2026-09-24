export function fileZone(zone: HTMLElement, input: HTMLInputElement, onFiles: (files: File[]) => void) {
	input.addEventListener('change', () => {
		onFiles([...(input.files ?? [])]);
		input.value = '';
	});
	zone.addEventListener('dragover', (e) => {
		e.preventDefault();
		zone.classList.add('over');
	});
	zone.addEventListener('dragleave', () => zone.classList.remove('over'));
	zone.addEventListener('drop', (e) => {
		e.preventDefault();
		zone.classList.remove('over');
		onFiles([...(e.dataTransfer?.files ?? [])]);
	});
}

export function saveBlob(blob: Blob, name: string) {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export function sampleCanvas(w = 1200, h = 800): HTMLCanvasElement {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	const g = c.getContext('2d')!;
	const sky = g.createLinearGradient(0, 0, 0, h);
	sky.addColorStop(0, '#1e3a8a');
	sky.addColorStop(0.55, '#f97316');
	sky.addColorStop(1, '#fde68a');
	g.fillStyle = sky;
	g.fillRect(0, 0, w, h);
	g.fillStyle = '#fef3c7';
	g.beginPath();
	g.arc(w * 0.7, h * 0.55, h * 0.12, 0, Math.PI * 2);
	g.fill();
	g.fillStyle = '#0f766e';
	g.beginPath();
	g.moveTo(0, h);
	g.lineTo(w * 0.25, h * 0.55);
	g.lineTo(w * 0.5, h * 0.8);
	g.lineTo(w * 0.8, h * 0.5);
	g.lineTo(w, h * 0.75);
	g.lineTo(w, h);
	g.fill();
	g.fillStyle = '#134e4a';
	g.fillRect(0, h * 0.9, w, h * 0.1);
	return c;
}

export function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
	return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), type, quality));
}

export function loadImageFile(file: Blob): Promise<HTMLImageElement> {
	return new Promise((res, rej) => {
		const img = new Image();
		img.onload = () => res(img);
		img.onerror = rej;
		img.src = URL.createObjectURL(file);
	});
}
