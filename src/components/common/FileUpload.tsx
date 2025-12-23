import React, { useRef, useState } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { UploadCloud, Lightbulb, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf',
  multiple = true,
  onFilesSelected,
  maxFiles,
  maxSizeMB = 100,
  disabled = false,
  title,
  description,
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): File[] | null => {
    setError(null);

    // Check file count
    if (maxFiles && files.length > maxFiles) {
      setError(t('upload.errors.tooManyFiles').replace('{max}', maxFiles.toString()));
      return null;
    }

    // Check file types (by extension and MIME type)
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const invalidFiles = files.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();

      // Check if file matches by extension or MIME type
      const matchesExtension = acceptedTypes.includes(fileExtension);
      const matchesMimeType = acceptedTypes.some(type => {
        // Handle MIME types like "image/jpeg"
        if (type.includes('/')) {
          return mimeType === type;
        }
        return false;
      });

      return !matchesExtension && !matchesMimeType;
    });

    if (invalidFiles.length > 0) {
      setError(t('upload.errors.invalidFileType'));
      return null;
    }

    // Check file sizes
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);

    if (oversizedFiles.length > 0) {
      setError(t('upload.errors.fileTooLarge').replace('{max}', maxSizeMB.toString()));
      return null;
    }

    return files;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const validatedFiles = validateFiles(filesArray);

    if (validatedFiles) {
      onFilesSelected(validatedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      handleFiles(dataTransfer.files);
    }
  };

  return (
    <div className="file-upload w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        onClick={handleClick}
        tabIndex={0}
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
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          aria-label={t('upload.selectFiles')}
        />

        <div className="group relative z-10 flex flex-col items-center justify-center space-y-8 p-12">
          {/* Upload icon */}
          <div className={`p-8 rounded-[2rem] bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 transition-all duration-500 shadow-xl ${isDragging ? 'scale-110 shadow-2xl rotate-3' : 'group-hover:scale-105 group-hover:-rotate-3'}`}>
            {isDragging ? (
              <UploadCloud className="w-24 h-24 text-accent-blue animate-bounce" />
            ) : (
              <UploadCloud className="w-24 h-24 text-gray-600 dark:text-gray-400" />
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {isDragging ? t('upload.dropHere') : (title || t('upload.selectFiles'))}
            </h3>

            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
              {description || t('upload.dragOrClick')}
            </p>

            <div className="pt-4 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 shadow-sm text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-white/5">
                <Lightbulb className="w-3.5 h-3.5 text-accent-blue" />
                {t('upload.pasteHint')}
              </span>
            </div>
          </div>

          {/* File requirements */}
          <div className="text-xs text-gray-400 dark:text-gray-500 pt-4 flex gap-4 border-t border-white/10">
            {maxFiles && (
              <p>{t('upload.maxFiles')}: {maxFiles}</p>
            )}
            <p>{t('upload.maxSize')}: {maxSizeMB} MB</p>
            <p className="hidden md:block">{t('upload.acceptedTypes')}: {accept}</p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 max-w-5xl mx-auto p-4 bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300 animate-slide-up">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
