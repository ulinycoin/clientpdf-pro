import React, { useRef, useState } from 'react';
import { useI18n } from '@/hooks/useI18n';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf',
  multiple = true,
  onFilesSelected,
  maxFiles,
  maxSizeMB = 100,
  disabled = false,
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
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 outline-none
          ${isDragging
            ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
            : 'border-gray-300 dark:border-privacy-600 hover:border-ocean-400 dark:hover:border-ocean-600'
          }
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : ''
          }
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

        <div className="flex flex-col items-center gap-4">
          {/* Upload icon */}
          <div className="text-6xl">
            {isDragging ? '📥' : '📄'}
          </div>

          {/* Upload text */}
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {isDragging
                ? t('upload.dropHere')
                : t('upload.dragOrClick')
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {multiple
                ? t('upload.multipleFilesAllowed')
                : t('upload.singleFileAllowed')
              }
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
              <span>💡</span>
              <span>{t('upload.pasteHint')}</span>
            </p>
          </div>

          {/* File requirements */}
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {maxFiles && (
              <p>{t('upload.maxFiles')}: {maxFiles}</p>
            )}
            <p>{t('upload.maxSize')}: {maxSizeMB} MB</p>
            <p>{t('upload.acceptedTypes')}: {accept}</p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
          <p className="text-sm text-error-700 dark:text-error-400">
            ⚠️ {error}
          </p>
        </div>
      )}
    </div>
  );
};
