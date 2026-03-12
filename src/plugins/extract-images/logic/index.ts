import type { ToolLogicFunction } from '../../../core/types/contracts';
import { extractImagesFromPdfBlob } from '../../../services/pdf/pdf-image-extractor';

export const run: ToolLogicFunction = async ({ inputIds, options, fs, emitProgress }) => {
  if (inputIds.length === 0) {
    throw new Error('Extract Images requires at least one input file');
  }

  const outputIds: string[] = [];
  const totalInputs = inputIds.length;

  for (let index = 0; index < inputIds.length; index += 1) {
    const fileId = inputIds[index]!;
    const entry = await fs.read(fileId);
    const blob = await entry.getBlob();
    const selectedCandidates = Array.isArray(options?.selectedCandidates)
      ? options.selectedCandidates
        .filter((item): item is { fileId: string; pageNumber: number; candidateId: string } => (
          Boolean(item)
          && typeof item === 'object'
          && typeof (item as { fileId?: unknown }).fileId === 'string'
          && typeof (item as { pageNumber?: unknown }).pageNumber === 'number'
          && typeof (item as { candidateId?: unknown }).candidateId === 'string'
        ))
        .filter((item) => item.fileId === fileId)
        .map((item) => ({ pageNumber: item.pageNumber, candidateId: item.candidateId }))
      : [];
    const pageNumbers = selectedCandidates.length > 0
      ? Array.from(new Set(selectedCandidates.map((item) => item.pageNumber))).sort((left, right) => left - right)
      : undefined;

    emitProgress?.(Math.max(1, Math.round((index / totalInputs) * 100)));

    const images = await extractImagesFromPdfBlob(blob, entry.getName(), {
      format: options?.format === 'jpeg' ? 'jpeg' : 'png',
      jpegQuality: typeof options?.jpegQuality === 'number' ? options.jpegQuality : undefined,
      minWidth: typeof options?.minWidth === 'number' ? options.minWidth : undefined,
      minHeight: typeof options?.minHeight === 'number' ? options.minHeight : undefined,
      includeInlineImages: options?.includeInlineImages !== false,
      dedupe: options?.dedupe !== false,
      selectedCandidates,
      pageNumbers,
    });

    for (const image of images) {
      const outEntry = await fs.write(new File([image.blob], image.fileName, { type: image.blob.type }));
      outputIds.push(outEntry.id);
    }

    emitProgress?.(Math.round(((index + 1) / totalInputs) * 100));
  }

  return { outputIds };
};
