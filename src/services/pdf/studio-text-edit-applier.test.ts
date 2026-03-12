import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { applyStudioTextEditsToPdfBytes } from './studio-text-edit-applier';
import { parsePdfTextOperators } from './pdf-content-stream-parser';
import { extractEmbeddedPdfText } from './pdf-text-extractor';

async function createBlankPdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([612, 792]);
  const bytes = await doc.save();
  const stable = new Uint8Array(bytes.byteLength);
  stable.set(bytes);
  return stable;
}

async function createSingleLinePdfBytes(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: 72, y: 700, size: 24, font });
  const bytes = await doc.save();
  const stable = new Uint8Array(bytes.byteLength);
  stable.set(bytes);
  return stable;
}

async function createTwoLinePdfBytes(topText: string, bottomText: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(topText, { x: 72, y: 700, size: 24, font });
  page.drawText(bottomText, { x: 72, y: 640, size: 24, font });
  const bytes = await doc.save();
  const stable = new Uint8Array(bytes.byteLength);
  stable.set(bytes);
  return stable;
}

function encodeLatin1(input: string): Uint8Array {
  const bytes = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    bytes[i] = input.charCodeAt(i) & 0xff;
  }
  return bytes;
}

async function convertFirstTextOperatorToTJ(sourceBytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(sourceBytes);
  const page = doc.getPage(0);
  const { PDFName } = await import('pdf-lib');
  const core = await import('pdf-lib/cjs/core');
  const decodePDFRawStream = (core as { decodePDFRawStream: (stream: unknown) => { decode: () => Uint8Array } }).decodePDFRawStream;

  const contentsRef = page.node.get(PDFName.of('Contents'));
  const resolved = doc.context.lookup(contentsRef as any) as any;
  const stream = resolved && typeof resolved.size === 'function' ? doc.context.lookup(resolved.get(0)) : resolved;
  const decoded = new TextDecoder('latin1').decode(decodePDFRawStream(stream).decode());
  const operators = parsePdfTextOperators(decoded);
  assert.ok(operators.length >= 1);
  const first = operators[0];
  assert.ok(first);
  const updated = `${decoded.slice(0, first.start)}[(${first.textSegments.join(' ')})] TJ${decoded.slice(first.end)}`;
  const updatedStream = doc.context.flateStream(encodeLatin1(updated));
  const updatedRef = doc.context.register(updatedStream);
  page.node.set(PDFName.of('Contents'), updatedRef);

  const bytes = await doc.save();
  const stable = new Uint8Array(bytes.byteLength);
  stable.set(bytes);
  return stable;
}

async function appendNonTextContentStream(sourceBytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(sourceBytes);
  const page = doc.getPage(0) as any;
  const extra = doc.context.flateStream(encodeLatin1('q Q'));
  const extraRef = doc.context.register(extra);
  page.node.addContentStream(extraRef);
  const bytes = await doc.save();
  const stable = new Uint8Array(bytes.byteLength);
  stable.set(bytes);
  return stable;
}

function toPdfBlob(bytes: Uint8Array): Blob {
  const stable = new Uint8Array(bytes.byteLength);
  stable.set(bytes);
  return new Blob([stable.buffer], { type: 'application/pdf' });
}

async function readFixturePdfBytes(...segments: string[]): Promise<Uint8Array> {
  const fixturePath = join(process.cwd(), 'test', 'fixtures', 'pdfs', ...segments);
  const bytes = await readFile(fixturePath);
  return new Uint8Array(bytes);
}

async function getFirstTextOperatorAnchor(
  sourceBytes: Uint8Array,
): Promise<{ xRatio: number; yRatio: number; text: string } | null> {
  const doc = await PDFDocument.load(sourceBytes);
  const page = doc.getPage(0);
  const { PDFName } = await import('pdf-lib');
  const core = await import('pdf-lib/cjs/core');
  const decodePDFRawStream = (core as { decodePDFRawStream: (stream: unknown) => { decode: () => Uint8Array } }).decodePDFRawStream;

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const contentsRef = page.node.get(PDFName.of('Contents'));
  const resolved = doc.context.lookup(contentsRef as any) as any;
  const streams = resolved && typeof resolved.size === 'function'
    ? Array.from({ length: Number(resolved.size()) }, (_, index) => doc.context.lookup(resolved.get(index)))
    : [resolved];

  for (const stream of streams) {
    const decodedBytes = decodePDFRawStream(stream).decode();
    const content = new TextDecoder('latin1').decode(decodedBytes);
    const operators = parsePdfTextOperators(content);
    const first = operators.find((operator) => operator.textSegments.join('').trim().length > 0);
    if (!first) {
      continue;
    }
    if (!Number.isFinite(first.textMatrixX) || !Number.isFinite(first.textMatrixY)) {
      continue;
    }
    const h = 0.08;
    const xRatio = Math.max(0.02, Math.min(0.9, (first.textMatrixX as number) / pageWidth));
    const yRatio = Math.max(0.02, Math.min(0.9, ((pageHeight - (first.textMatrixY as number)) / pageHeight) - (h / 2)));
    return {
      xRatio,
      yRatio,
      text: first.textSegments.join(' ').trim(),
    };
  }

  return null;
}

test('applyStudioTextEditsToPdfBytes supports advanced formatting fields', async () => {
  const sourceBytes = await createBlankPdfBytes();
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-advanced',
      type: 'text',
      x: 0.1,
      y: 0.15,
      w: 0.6,
      h: 0.1,
      text: 'ADVANCED FORMAT',
      color: '#000000',
      fontSize: 20,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.7,
      letterSpacing: 1.4,
      opacity: 1,
    }],
  });

  assert.ok(result.outputBytes.byteLength > 0);
  assert.equal(result.overflowDetected, false);
  assert.equal(result.trueReplaceApplied, false);
});

test('applyStudioTextEditsToPdfBytes does not crash on Arabic/CJK text without optional font files', async () => {
  const sourceBytes = await createBlankPdfBytes();
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-intl-safe',
      type: 'text',
      x: 0.1,
      y: 0.2,
      w: 0.7,
      h: 0.1,
      text: 'مرحبا 世界',
      color: '#000000',
      fontSize: 20,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  assert.ok(result.outputBytes.byteLength > 0);
  assert.equal(result.trueReplaceApplied, false);
});

test('applyStudioTextEditsToPdfBytes reports overflow for constrained width content', async () => {
  const sourceBytes = await createBlankPdfBytes();
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-overflow',
      type: 'text',
      x: 0.1,
      y: 0.2,
      w: 0.04,
      h: 0.05,
      text: 'THIS TEXT SHOULD OVERFLOW',
      color: '#000000',
      fontSize: 32,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 8,
      opacity: 1,
    }],
  });

  assert.equal(result.overflowDetected, true);
  assert.equal(result.trueReplaceApplied, false);
});

test('applyStudioTextEditsToPdfBytes true-replaces a single Tj line when deterministic', async () => {
  const sourceBytes = await createSingleLinePdfBytes('OLD TOKEN');
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-replace',
      type: 'text',
      x: 0.1,
      y: 0.1,
      w: 0.6,
      h: 0.08,
      text: 'NEW TOKEN',
      color: '#000000',
      fontSize: 20,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  const extracted = await extractEmbeddedPdfText(toPdfBlob(result.outputBytes));
  const text = extracted?.text ?? '';
  assert.match(text, /NEW TOKEN/u);
  assert.doesNotMatch(text, /OLD TOKEN/u);
  assert.equal(result.trueReplaceApplied, true);
  assert.equal(result.trueReplaceFallbackReason, undefined);
});


test('applyStudioTextEditsToPdfBytes true-replaces a single TJ line when deterministic', async () => {
  const sourceBytes = await createSingleLinePdfBytes('OLD TJ TOKEN');
  const tjSourceBytes = await convertFirstTextOperatorToTJ(sourceBytes);
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes: tjSourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-replace-tj',
      type: 'text',
      x: 0.1,
      y: 0.1,
      w: 0.6,
      h: 0.08,
      text: 'NEW TJ TOKEN',
      color: '#000000',
      fontSize: 20,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  const extracted = await extractEmbeddedPdfText(toPdfBlob(result.outputBytes));
  const text = extracted?.text ?? '';
  assert.match(text, /NEW TJ TOKEN/u);
  assert.doesNotMatch(text, /OLD TJ TOKEN/u);
  assert.equal(result.trueReplaceApplied, true);
});

test('applyStudioTextEditsToPdfBytes supports multi-stream pages via true-replace or fallback overlay', async () => {
  const sourceBytes = await createSingleLinePdfBytes('OLD MULTI TOKEN');
  const multiStreamSourceBytes = await appendNonTextContentStream(sourceBytes);
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes: multiStreamSourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-replace-multi',
      type: 'text',
      x: 0.1,
      y: 0.1,
      w: 0.6,
      h: 0.08,
      text: 'NEW MULTI TOKEN',
      color: '#000000',
      fontSize: 20,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  const extracted = await extractEmbeddedPdfText(toPdfBlob(result.outputBytes));
  const text = extracted?.text ?? '';
  assert.match(text, /NEW MULTI TOKEN/u);
  assert.ok(typeof result.trueReplaceApplied === 'boolean');
});

test('applyStudioTextEditsToPdfBytes falls back when text operators are ambiguous', async () => {
  const sourceBytes = await createTwoLinePdfBytes('LINE A', 'LINE B');
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-ambiguous',
      type: 'text',
      x: 0.1,
      y: 0.114,
      w: 0.6,
      h: 0.08,
      text: 'REPLACED',
      color: '#000000',
      fontSize: 20,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  assert.equal(result.trueReplaceApplied, false);
  assert.equal(result.trueReplaceFallbackReason, 'AMBIGUOUS_TEXT_OPERATORS');
});

test('applyStudioTextEditsToPdfBytes matches nearest operator by text matrix position', async () => {
  const sourceBytes = await createTwoLinePdfBytes('TOP LINE', 'BOTTOM LINE');
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-nearest',
      type: 'text',
      x: 0.1,
      y: 0.18,
      w: 0.6,
      h: 0.08,
      text: 'BOTTOM REPLACED',
      color: '#000000',
      fontSize: 20,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  const extracted = await extractEmbeddedPdfText(toPdfBlob(result.outputBytes));
  const text = extracted?.text ?? '';
  assert.match(text, /TOP LINE/u);
  assert.match(text, /BOTTOM REPLACED/u);
  assert.doesNotMatch(text, /BOTTOM LINE/u);
  assert.equal(result.trueReplaceApplied, true);
});

test('applyStudioTextEditsToPdfBytes reports CONTENTS_MISSING fallback reason', async () => {
  const sourceBytes = await createBlankPdfBytes();
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-no-operator',
      type: 'text',
      x: 0.2,
      y: 0.2,
      w: 0.4,
      h: 0.1,
      text: 'No source operator',
      color: '#000000',
      fontSize: 18,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  assert.equal(result.trueReplaceApplied, false);
  assert.equal(result.trueReplaceFallbackReason, 'CONTENTS_MISSING');
});

test('applyStudioTextEditsToPdfBytes reports INELIGIBLE_EDIT_PAYLOAD fallback reason', async () => {
  const sourceBytes = await createSingleLinePdfBytes('PAYLOAD SOURCE');
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [
      {
        id: 'txt-a',
        type: 'text',
        x: 0.1,
        y: 0.1,
        w: 0.3,
        h: 0.08,
        text: 'A',
        color: '#000000',
        fontSize: 18,
        fontFamily: 'sora',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: 0,
        opacity: 1,
      },
      {
        id: 'txt-b',
        type: 'text',
        x: 0.5,
        y: 0.1,
        w: 0.3,
        h: 0.08,
        text: 'B',
        color: '#000000',
        fontSize: 18,
        fontFamily: 'sora',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: 0,
        opacity: 1,
      },
    ],
  });

  assert.equal(result.trueReplaceApplied, false);
  assert.equal(result.trueReplaceFallbackReason, 'INELIGIBLE_EDIT_PAYLOAD');
});

test('applyStudioTextEditsToPdfBytes true-replaces anchor text on simple-letter fixture', async () => {
  const sourceBytes = await readFixturePdfBytes('documents', 'simple-letter.pdf');
  const anchor = await getFirstTextOperatorAnchor(sourceBytes);
  assert.ok(anchor, 'expected text anchor in simple-letter fixture');

  const replacementText = 'FIXTURE TRUE REPLACE TOKEN';
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-fixture-anchor',
      type: 'text',
      x: anchor.xRatio,
      y: anchor.yRatio,
      w: 0.5,
      h: 0.08,
      text: replacementText,
      color: '#000000',
      fontSize: 18,
      fontFamily: 'times',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  const extracted = await extractEmbeddedPdfText(toPdfBlob(result.outputBytes));
  const text = extracted?.text ?? '';
  assert.match(text, /FIXTURE TRUE REPLACE TOKEN/u);
  assert.equal(result.trueReplaceApplied, true);
});

test('applyStudioTextEditsToPdfBytes reports fallback reason on image-only fixture', async () => {
  const sourceBytes = await readFixturePdfBytes('scanned', 'image-only.pdf');
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'txt-image-only',
      type: 'text',
      x: 0.1,
      y: 0.1,
      w: 0.6,
      h: 0.08,
      text: 'SHOULD FALLBACK',
      color: '#000000',
      fontSize: 20,
      fontFamily: 'sora',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
    }],
  });

  assert.equal(result.trueReplaceApplied, false);
  assert.ok(
    result.trueReplaceFallbackReason === 'TEXT_OPERATOR_NOT_FOUND'
      || result.trueReplaceFallbackReason === 'STREAM_DECODE_FAILED',
  );
});

test('fixture taxonomy matrix keeps expected true-replace and fallback behavior', async () => {
  const cases: Array<{
    path: [string, string];
    expectedApplied: boolean;
    expectedReasons?: string[];
    useAnchor?: boolean;
    manualPosition?: { x: number; y: number };
  }> = [
    { path: ['invoices', 'simple-invoice.pdf'], expectedApplied: true },
    { path: ['invoices', 'multi-page-invoice.pdf'], expectedApplied: true },
    { path: ['invoices', 'tax-invoice.pdf'], expectedApplied: true },
    { path: ['invoices', 'international-invoice.pdf'], expectedApplied: true },
    {
      path: ['forms', 'w2-form.pdf'],
      expectedApplied: false,
      expectedReasons: ['AMBIGUOUS_TEXT_OPERATORS'],
      useAnchor: false,
      manualPosition: { x: 0.1, y: 0.1 },
    },
    {
      path: ['forms', 'job-application.pdf'],
      expectedApplied: false,
      expectedReasons: ['AMBIGUOUS_TEXT_OPERATORS'],
      useAnchor: false,
      manualPosition: { x: 0.1, y: 0.1 },
    },
    {
      path: ['forms', 'medical-form.pdf'],
      expectedApplied: false,
      expectedReasons: ['AMBIGUOUS_TEXT_OPERATORS'],
      useAnchor: false,
      manualPosition: { x: 0.1, y: 0.1 },
    },
    {
      path: ['forms', 'registration-form.pdf'],
      expectedApplied: false,
      expectedReasons: ['AMBIGUOUS_TEXT_OPERATORS'],
      useAnchor: false,
      manualPosition: { x: 0.1, y: 0.1 },
    },
    { path: ['documents', 'simple-letter.pdf'], expectedApplied: true },
    { path: ['documents', 'two-column-article.pdf'], expectedApplied: true },
    { path: ['documents', 'mixed-fonts.pdf'], expectedApplied: true },
    { path: ['documents', 'multi-line-paragraph.pdf'], expectedApplied: true },
    {
      path: ['scanned', 'scanned-ocr-receipt.pdf'],
      expectedApplied: false,
      expectedReasons: ['AMBIGUOUS_TEXT_OPERATORS'],
      useAnchor: false,
      manualPosition: { x: 0.1, y: 0.1 },
    },
    {
      path: ['scanned', 'image-only.pdf'],
      expectedApplied: false,
      expectedReasons: ['TEXT_OPERATOR_NOT_FOUND', 'STREAM_DECODE_FAILED'],
      useAnchor: false,
      manualPosition: { x: 0.1, y: 0.1 },
    },
    { path: ['edge-cases', 'duplicate-labels.pdf'], expectedApplied: true },
    { path: ['edge-cases', 'minimal-positioning.pdf'], expectedApplied: true },
    {
      path: ['edge-cases', 'rotated-text.pdf'],
      expectedApplied: false,
      expectedReasons: ['AMBIGUOUS_TEXT_OPERATORS'],
      useAnchor: false,
      manualPosition: { x: 0.1, y: 0.1 },
    },
    { path: ['edge-cases', 'complex-table.pdf'], expectedApplied: true },
  ];

  for (const fixtureCase of cases) {
    const [group, file] = fixtureCase.path;
    const sourceBytes = await readFixturePdfBytes(group, file);
    const useAnchor = fixtureCase.useAnchor ?? true;
    const anchor = useAnchor ? await getFirstTextOperatorAnchor(sourceBytes) : null;
    const position = fixtureCase.manualPosition ?? (anchor ? { x: anchor.xRatio, y: anchor.yRatio } : null);

    assert.ok(position, `expected probe position for fixture ${group}/${file}`);
    const result = await applyStudioTextEditsToPdfBytes({
      sourceBytes,
      pageIndex: 0,
      elements: [{
        id: `txt-fixture-matrix-${group}-${file}`,
        type: 'text',
        x: position.x,
        y: position.y,
        w: 0.5,
        h: 0.08,
        text: 'FIXTURE MATRIX REPLACE',
        color: '#000000',
        fontSize: 18,
        fontFamily: 'sora',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: 0,
        opacity: 1,
      }],
    });

    assert.equal(
      result.trueReplaceApplied,
      fixtureCase.expectedApplied,
      `unexpected trueReplaceApplied for ${group}/${file}`,
    );
    if (!fixtureCase.expectedApplied) {
      const expectedReasons = fixtureCase.expectedReasons ?? [];
      assert.ok(
        expectedReasons.includes(result.trueReplaceFallbackReason ?? ''),
        `unexpected fallback reason for ${group}/${file}: ${result.trueReplaceFallbackReason ?? 'undefined'}`,
      );
    }
  }
});

test('applyStudioTextEditsToPdfBytes applies watermark elements with repeat safely', async () => {
  const sourceBytes = await createBlankPdfBytes();
  const result = await applyStudioTextEditsToPdfBytes({
    sourceBytes,
    pageIndex: 0,
    elements: [{
      id: 'wm-repeat',
      type: 'watermark',
      x: 0.12,
      y: 0.18,
      w: 0.22,
      h: 0.08,
      text: 'DRAFT',
      color: '#666666',
      fontSize: 26,
      fontFamily: 'sora',
      fontWeight: 'bold',
      fontStyle: 'normal',
      opacity: 0.2,
      rotation: -35,
      repeatEnabled: true,
      repeatCols: 3,
      repeatRows: 3,
      repeatGapX: 0.12,
      repeatGapY: 0.1,
    }],
  });

  assert.ok(result.outputBytes.byteLength > 0);
  assert.equal(result.overflowDetected, false);
});
