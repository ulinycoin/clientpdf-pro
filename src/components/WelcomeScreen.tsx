import React, { useState } from 'react';
import type { Tool, URLContext } from '@/types';
import { useSharedFile } from '@/hooks/useSharedFile';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image as ImageIcon, FileType, UploadCloud, X, ArrowLeft, Shield, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  context: URLContext | null; // Keep interface as is for now if needed, or remove param from destructuring
  onToolSelect: (tool: Tool) => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const { t } = useI18n();
  const { setSharedFile, setSharedFiles } = useSharedFile();
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

  const detectFileType = (file: File): 'pdf' | 'image' | 'word' | 'unknown' => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['doc', 'docx'].includes(ext || '')) return 'word';
    return 'unknown';
  };

  const getFileIcon = (type: 'pdf' | 'image' | 'word' | 'unknown') => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'word': return <FileType className="w-8 h-8 text-blue-700" />;
      default: return <FileType className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      preview: undefined,
    }));
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
    setUploadedFiles([]);
    setFilesSaved(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('upload.readyToProcess')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {t(uploadedFiles.length === 1 ? 'upload.filesReadySingle' : 'upload.filesReadyPlural', { count: uploadedFiles.length })}
                    </p>
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

              <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {uploadedFiles.map((uploadedFile, index) => (
                  <div
                    key={index}
                    className="group relative flex items-center gap-6 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:border-ocean-300 dark:hover:border-ocean-700 transition-all duration-300 hover:bg-white/80 dark:hover:bg-white/10"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-white dark:bg-black/40 shadow-sm group-hover:scale-105 transition-transform">
                      {getFileIcon(detectFileType(uploadedFile.file))}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                        {uploadedFile.file.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-500">
                          {formatFileSize(uploadedFile.file.size)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-ocean-50/50 dark:bg-ocean-900/10 border border-ocean-100 dark:border-ocean-800/30 flex items-center gap-6 animate-pulse-slow">
                <div className="p-3 bg-ocean-500 rounded-full text-white shadow-lg shadow-ocean-500/30">
                  <ArrowLeft className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Select a tool to begin
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Choose any tool from the sidebar to process your files immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
