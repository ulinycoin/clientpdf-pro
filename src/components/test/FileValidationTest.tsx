import React from 'react';
import { FileUploadZone } from '../molecules';

const FileValidationTest: React.FC = () => {
  const handleFileSelect = (files: File[]) => {
    console.log('Selected files:', files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      extension: '.' + f.name.split('.').pop()?.toLowerCase()
    })));
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">File Validation Test</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Word Documents (.docx, .doc)</h3>
        <FileUploadZone
          onFilesSelected={handleFileSelect}
          acceptedTypes={[
            '.docx',
            '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
          ]}
          maxFiles={1}
          maxSize={50 * 1024 * 1024}
          className="border-2 border-dashed border-blue-300"
        >
          <div className="text-center py-8">
            <p>Drop Word documents here or click to browse</p>
            <p className="text-sm text-gray-500">Supported: .docx, .doc</p>
          </div>
        </FileUploadZone>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">PDF Documents (application/pdf)</h3>
        <FileUploadZone
          onFilesSelected={handleFileSelect}
          acceptedTypes={['application/pdf', '.pdf']}
          maxFiles={5}
          className="border-2 border-dashed border-red-300"
        >
          <div className="text-center py-8">
            <p>Drop PDF documents here or click to browse</p>
            <p className="text-sm text-gray-500">Supported: .pdf files</p>
          </div>
        </FileUploadZone>
      </div>
    </div>
  );
};

export default FileValidationTest;
