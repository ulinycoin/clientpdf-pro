import React, { useState } from 'react';
import type { Tool, URLContext } from '@/types';
import { useSharedFile } from '@/hooks/useSharedFile';

interface WelcomeScreenProps {
  context: URLContext | null;
  onToolSelect: (tool: Tool) => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ context }) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
      <div className="container-responsive max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient-ocean">
            Secure and Fast PDF Processing
          </h1>
        </div>

        {/* First time banner */}
        {context?.isFirstVisit && uploadedFiles.length === 0 && (
          <div className="card p-6 mb-8 bg-ocean-50 dark:bg-ocean-900/20 border-ocean-200 dark:border-ocean-800 animate-slide-down">
            <p className="text-center text-ocean-700 dark:text-ocean-300 mb-3">
              Welcome! All processing happens in your browser - your files never leave your device.
            </p>
            <div className="text-center">
              <a
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 font-medium transition-colors"
              >
                <span>📝</span>
                <span>Learn PDF tips & tricks in our Blog</span>
                <span>→</span>
              </a>
            </div>
          </div>
        )}

        {/* Blog CTA for non-first visitors */}
        {!context?.isFirstVisit && uploadedFiles.length === 0 && (
          <div className="card p-4 mb-8 bg-gradient-to-r from-ocean-50 to-blue-50 dark:from-ocean-900/20 dark:to-blue-900/20 border-ocean-200 dark:border-ocean-800 animate-fade-in">
            <div className="flex items-center justify-center gap-3 text-center">
              <span className="text-2xl">💡</span>
              <a
                href="/blog"
                className="text-sm text-ocean-700 dark:text-ocean-300 hover:text-ocean-800 dark:hover:text-ocean-200 font-medium transition-colors"
              >
                Check out our Blog for PDF tips, tutorials & best practices
              </a>
              <span className="text-ocean-600 dark:text-ocean-400">→</span>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        {uploadedFiles.length === 0 ? (
          <div className="animate-fade-in">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-200 outline-none
                ${isDragging
                  ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20 scale-105'
                  : 'border-gray-300 dark:border-privacy-600 hover:border-ocean-400 dark:hover:border-ocean-600'
                }
              `}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl">
                  {isDragging ? '📥' : '📄'}
                </div>

                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {isDragging ? 'Drop your files here' : 'Upload your files'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Drag & drop or click to select
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Supports: PDF, Images (JPG, PNG), Word documents
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* File Preview */
          <div className="animate-fade-in">
            {/* Uploaded Files Preview */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Files ({uploadedFiles.length})
                </h3>
                <button
                  onClick={clearFiles}
                  className="text-sm text-gray-500 hover:text-error-600 dark:hover:text-error-400 transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {uploadedFiles.map((uploadedFile, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-privacy-800 rounded-lg border border-gray-200 dark:border-privacy-700"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-ocean-100 dark:bg-ocean-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">
                        {detectFileType(uploadedFile.file) === 'pdf' ? '📄' :
                         detectFileType(uploadedFile.file) === 'image' ? '🖼️' : '📝'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instruction */}
              <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-lg font-semibold text-ocean-700 dark:text-ocean-300 mb-2">
                  Select a tool from the sidebar
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your file is ready to be processed with any tool you choose
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Blog link */}
        <div className="mt-12 text-center animate-fade-in">
          <div className="inline-flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a
              href="/blog"
              className="hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors font-medium"
            >
              📝 Blog
            </a>
            <a
              href="/about"
              className="hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors"
            >
              About
            </a>
            <a
              href="/privacy"
              className="hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
