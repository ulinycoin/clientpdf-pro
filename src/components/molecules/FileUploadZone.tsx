import React, { useRef } from 'react';
import { FileUploadZoneProps } from '../../types';
import Button from '../atoms/Button';

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  accept = 'application/pdf',
  multiple = true,
  maxSize = 50 * 1024 * 1024, // 50MB
  disabled = false,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }
  };

  const formatMaxSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)}MB`;
  };

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 border-gray-300 hover:border-gray-400
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
        
        {/* Upload Icon */}
        <div className="text-6xl mb-4">
          📄
        </div>
        
        {/* Main Text */}
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Choose PDF files or drag & drop
        </h3>
        
        {/* Subtitle */}
        <p className="text-gray-500 mb-6">
          Upload PDF files, max {formatMaxSize(maxSize)} each
        </p>
        
        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          disabled={disabled}
          onClick={(e) => {
            e?.stopPropagation();
            handleClick();
          }}
        >
          Select Files
        </Button>
        
        {/* Features */}
        <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="mr-1">🔒</span>
            <span>100% Private</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">⚡</span>
            <span>Fast Processing</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">💯</span>
            <span>Free Forever</span>
          </div>
        </div>
      </div>
      
      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Supported format: PDF • 
          Files are processed locally in your browser • 
          No data is sent to our servers
        </p>
      </div>
    </div>
  );
};

export default FileUploadZone;