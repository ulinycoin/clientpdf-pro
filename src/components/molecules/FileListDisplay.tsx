import React from 'react';
import { File, X, FileText } from 'lucide-react';

interface FileListDisplayProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  className?: string;
}

const FileListDisplay: React.FC<FileListDisplayProps> = ({
  files,
  onRemoveFile,
  onClearAll,
  className = ''
}) => {
  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getFileCount = (count: number): string => {
    if (count === 1) return '1 file';
    return `${count} files`;
  };

  if (files.length === 0) return null;

  return (
    <div className={`pdf-processing-card rounded-2xl shadow-soft border border-white/20 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-secondary-800 flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <span>Ready to process ({getFileCount(files.length)})</span>
        </h3>
        <button
          onClick={onClearAll}
          className="text-sm text-error-500 hover:text-error-700 transition-colors font-medium px-4 py-2 rounded-xl hover:bg-error-50 border border-transparent hover:border-error-200"
        >
          Clear all
        </button>
      </div>
      
      <div className="space-y-3">
        {files.map((file, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-200 progressive-reveal"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shadow-soft">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900 leading-tight">{file.name}</p>
                <p className="text-sm text-secondary-500">
                  {formatFileSize(file.size)} • PDF document
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemoveFile(index)}
              className="p-2 text-error-600 hover:text-white hover:bg-error-600 border border-error-200 hover:border-error-600 rounded-xl transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label={`Remove file ${file.name}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Trust indicator */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-center space-x-2 text-xs text-success-600">
          <div className="w-2 h-2 bg-success-500 rounded-full pdf-status-indicator"></div>
          <span className="font-medium">Files ready for secure browser processing</span>
        </div>
      </div>
    </div>
  );
};

export default FileListDisplay;
