import QRCode from 'qrcode';

export type QrOptions = { ecc: 'L' | 'M' | 'Q' | 'H'; dark: string; light: string; size: number };

export async function renderQr(canvas: HTMLCanvasElement, text: string, o: QrOptions) {
	await QRCode.toCanvas(canvas, text || ' ', {
		errorCorrectionLevel: o.ecc,
		width: o.size,
		margin: 2,
		color: { dark: o.dark, light: o.light },
	});
}

export async function qrSvg(text: string, o: QrOptions): Promise<string> {
	return QRCode.toString(text || ' ', {
		type: 'svg',
		errorCorrectionLevel: o.ecc,
		margin: 2,
		color: { dark: o.dark, light: o.light },
	});
}

export function save(href: string, name: string) {
	const a = document.createElement('a');
	a.href = href;
	a.download = name;
	a.click();
}
