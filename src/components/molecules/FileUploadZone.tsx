import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../atoms/Button';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  className?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  className,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');

    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        if (file.errors[0]?.code === 'file-too-large') {
          return `${file.file.name}: File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`;
        }
        if (file.errors[0]?.code === 'file-invalid-type') {
          return `${file.file.name}: Invalid file type`;
        }
        return `${file.file.name}: Upload error`;
      });
      setError(errors.join(', '));
      return;
    }

    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file: file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
    }));

    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesSelected(updatedFiles.map(item => item.file));
  }, [uploadedFiles, maxFiles, maxSize, onFilesSelected]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = uploadedFiles.filter(item => {
      if (item.id === fileId && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return item.id !== fileId;
    });
    setUploadedFiles(updatedFiles);
    onFilesSelected(updatedFiles.map(item => item.file));
  }, [uploadedFiles, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    },
    maxSize,
    maxFiles,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (filename: string) => {
    if (!filename) return '📄';
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'webp':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer',
          'hover:border-blue-400 hover:bg-blue-50',
          isDragActive && !isDragReject && 'border-blue-500 bg-blue-50',
          isDragReject && 'border-red-500 bg-red-50',
          !isDragActive && 'border-gray-300'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <Upload 
            className={clsx(
              'h-12 w-12 mb-4 transition-colors',
              isDragActive && !isDragReject ? 'text-blue-500' : 'text-gray-400',
              isDragReject && 'text-red-500'
            )} 
          />
          
          {isDragActive ? (
            isDragReject ? (
              <p className="text-red-600 font-medium">
                Some files are not supported
              </p>
            ) : (
              <p className="text-blue-600 font-medium">
                Drop files here...
              </p>
            )
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Files
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop PDF or image files here, or click to browse
              </p>
              <Button variant="primary" icon={Upload}>
                Choose Files
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                Supports: PDF, Images (PNG, JPG, etc.) • Max {Math.round(maxSize / 1024 / 1024)}MB per file
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {uploadedFiles.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <span className="text-2xl mr-3 flex-shrink-0">
                    {getFileTypeIcon(item.file.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => removeFile(item.id)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};