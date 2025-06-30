import React from 'react';
import { FileListProps } from '../../types';

const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onRetryFile,
  showProgress = true,
  allowReorder = false,
  className = ''
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Uploaded Files ({files.length})
      </h3>
      
      {files.map((fileItem, index) => (
        <div
          key={fileItem.id}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            {/* File Info */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="text-2xl">
                {getStatusIcon(fileItem.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <span className={`text-xs font-medium ${getStatusColor(fileItem.status)}`}>
                    {fileItem.status.charAt(0).toUpperCase() + fileItem.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileItem.file.size)} • {fileItem.file.type}
                </p>
                
                {fileItem.error && (
                  <p className="text-xs text-red-600 mt-1">
                    {fileItem.error}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {showProgress && fileItem.status === 'processing' && fileItem.progress !== undefined && (
              <div className="w-24 mr-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${fileItem.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {Math.round(fileItem.progress)}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {fileItem.status === 'error' && (
                <button
                  onClick={() => onRetryFile(fileItem.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Retry
                </button>
              )}
              
              <button
                onClick={() => onRemoveFile(fileItem.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;