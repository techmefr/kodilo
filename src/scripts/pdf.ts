export function humanBytes(n: number): string {
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function downloadBytes(bytes: Uint8Array, name: string) {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
	a.download = name;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export function dropZone(zone: HTMLElement, input: HTMLInputElement, onFiles: (files: File[]) => void) {
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

export function moveItem<T>(list: T[], from: number, to: number) {
	if (to < 0 || to >= list.length) return;
	const [x] = list.splice(from, 1);
	list.splice(to, 0, x);
}
