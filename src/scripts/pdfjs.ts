import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerSrc;

export function openPdf(bytes: Uint8Array): Promise<PDFDocumentProxy> {
	return getDocument({ data: bytes.slice() }).promise;
}

export async function renderPage(pdf: PDFDocumentProxy, n: number, scale: number): Promise<HTMLCanvasElement> {
	const page = await pdf.getPage(n);
	const viewport = page.getViewport({ scale });
	const canvas = document.createElement('canvas');
	canvas.width = Math.ceil(viewport.width);
	canvas.height = Math.ceil(viewport.height);
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	await page.render({ canvas, canvasContext: ctx, viewport, intent: 'print' }).promise;
	return canvas;
}

export function canvasBytes(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Uint8Array> {
	return new Promise((res) => canvas.toBlob(async (b) => res(new Uint8Array(await b!.arrayBuffer())), type, quality));
}
