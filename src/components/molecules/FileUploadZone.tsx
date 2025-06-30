import React from 'react'
import Button from '../atoms/Button'

interface FileUploadZoneProps {
  onFilesSelected: (files: FileList) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  className?: string
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  accept = { 'application/pdf': ['.pdf'] },
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  multiple = true,
  className = '',
}) => {
  const handleClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = Object.keys(accept).join(',')
    input.multiple = multiple
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        onFilesSelected(target.files)
      }
    }
    input.click()
  }

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
      >
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto text-gray-400 mb-4">
            📄
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Choose PDF files
            </h3>
            <p className="text-gray-600">
              Drag and drop PDF files here, or click to browse
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="pointer-events-none"
          >
            📁 Select Files
          </Button>

          <div className="text-sm text-gray-500 space-y-1">
            <p>• Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB</p>
            <p>• Maximum files: {maxFiles}</p>
            <p>• Supported: PDF files only</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUploadZone
