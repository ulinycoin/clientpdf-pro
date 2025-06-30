import React, { useRef } from 'react';
import { FileUploadZoneProps } from '../../types';
import Button from '../atoms/Button';

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  accept = '.pdf,application/pdf',
  multiple = true,
  maxFiles = 10,
  maxSizeBytes = 50 * 1024 * 1024, // 50MB
  disabled = false,
  dragActive = false,
  uploading = false,
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
      onFileSelect(Array.from(files));
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  const formatMaxSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)}MB`;
  };

  const borderColor = dragActive 
    ? 'border-blue-400 bg-blue-50' 
    : 'border-gray-300 hover:border-gray-400';
  
  const isDisabled = disabled || uploading;

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${borderColor}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={isDisabled}
          className="hidden"
        />
        
        {/* Upload Icon */}
        <div className="text-6xl mb-4">
          {uploading ? '⏳' : dragActive ? '📂' : '📄'}
        </div>
        
        {/* Main Text */}
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {uploading 
            ? 'Uploading files...' 
            : dragActive 
              ? 'Drop your PDF files here' 
              : 'Choose PDF files or drag & drop'
          }
        </h3>
        
        {/* Subtitle */}
        <p className="text-gray-500 mb-6">
          {uploading
            ? 'Please wait while we process your files'
            : `Upload up to ${maxFiles} files, max ${formatMaxSize(maxSizeBytes)} each`
          }
        </p>
        
        {/* Action Button */}
        {!uploading && (
          <Button
            variant="primary"
            size="lg"
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Select Files
          </Button>
        )}
        
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