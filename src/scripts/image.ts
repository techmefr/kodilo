export function loadImage(file: Blob): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('This file is not an image the browser can read.'));
		img.src = url;
	});
}

export function render(img: HTMLImageElement, width: number, height: number, type: string, quality: number, background?: string): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	if (background) {
		ctx.fillStyle = background;
		ctx.fillRect(0, 0, width, height);
	}
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(img, 0, 0, width, height);
	return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the image.'))), type, quality));
}

export function humanSize(bytes: number): string {
	return bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(2)} MB`;
}

export function sampleImage(): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = 1200;
	canvas.height = 800;
	const ctx = canvas.getContext('2d')!;
	const g = ctx.createLinearGradient(0, 0, 1200, 800);
	g.addColorStop(0, '#bd93f9');
	g.addColorStop(1, '#ff79c6');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 1200, 800);
	ctx.fillStyle = 'rgba(255,255,255,0.9)';
	ctx.font = 'bold 120px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('kodilo', 600, 440);
	return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}
