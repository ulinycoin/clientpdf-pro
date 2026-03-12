import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createLargePdf() {
    console.log('Generating 1000-page PDF...');
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < 1000; i++) {
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();

        page.drawText(`Page ${i + 1}`, {
            x: 50,
            y: height - 100,
            size: 30,
            color: rgb(0.2, 0.4, 0.8),
        });

        // Add some random text to make the page non-empty
        page.drawText('This is a large document generated specifically to test the virtualization capability of the StudioShell.', {
            x: 50,
            y: height - 200,
            size: 14,
        });

        // Draw a dummy rect
        page.drawRectangle({
            x: 50,
            y: height - 300,
            width: 200,
            height: 50,
            color: rgb(0.9, 0.9, 0.9),
            borderColor: rgb(0.5, 0.5, 0.5),
            borderWidth: 1,
        });

        if (i % 100 === 0 && i !== 0) {
            console.log(`Generated ${i} pages...`);
        }
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, 'e2e', 'fixtures', 'large-1000-pages.pdf');

    // Ensure fixtures dir exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`Successfully generated 1000-page PDF at ${outputPath}`);
}

createLargePdf().catch(console.error);
