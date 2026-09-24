import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function samplePdf(pages: number): Promise<Uint8Array> {
	const doc = await PDFDocument.create();
	const bold = await doc.embedFont(StandardFonts.HelveticaBold);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const colors = [rgb(0.39, 0.4, 0.95), rgb(0.02, 0.71, 0.83), rgb(0.93, 0.35, 0.45), rgb(0.13, 0.7, 0.4)];
	for (let i = 1; i <= pages; i++) {
		const page = doc.addPage([595, 842]);
		page.drawRectangle({ x: 0, y: 700, width: 595, height: 142, color: colors[(i - 1) % colors.length] });
		page.drawText(`Sample document, page ${i}`, { x: 50, y: 760, size: 26, font: bold, color: rgb(1, 1, 1) });
		for (let l = 0; l < 18; l++) {
			page.drawText('The quick brown fox jumps over the lazy dog. 0123456789', { x: 50, y: 640 - l * 28, size: 13, font, color: rgb(0.2, 0.2, 0.25) });
		}
	}
	return doc.save();
}
