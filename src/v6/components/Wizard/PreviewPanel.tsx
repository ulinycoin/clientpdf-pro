import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlatformRuntime } from '../../../app/platform/create-platform';
import { defaultFilePreviewService } from '../../preview/preview-service';
import type { FilePreviewState } from '../../hooks/use-file-previews';

interface PreviewPanelProps {
  runtime: PlatformRuntime;
  previews: FilePreviewState[];
  isLoading: boolean;
  toolId: string;
  title?: string;
}

const PAGE_SIZE = 6;
const PAGE_GRID_SIZE = 40;

function formatBytes(sizeBytes: number): string {
  if (sizeBytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = sizeBytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function kindLabel(mimeType: string): string {
  if (mimeType === 'application/pdf') {
    return 'PDF';
  }
  if (mimeType.startsWith('image/')) {
    return 'Image';
  }
  return 'File';
}

function LazyPreviewImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '80px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="preview-image-host">
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          className="preview-image"
          loading="lazy"
        />
      ) : (
        <div className="preview-fallback">Loading</div>
      )}
    </div>
  );
}

export function PreviewPanel({ runtime, previews, isLoading, toolId, title = 'Preview' }: PreviewPanelProps): JSX.Element | null {
  const [page, setPage] = useState(1);
  const [pdfPageByFileId, setPdfPageByFileId] = useState<Record<string, number>>({});
  const [pdfPageGridStartByFileId, setPdfPageGridStartByFileId] = useState<Record<string, number>>({});
  const [pdfThumbByFileId, setPdfThumbByFileId] = useState<Record<string, string | null>>({});
  const [pdfPageCountByFileId, setPdfPageCountByFileId] = useState<Record<string, number>>({});
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const totalPages = Math.max(1, Math.ceil(previews.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => {
      if (current > totalPages) {
        return totalPages;
      }
      return current;
    });
  }, [totalPages]);

  const pagedPreviews = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return previews.slice(start, start + PAGE_SIZE);
  }, [page, previews]);
  const isSinglePreview = pagedPreviews.length === 1;
  const isPdfPreview = pagedPreviews[0]?.kind === 'pdf';
  const isFocusedPreview = isSinglePreview && isPdfPreview;
  const isCompressFullPageMode = toolId === 'compress-pdf' && isSinglePreview;
  const renderScale = isCompressFullPageMode ? 3.2 : isFocusedPreview ? 2.6 : 1.15;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    void Promise.all(
      pagedPreviews.map(async (preview) => {
        if (preview.kind !== 'pdf') {
          return;
        }
        const selectedPage = pdfPageByFileId[preview.fileId] ?? 1;
        const pagePreview = await defaultFilePreviewService.getPdfPagePreview(
          runtime,
          preview.fileId,
          selectedPage,
          { scale: renderScale },
          abortController.signal,
        );
        if (abortController.signal.aborted) {
          return;
        }
        setPdfThumbByFileId((current) => ({
          ...current,
          [preview.fileId]: pagePreview.thumbnailUrl,
        }));
        if (pagePreview.pageCount !== undefined) {
          setPdfPageCountByFileId((current) => ({
            ...current,
            [preview.fileId]: pagePreview.pageCount as number,
          }));
        }
      }),
    );

    return () => {
      abortController.abort();
    };
  }, [pagedPreviews, pdfPageByFileId, renderScale, runtime]);

  if (previews.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className={`preview-panel${isCompressFullPageMode ? ' preview-panel-full-page' : ''}`} aria-label="File preview">
      <div className="preview-panel-header">
        <h3 className="preview-panel-title">{title}</h3>
        <div className="preview-panel-meta">
          {isLoading && <span className="preview-panel-status">Loading preview...</span>}
          {previews.length > PAGE_SIZE && (
            <div className="preview-pagination">
              <button className="btn-ghost preview-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Prev
              </button>
              <span className="preview-page-copy">
                {page}/{totalPages}
              </span>
              <button
                className="btn-ghost preview-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`preview-grid${isFocusedPreview ? ' focus' : ''}${isCompressFullPageMode ? ' full-page' : ''}`}>
        {pagedPreviews.map((preview) => {
          const effectivePageCount = Math.max(1, preview.pageCount ?? pdfPageCountByFileId[preview.fileId] ?? 1);
          const currentPage = Math.min(effectivePageCount, pdfPageByFileId[preview.fileId] ?? 1);
          const imageSrc = pdfThumbByFileId[preview.fileId] ?? preview.thumbnailUrl;
          return (
            <article
              key={preview.fileId}
              className={`preview-card${isFocusedPreview ? ' preview-card-focus' : ''}${isCompressFullPageMode ? ' preview-card-full-page' : ''}`}
            >
              <div
                className={`preview-thumb${isFocusedPreview ? ' preview-thumb-focus' : ''}${isCompressFullPageMode ? ' preview-thumb-full-page' : ''}`}
              >
                {imageSrc ? (
                  <button
                    type="button"
                    className="preview-open-btn"
                    onClick={() => setLightbox({ src: imageSrc, alt: `Preview of ${preview.name}` })}
                    title="Open large preview"
                    aria-label="Open large preview"
                  >
                    <LazyPreviewImage
                      src={imageSrc}
                      alt={`Preview of ${preview.name}`}
                    />
                  </button>
                ) : (
                  <div className="preview-fallback" aria-hidden="true">
                    {kindLabel(preview.mimeType)}
                  </div>
                )}
                {preview.kind === 'pdf' && effectivePageCount > 1 && (
                  <div className={`preview-thumb-controls${isCompressFullPageMode ? ' preview-thumb-controls-inline' : ''}`}>
                    <button
                      className="btn-ghost preview-page-btn"
                      aria-label="Prev page"
                      title="Prev page"
                      onClick={() =>
                        setPdfPageByFileId((current) => ({
                          ...current,
                          [preview.fileId]: Math.max(1, currentPage - 1),
                        }))
                      }
                      disabled={currentPage <= 1}
                    >
                      Prev
                    </button>
                    <span className="preview-thumb-page">
                      {currentPage}/{effectivePageCount}
                    </span>
                    <button
                      className="btn-ghost preview-page-btn"
                      aria-label="Next page"
                      title="Next page"
                      onClick={() =>
                        setPdfPageByFileId((current) => ({
                          ...current,
                          [preview.fileId]: Math.min(effectivePageCount, currentPage + 1),
                        }))
                      }
                      disabled={currentPage >= effectivePageCount}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
              <div className="preview-meta">
                <p className="preview-name" title={preview.name}>
                  {preview.name}
                </p>
                <p className="preview-copy">
                  {kindLabel(preview.mimeType)} · {formatBytes(preview.sizeBytes)}
                </p>
                {preview.kind === 'pdf' && <p className="preview-copy">Pages: {effectivePageCount}</p>}
                {preview.kind === 'pdf' && effectivePageCount > 1 && (
                  <div className="preview-page-grid-wrap">
                    <div className="preview-page-grid-header">
                      <span className="preview-copy">Page grid</span>
                      {effectivePageCount > PAGE_GRID_SIZE && (
                        <div className="preview-pagination">
                          <button
                            className="btn-ghost preview-page-btn"
                            onClick={() =>
                              setPdfPageGridStartByFileId((current) => {
                                const start = Math.max(1, (current[preview.fileId] ?? 1) - PAGE_GRID_SIZE);
                                return { ...current, [preview.fileId]: start };
                              })
                            }
                            disabled={(pdfPageGridStartByFileId[preview.fileId] ?? 1) <= 1}
                          >
                            Prev pages
                          </button>
                          <button
                            className="btn-ghost preview-page-btn"
                            onClick={() =>
                              setPdfPageGridStartByFileId((current) => {
                                const currentStart = current[preview.fileId] ?? 1;
                                const nextStart = Math.min(
                                  Math.max(1, effectivePageCount - PAGE_GRID_SIZE + 1),
                                  currentStart + PAGE_GRID_SIZE,
                                );
                                return { ...current, [preview.fileId]: nextStart };
                              })
                            }
                            disabled={(pdfPageGridStartByFileId[preview.fileId] ?? 1) + PAGE_GRID_SIZE > effectivePageCount}
                          >
                            Next pages
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="preview-page-grid" role="grid" aria-label="PDF pages grid">
                      {Array.from(
                        {
                          length: Math.max(
                            0,
                            Math.min(
                              PAGE_GRID_SIZE,
                              effectivePageCount - ((pdfPageGridStartByFileId[preview.fileId] ?? 1) - 1),
                            ),
                          ),
                        },
                        (_, idx) => (pdfPageGridStartByFileId[preview.fileId] ?? 1) + idx,
                      ).map((gridPage) => (
                        <button
                          key={`${preview.fileId}-page-${gridPage}`}
                          type="button"
                          className={`preview-page-tile${gridPage === currentPage ? ' active' : ''}`}
                          onClick={() =>
                            setPdfPageByFileId((current) => ({
                              ...current,
                              [preview.fileId]: gridPage,
                            }))
                          }
                          aria-label={`Go to page ${gridPage}`}
                        >
                          {gridPage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {preview.status === 'error' && preview.errorMessage && <p className="preview-error">{preview.errorMessage}</p>}
              </div>
            </article>
          );
        })}
      </div>
      {lightbox && (
        <div className="preview-lightbox" role="dialog" aria-modal="true" aria-label="Large page preview" onClick={() => setLightbox(null)}>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="preview-lightbox-image"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
