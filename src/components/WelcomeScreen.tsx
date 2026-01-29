import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Tool, URLContext } from '@/types';
import { useSharedFile } from '@/hooks/useSharedFile';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PreviewFrame } from '@/components/common/preview/PreviewFrame';
import { PreviewCanvas } from '@/components/common/preview/PreviewCanvas';
import { PreviewImage } from '@/components/common/preview/PreviewImage';
import pdfService from '@/services/pdfService';
import { FileType, UploadCloud, X, ArrowLeft, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  context: URLContext | null; // Keep interface as is for now if needed, or remove param from destructuring
  onToolSelect: (tool: Tool) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  type: 'pdf' | 'image' | 'word' | 'unknown';
  pages?: number;
  previewUrl?: string;
  previewHtml?: string;
  previewState?: 'loading' | 'ready' | 'error' | 'empty';
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onToolSelect }) => {
  const { t } = useI18n();
  const { setSharedFile, setSharedFiles, clearSharedFile, clearSharedFiles } = useSharedFile();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [filesSaved, setFilesSaved] = useState(false);

  // Update shared files when files are uploaded
  React.useEffect(() => {
    if (uploadedFiles.length > 0 && !filesSaved) {
      if (uploadedFiles.length === 1) {
        // Single file - use setSharedFile for compatibility
        const firstFile = uploadedFiles[0].file;
        setSharedFile(firstFile, firstFile.name, 'welcome-screen');
      } else {
        // Multiple files - use setSharedFiles for merge
        setSharedFiles(
          uploadedFiles.map(uf => ({ blob: uf.file, name: uf.file.name })),
          'welcome-screen'
        );
      }
      setFilesSaved(true);
    }
  }, [uploadedFiles, filesSaved, setSharedFile, setSharedFiles]);

  const detectFileType = (file: File): UploadedFile['type'] => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['doc', 'docx'].includes(ext || '')) return 'word';
    return 'unknown';
  };

  const handleFiles = (files: FileList) => {
    setUploadedFiles((prev) => {
      prev.forEach((prevFile) => {
        if (prevFile.previewUrl) URL.revokeObjectURL(prevFile.previewUrl);
      });
      return [];
    });

    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      const type = detectFileType(file);
      const previewState: UploadedFile['previewState'] =
        type === 'unknown' ? 'empty' : type === 'word' ? 'loading' : 'ready';

      return {
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        type,
        pages: undefined,
        previewUrl: type === 'image' ? URL.createObjectURL(file) : undefined,
        previewHtml: undefined,
        previewState,
      };
    });
    setUploadedFiles(newFiles);
    setFilesSaved(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const clearFiles = () => {
    setUploadedFiles((prev) => {
      prev.forEach((prevFile) => {
        if (prevFile.previewUrl) URL.revokeObjectURL(prevFile.previewUrl);
      });
      return [];
    });
    setFilesSaved(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const wordPreviewInFlightRef = useRef<Set<string>>(new Set());
  const pdfInfoInFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    const pending = uploadedFiles.filter((file) =>
      file.type === 'word' &&
      !file.previewHtml &&
      file.previewState !== 'error' &&
      !wordPreviewInFlightRef.current.has(file.id)
    );

    if (pending.length === 0) {
      return () => {
        isMounted = false;
      };
    }

    pending.forEach((file) => {
      wordPreviewInFlightRef.current.add(file.id);
      pdfService.getWordPreviewHTML(file.file)
        .then((html) => {
          if (!isMounted) return;
          setUploadedFiles((prev) =>
            prev.map((item) =>
              item.id === file.id
                ? { ...item, previewHtml: html, previewState: 'ready' }
                : item
            )
          );
        })
        .catch((error) => {
          console.error('Word preview generation failed:', error);
          if (!isMounted) return;
          setUploadedFiles((prev) =>
            prev.map((item) =>
              item.id === file.id
                ? { ...item, previewState: 'error' }
                : item
            )
          );
        })
        .finally(() => {
          wordPreviewInFlightRef.current.delete(file.id);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [uploadedFiles]);

  useEffect(() => {
    let isMounted = true;

    const pending = uploadedFiles.filter((file) =>
      file.type === 'pdf' &&
      typeof file.pages !== 'number' &&
      !pdfInfoInFlightRef.current.has(file.id)
    );

    if (pending.length === 0) {
      return () => {
        isMounted = false;
      };
    }

    pending.forEach((file) => {
      pdfInfoInFlightRef.current.add(file.id);
      pdfService.getPDFInfo(file.file)
        .then((info) => {
          if (!isMounted) return;
          setUploadedFiles((prev) =>
            prev.map((item) =>
              item.id === file.id
                ? { ...item, pages: info?.pages || info?.pageCount || undefined }
                : item
            )
          );
        })
        .catch((error) => {
          console.warn('Failed to read PDF info:', error);
        })
        .finally(() => {
          pdfInfoInFlightRef.current.delete(file.id);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [uploadedFiles]);

  const availableTools = useMemo(() => {
    const hasPDF = uploadedFiles.some((file) => file.type === 'pdf');
    const hasImages = uploadedFiles.some((file) => file.type === 'image');
    const hasWord = uploadedFiles.some((file) => file.type === 'word');
    const pdfCount = uploadedFiles.filter((file) => file.type === 'pdf').length;

    const tools: Array<{ tool: Tool; label: string; accepts: UploadedFile['type']; multi: boolean; visible: boolean }> = [
      { tool: 'merge-pdf', label: t('tools.merge-pdf.name'), accepts: 'pdf', multi: true, visible: hasPDF && pdfCount > 1 },
      { tool: 'compress-pdf', label: t('tools.compress-pdf.name'), accepts: 'pdf', multi: false, visible: hasPDF },
      { tool: 'split-pdf', label: t('tools.split-pdf.name'), accepts: 'pdf', multi: false, visible: hasPDF },
      { tool: 'edit-pdf', label: t('tools.edit-pdf.name'), accepts: 'pdf', multi: false, visible: hasPDF },
      { tool: 'pdf-to-word', label: t('tools.pdf-to-word.name'), accepts: 'pdf', multi: false, visible: hasPDF },
      { tool: 'images-to-pdf', label: t('tools.images-to-pdf.name'), accepts: 'image', multi: true, visible: hasImages },
      { tool: 'word-to-pdf', label: t('tools.word-to-pdf.name'), accepts: 'word', multi: true, visible: hasWord },
    ];

    return tools.filter((tool) => tool.visible);
  }, [t, uploadedFiles]);

  const handleToolLaunch = (tool: Tool, accepts: UploadedFile['type'], multi: boolean) => {
    const matchingFiles = uploadedFiles.filter((file) => file.type === accepts).map((item) => item.file);
    if (matchingFiles.length === 0) return;

    clearSharedFile();
    clearSharedFiles();

    if (multi || matchingFiles.length > 1) {
      setSharedFiles(
        matchingFiles.map((file) => ({ blob: file, name: file.name })),
        'welcome-screen'
      );
    } else {
      setSharedFile(matchingFiles[0], matchingFiles[0].name, 'welcome-screen');
    }

    onToolSelect(tool);
  };

  return (
    <div className="flex flex-col items-center justify-start pt-6 p-4 relative overflow-hidden">
      <div className="container-responsive max-w-6xl z-10">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 shadow-sm mb-4 hover:scale-105 transition-transform duration-300">
            <Shield className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
              {t('welcome.securePrefix')}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance text-gray-900 dark:text-gray-50 drop-shadow-sm leading-tight">
            {t('welcome.title')}
            <span className="block mt-2 text-gradient-blue">
              {t('welcome.titleSuffix')}
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed text-pretty">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Main Content Area */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {uploadedFiles.length === 0 ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`
                relative w-full max-w-5xl mx-auto min-h-[50vh] flex flex-col items-center justify-center
                text-center cursor-pointer
                transition-all duration-700 ease-out outline-none
                rounded-[3rem]
                backdrop-blur-3xl
                ${isDragging
                  ? 'bg-ocean-100/80 dark:bg-ocean-800/80 shadow-[0_20px_80px_rgba(0,0,0,0.2)] scale-[1.01] -translate-y-2'
                  : 'border border-white/20 dark:border-white/5 bg-white/20 dark:bg-[#1c1c1e]/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] hover:-translate-y-3'
                }
              `}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="group relative z-10 flex flex-col items-center justify-center space-y-8 p-12">
                {/* Icon Container */}
                <div className={`
                  p-8 rounded-[2rem] 
                  bg-white/40 dark:bg-white/5 
                  backdrop-blur-md border border-white/20 dark:border-white/10 
                  text-gray-700 dark:text-gray-200 
                  transition-all duration-500 shadow-xl
                  ${isDragging ? 'scale-110 shadow-2xl rotate-3' : 'group-hover:scale-105 group-hover:-rotate-3'}
                `}>
                  <UploadCloud className={`w-24 h-24 ${isDragging ? 'animate-bounce text-accent-blue' : 'text-gray-600 dark:text-gray-400'}`} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    {isDragging ? t('upload.dropHere') : t('upload.selectFiles')}
                  </h3>
                  <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
                    {t('upload.dragOrClick')}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {['PDF', 'JPG', 'PNG', 'Word'].map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="px-4 py-1.5 text-sm font-medium bg-white/50 dark:bg-white/5 backdrop-blur border border-white/20 transition-colors hover:bg-white/80 dark:hover:bg-white/10"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* File Preview / Ready State */
            <div className="relative w-full max-w-4xl mx-auto backdrop-blur-3xl rounded-[3rem] border border-white/20 dark:border-white/5 bg-white/40 dark:bg-[#1c1c1e]/60 shadow-2xl overflow-hidden p-8 md:p-12 animate-scale-in">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div>
                    {uploadedFiles.length === 1 ? (
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white break-all">
                        {uploadedFiles[0].file.name}
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {t(uploadedFiles.length === 1 ? 'upload.filesReadySingle' : 'upload.filesReadyPlural', { count: uploadedFiles.length })}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={clearFiles}
                  variant="ghost"
                  className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 px-6 py-6 rounded-xl text-base"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('common.clearAll')}
                </Button>
              </div>

              <div className="space-y-6 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
                {uploadedFiles.map((uploadedFile) => (
                  <div
                    key={uploadedFile.id}
                    className="group relative p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:border-ocean-300 dark:hover:border-ocean-700 transition-all duration-300 hover:bg-white/80 dark:hover:bg-white/10"
                  >
                    <div className="w-full">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 min-h-[560px] flex items-center justify-center">
                        <PreviewFrame
                          size="fluid"
                          className="mx-auto shadow-2xl max-w-[640px]"
                          state={uploadedFile.type === 'unknown'
                            ? 'empty'
                            : uploadedFile.previewState === 'error'
                              ? 'error'
                              : uploadedFile.type === 'word' && !uploadedFile.previewHtml
                                ? 'loading'
                                : 'ready'}
                        >
                          {uploadedFile.type === 'pdf' && (
                            <PreviewCanvas file={uploadedFile.file} />
                          )}
                          {uploadedFile.type === 'image' && (
                            <PreviewImage src={uploadedFile.previewUrl} />
                          )}
                          {uploadedFile.type === 'word' && uploadedFile.previewHtml && (
                            <div className="w-full h-full overflow-auto rounded-xl bg-white p-4 text-[11px] leading-snug text-gray-800 custom-scrollbar">
                              <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: uploadedFile.previewHtml }}
                              />
                            </div>
                          )}
                          {uploadedFile.type === 'word' && !uploadedFile.previewHtml && (
                            <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
                              <div className="text-xs font-medium">Loading preview...</div>
                            </div>
                          )}
                          {uploadedFile.type === 'unknown' && (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              <FileType className="w-6 h-6" />
                              <span className="text-xs">No preview</span>
                            </div>
                          )}
                        </PreviewFrame>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </Badge>
                      {typeof uploadedFile.pages === 'number' && (
                        <Badge variant="secondary" className="bg-ocean-50 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300 border border-ocean-100 dark:border-ocean-800/40">
                          {uploadedFile.pages} {uploadedFile.pages === 1 ? t('common.page') : t('common.pages')}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                        {uploadedFile.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-ocean-50/50 dark:bg-ocean-900/10 border border-ocean-100 dark:border-ocean-800/30 flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-ocean-500 rounded-full text-white shadow-lg shadow-ocean-500/30">
                    <ArrowLeft className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Select a tool to begin
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Choose a compatible tool and your files will transfer instantly.
                    </p>
                  </div>
                </div>

                {availableTools.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {availableTools.map((toolOption) => (
                      <Button
                        key={toolOption.tool}
                        variant="secondary"
                        className="rounded-xl bg-white/80 dark:bg-white/10 border border-white/40 dark:border-white/10 hover:bg-white text-gray-800 dark:text-gray-100"
                        onClick={() => handleToolLaunch(toolOption.tool, toolOption.accepts, toolOption.multi)}
                      >
                        {toolOption.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
