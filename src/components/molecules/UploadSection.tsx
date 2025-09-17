import React from 'react';
import FileUploadZone from './FileUploadZone';

interface UploadSectionProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  title: string;
  subtitle: string;
  emoji?: string;
  supportedFormats?: string;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  onFilesSelected,
  accept = 'application/pdf',
  acceptedTypes = ['application/pdf'],
  multiple = false,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024,
  disabled = false,
  title,
  subtitle,
  emoji = '📄',
  supportedFormats = 'PDF'
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
      <FileUploadZone
        onFilesSelected={onFilesSelected}
        accept={accept}
        acceptedTypes={acceptedTypes}
        maxSize={maxSize}
        multiple={multiple}
        disabled={disabled}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">{emoji}</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {title}
          </h3>
          <p className="text-gray-500 mb-6">
            {subtitle}
          </p>
          <p className="text-sm text-gray-400">
            Supports {supportedFormats} up to {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      </FileUploadZone>
    </div>
  );
};

export default UploadSection;
