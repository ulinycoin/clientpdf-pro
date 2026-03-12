import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const fixturesRoot = join(rootDir, 'test', 'fixtures', 'pdfs');

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function savePdf(doc, relativePath) {
  const targetPath = join(fixturesRoot, relativePath);
  await ensureDir(dirname(targetPath));
  const bytes = await doc.save();
  await writeFile(targetPath, bytes);
}

async function createBaseDoc() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const courier = await doc.embedFont(StandardFonts.Courier);
  const unicodeSansBytes = await readFile(
    join(rootDir, 'node_modules', '@fontsource', 'noto-sans', 'files', 'noto-sans-cyrillic-400-normal.woff'),
  );
  const unicodeSans = await doc.embedFont(unicodeSansBytes);
  return { doc, fonts: { helvetica, helveticaBold, times, courier, unicodeSans } };
}

function drawHeading(page, text, font) {
  page.drawText(text, { x: 48, y: 760, size: 18, font, color: rgb(0.1, 0.1, 0.1) });
}

async function generateInvoices() {
  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Simple Invoice', fonts.helveticaBold);
    page.drawText('Vendor: LocalPDF Supplies', { x: 48, y: 724, size: 12, font: fonts.helvetica });
    page.drawText('Invoice #: INV-1001', { x: 48, y: 706, size: 12, font: fonts.helvetica });
    page.drawText('Line Items', { x: 48, y: 676, size: 12, font: fonts.helveticaBold });
    page.drawText('1. PDF processing plan         129.00', { x: 48, y: 656, size: 11, font: fonts.helvetica });
    page.drawText('2. Support package              35.00', { x: 48, y: 640, size: 11, font: fonts.helvetica });
    page.drawText('Total: 164.00', { x: 430, y: 600, size: 12, font: fonts.helveticaBold });
    await savePdf(doc, 'invoices/simple-invoice.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page1 = doc.addPage([612, 792]);
    drawHeading(page1, 'Multi-page Invoice', fonts.helveticaBold);
    page1.drawText('Page 1/2', { x: 520, y: 760, size: 10, font: fonts.helvetica });
    for (let i = 0; i < 20; i += 1) {
      page1.drawText(`${i + 1}. Service line ${i + 1}     ${(10 + i).toFixed(2)}`, {
        x: 48,
        y: 720 - i * 22,
        size: 10,
        font: fonts.helvetica,
      });
    }
    page1.drawText('Subtotal: 390.00', { x: 420, y: 120, size: 12, font: fonts.helveticaBold });

    const page2 = doc.addPage([612, 792]);
    drawHeading(page2, 'Multi-page Invoice', fonts.helveticaBold);
    page2.drawText('Page 2/2', { x: 520, y: 760, size: 10, font: fonts.helvetica });
    page2.drawText('Tax: 31.20', { x: 430, y: 680, size: 12, font: fonts.helvetica });
    page2.drawText('Grand Total: 421.20', { x: 390, y: 652, size: 13, font: fonts.helveticaBold });
    await savePdf(doc, 'invoices/multi-page-invoice.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Tax Invoice', fonts.helveticaBold);
    page.drawText('VAT ID: EU123456789', { x: 48, y: 724, size: 11, font: fonts.helvetica });
    page.drawText('Tax Base: 250.00', { x: 48, y: 694, size: 11, font: fonts.helvetica });
    page.drawText('VAT 21%: 52.50', { x: 48, y: 676, size: 11, font: fonts.helvetica });
    page.drawText('Total: 302.50', { x: 430, y: 640, size: 13, font: fonts.helveticaBold });
    await savePdf(doc, 'invoices/tax-invoice.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'International Invoice', fonts.helveticaBold);
    page.drawText('Client: Muenchen GmbH / Sao Paulo Ltda.', { x: 48, y: 724, size: 11, font: fonts.helvetica });
    page.drawText('Description: Service for region Espana and Deutschland.', { x: 48, y: 704, size: 11, font: fonts.helvetica });
    page.drawText('Localized refs: Munchen, Sao Paulo, Espana, facades.', { x: 48, y: 684, size: 11, font: fonts.helvetica });
    page.drawText('UTF-8 sample: M\u00FCnchen | S\u00E3o Paulo | Espa\u00F1a | fa\u00E7ade', {
      x: 48,
      y: 664,
      size: 11,
      font: fonts.unicodeSans,
    });
    page.drawText('Total: 980.00 EUR', { x: 420, y: 670, size: 13, font: fonts.helveticaBold });
    await savePdf(doc, 'invoices/international-invoice.pdf');
  }
}

async function generateForms() {
  const names = [
    ['w2-form.pdf', 'W2 Tax Form'],
    ['job-application.pdf', 'Job Application'],
    ['medical-form.pdf', 'Medical Intake Form'],
    ['registration-form.pdf', 'Registration Form'],
  ];
  for (const [file, title] of names) {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, title, fonts.helveticaBold);
    const fields = ['First Name', 'Last Name', 'Address', 'Phone', 'Email'];
    fields.forEach((field, index) => {
      const y = 712 - index * 58;
      page.drawText(field, { x: 48, y, size: 11, font: fonts.helvetica });
      page.drawRectangle({ x: 160, y: y - 8, width: 360, height: 22, borderWidth: 1, borderColor: rgb(0.6, 0.6, 0.6) });
    });
    page.drawText('Consent', { x: 48, y: 380, size: 11, font: fonts.helvetica });
    page.drawRectangle({ x: 110, y: 376, width: 12, height: 12, borderWidth: 1, borderColor: rgb(0.4, 0.4, 0.4) });
    await savePdf(doc, `forms/${file}`);
  }
}

async function generateDocuments() {
  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Simple Letter', fonts.times);
    page.drawText('Dear Reader,', { x: 48, y: 724, size: 12, font: fonts.times });
    page.drawText('This is a simple paragraph with single-column text.', { x: 48, y: 700, size: 12, font: fonts.times });
    page.drawText('Sincerely, LocalPDF Team', { x: 48, y: 650, size: 12, font: fonts.times });
    await savePdf(doc, 'documents/simple-letter.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Two Column Article', fonts.helveticaBold);
    for (let i = 0; i < 18; i += 1) {
      page.drawText(`Left column paragraph line ${i + 1}`, { x: 48, y: 724 - i * 22, size: 10, font: fonts.helvetica });
      page.drawText(`Right column paragraph line ${i + 1}`, { x: 330, y: 724 - i * 22, size: 10, font: fonts.helvetica });
    }
    await savePdf(doc, 'documents/two-column-article.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Mixed Fonts Document', fonts.helveticaBold);
    page.drawText('Helvetica paragraph sample text.', { x: 48, y: 720, size: 12, font: fonts.helvetica });
    page.drawText('Times paragraph sample text.', { x: 48, y: 690, size: 12, font: fonts.times });
    page.drawText('Courier paragraph sample text.', { x: 48, y: 660, size: 12, font: fonts.courier });
    await savePdf(doc, 'documents/mixed-fonts.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Multi-line Paragraph', fonts.helveticaBold);
    const lines = [
      'This paragraph spans multiple lines for line-break testing.',
      'The content aims to trigger T* or Td movement in content streams.',
      'Each line is intentionally distinct for replacement assertions.',
    ];
    lines.forEach((line, index) => {
      page.drawText(line, { x: 48, y: 724 - index * 24, size: 11, font: fonts.helvetica });
    });
    await savePdf(doc, 'documents/multi-line-paragraph.pdf');
  }
}

async function generateScanned() {
  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    page.drawRectangle({ x: 36, y: 120, width: 540, height: 620, color: rgb(0.96, 0.96, 0.96) });
    page.drawText('SCANNED RECEIPT IMAGE LAYER', { x: 180, y: 680, size: 10, font: fonts.helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('OCR: Store Total 45.20', { x: 52, y: 130, size: 6, font: fonts.helvetica, color: rgb(1, 1, 1), opacity: 0.01 });
    await savePdf(doc, 'scanned/scanned-ocr-receipt.pdf');
  }

  {
    const { doc } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    page.drawRectangle({ x: 40, y: 100, width: 530, height: 640, color: rgb(0.9, 0.9, 0.9) });
    await savePdf(doc, 'scanned/image-only.pdf');
  }
}

async function generateEdgeCases() {
  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Duplicate Labels', fonts.helveticaBold);
    page.drawText('Subtotal: 100.00', { x: 48, y: 720, size: 12, font: fonts.helvetica });
    page.drawText('Tax Total: 20.00', { x: 48, y: 694, size: 12, font: fonts.helvetica });
    page.drawText('Grand Total: 120.00', { x: 48, y: 668, size: 12, font: fonts.helveticaBold });
    page.drawText('Total words repeated: Total Total Total', { x: 48, y: 620, size: 11, font: fonts.helvetica });
    await savePdf(doc, 'edge-cases/duplicate-labels.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Minimal Positioning', fonts.helveticaBold);
    page.drawText('Anchor A', { x: 48, y: 724, size: 11, font: fonts.helvetica });
    page.drawText('Anchor B', { x: 48, y: 704, size: 11, font: fonts.helvetica });
    page.drawText('Anchor C', { x: 48, y: 684, size: 11, font: fonts.helvetica });
    await savePdf(doc, 'edge-cases/minimal-positioning.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Rotated Text', fonts.helveticaBold);
    page.drawText('ROTATED LABEL', {
      x: 250,
      y: 350,
      size: 18,
      font: fonts.helveticaBold,
      rotate: degrees(90),
    });
    await savePdf(doc, 'edge-cases/rotated-text.pdf');
  }

  {
    const { doc, fonts } = await createBaseDoc();
    const page = doc.addPage([612, 792]);
    drawHeading(page, 'Complex Table', fonts.helveticaBold);
    const startX = 48;
    const startY = 700;
    const cols = [120, 120, 120, 120];
    const rowHeight = 24;
    for (let row = 0; row < 12; row += 1) {
      let x = startX;
      cols.forEach((colWidth, colIdx) => {
        page.drawRectangle({
          x,
          y: startY - row * rowHeight,
          width: colWidth,
          height: rowHeight,
          borderWidth: 0.8,
          borderColor: rgb(0.75, 0.75, 0.75),
        });
        page.drawText(`R${row + 1}C${colIdx + 1}`, {
          x: x + 8,
          y: startY - row * rowHeight + 8,
          size: 9,
          font: fonts.helvetica,
        });
        x += colWidth;
      });
    }
    await savePdf(doc, 'edge-cases/complex-table.pdf');
  }
}

async function writeCatalog() {
  const catalog = {
    schemaVersion: 1,
    root: 'test/fixtures/pdfs',
    groups: {
      invoices: [
        'simple-invoice.pdf',
        'multi-page-invoice.pdf',
        'tax-invoice.pdf',
        'international-invoice.pdf',
      ],
      forms: ['w2-form.pdf', 'job-application.pdf', 'medical-form.pdf', 'registration-form.pdf'],
      documents: ['simple-letter.pdf', 'two-column-article.pdf', 'mixed-fonts.pdf', 'multi-line-paragraph.pdf'],
      scanned: ['scanned-ocr-receipt.pdf', 'image-only.pdf'],
      'edge-cases': ['duplicate-labels.pdf', 'minimal-positioning.pdf', 'rotated-text.pdf', 'complex-table.pdf'],
    },
  };
  await writeFile(join(fixturesRoot, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
}

async function main() {
  await ensureDir(fixturesRoot);
  await generateInvoices();
  await generateForms();
  await generateDocuments();
  await generateScanned();
  await generateEdgeCases();
  await writeCatalog();
  console.log('PDF fixtures generated at', fixturesRoot);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
