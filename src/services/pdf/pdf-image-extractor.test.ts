import assert from 'node:assert/strict';
import test from 'node:test';
import { extractImagesFromPdfBlob } from './pdf-image-extractor';

function createMockCanvasFactory() {
  return {
    create(width: number, height: number) {
      const state = {
        width,
        height,
        pixels: new Uint8ClampedArray(width * height * 4),
      };

      const context = {
        createImageData(nextWidth: number, nextHeight: number) {
          return { data: new Uint8ClampedArray(nextWidth * nextHeight * 4), width: nextWidth, height: nextHeight };
        },
        putImageData(imageData: { data: Uint8ClampedArray }) {
          state.pixels = new Uint8ClampedArray(imageData.data);
        },
        drawImage(bitmap: { pixels?: Uint8ClampedArray }) {
          if (bitmap?.pixels) {
            state.pixels = new Uint8ClampedArray(bitmap.pixels);
          }
        },
      };

      return {
        width,
        height,
        getContext(kind: '2d') {
          return kind === '2d' ? context as unknown as CanvasRenderingContext2D : null;
        },
        async convertToBlob(options?: { type?: string }) {
          return new Blob([state.pixels], { type: options?.type ?? 'image/png' });
        },
      };
    },
  };
}

function createMockPdfJs() {
  const ops = {
    paintImageXObject: 85,
    paintInlineImageXObject: 86,
    paintImageXObjectRepeat: 88,
    paintInlineImageXObjectGroup: 87,
  };
  const imageA = {
    width: 2,
    height: 2,
    kind: 3,
    data: new Uint8ClampedArray([
      255, 0, 0, 255,
      255, 0, 0, 255,
      255, 0, 0, 255,
      255, 0, 0, 255,
    ]),
  };
  const imageB = {
    width: 2,
    height: 2,
    kind: 3,
    data: new Uint8ClampedArray([
      0, 255, 0, 255,
      0, 255, 0, 255,
      0, 255, 0, 255,
      0, 255, 0, 255,
    ]),
  };

  return {
    OPS: ops,
    VerbosityLevel: { ERRORS: 0 },
    getDocument() {
      return {
        promise: Promise.resolve({
          numPages: 1,
          getPage: async () => ({
            async getOperatorList() {
              return {
                fnArray: [ops.paintImageXObject, ops.paintImageXObjectRepeat, ops.paintInlineImageXObject],
                argsArray: [['imgA'], ['imgA'], [imageB]],
              };
            },
            objs: {
              get(objId: string, callback?: (value: unknown) => void) {
                if (objId !== 'imgA') {
                  throw new Error('Unexpected object');
                }
                if (callback) {
                  callback(imageA);
                  return null;
                }
                return imageA;
              },
            },
          }),
        }),
      };
    },
  };
}

test('extractImagesFromPdfBlob extracts unique page images and names them deterministically', async () => {
  const images = await extractImagesFromPdfBlob(
    new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' }),
    'Quarterly Report.pdf',
    { dedupe: true, includeInlineImages: true, minWidth: 1, minHeight: 1 },
    {
      pdfjs: createMockPdfJs(),
      canvasFactory: createMockCanvasFactory(),
    },
  );

  assert.equal(images.length, 2);
  assert.equal(images[0]?.fileName, 'Quarterly-Report-page-1-image-1.png');
  assert.equal(images[1]?.fileName, 'Quarterly-Report-page-1-image-2.png');
  assert.equal(images[0]?.source, 'xobject');
  assert.equal(images[1]?.source, 'inline');
});

test('extractImagesFromPdfBlob respects min size filters and can keep duplicates', async () => {
  const images = await extractImagesFromPdfBlob(
    new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' }),
    'source.pdf',
    { dedupe: false, includeInlineImages: false, minWidth: 2, minHeight: 2 },
    {
      pdfjs: createMockPdfJs(),
      canvasFactory: createMockCanvasFactory(),
    },
  );

  assert.equal(images.length, 2);
  assert.equal(images.every((item) => item.source === 'xobject'), true);
});
