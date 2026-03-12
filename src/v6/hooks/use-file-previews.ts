import { useEffect, useMemo, useState } from 'react';
import type { PlatformRuntime } from '../../app/platform/create-platform';
import { defaultFilePreviewService, type FilePreview } from '../preview/preview-service';

export interface FilePreviewState extends FilePreview {
  status: 'ready' | 'error';
  errorMessage?: string;
}

interface UseFilePreviewsResult {
  previews: FilePreviewState[];
  isLoading: boolean;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Preview is unavailable for this file';
}

function createRunId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `preview-${crypto.randomUUID()}`;
  }
  return `preview-${Math.random().toString(16).slice(2)}`;
}

export function useFilePreviews(runtime: PlatformRuntime, toolId: string, fileIds: string[]): UseFilePreviewsResult {
  const stableFileIds = useMemo(() => [...fileIds], [fileIds]);
  const runId = useMemo(() => createRunId(), []);
  const [previews, setPreviews] = useState<FilePreviewState[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (stableFileIds.length === 0) {
      setPreviews([]);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);

    void Promise.all(
      stableFileIds.map(async (fileId) => {
        const startedAt = performance.now();
        try {
          const preview = await defaultFilePreviewService.getPreview(runtime, fileId, abortController.signal);
          runtime.telemetry.track({
            type: 'UI_PREVIEW_RENDERED',
            runId,
            toolId,
            fileId,
            durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
            pageCount: preview.pageCount,
          });
          return { ...preview, status: 'ready' as const };
        } catch (error) {
          if (abortController.signal.aborted) {
            return null;
          }

          runtime.telemetry.track({
            type: 'UI_PREVIEW_ERROR',
            runId,
            toolId,
            fileId,
            message: toErrorMessage(error),
          });

          return {
            fileId,
            name: fileId,
            mimeType: 'application/octet-stream',
            sizeBytes: 0,
            kind: 'file' as const,
            thumbnailUrl: null,
            status: 'error' as const,
            errorMessage: toErrorMessage(error),
          };
        }
      }),
    ).then((items) => {
      if (abortController.signal.aborted) {
        return;
      }
      const resolved: FilePreviewState[] = [];
      for (const item of items) {
        if (item) {
          resolved.push(item);
        }
      }
      setPreviews(resolved);
      setIsLoading(false);
    });

    return () => {
      abortController.abort();
    };
  }, [runId, runtime, stableFileIds, toolId]);

  return { previews, isLoading };
}
