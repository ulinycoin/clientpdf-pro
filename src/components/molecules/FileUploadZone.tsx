import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertCircle } from 'lucide-react'
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
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Create FileList-like object
      const fileList = {
        ...acceptedFiles,
        length: acceptedFiles.length,
      } as FileList
      
      onFilesSelected(fileList)
    }
  }, [onFilesSelected])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
  })

  const hasErrors = fileRejections.length > 0

  return (
    <div className={`relative ${className}`}>
      <motion.div
        {...getRootProps()}
        className={`
          upload-zone cursor-pointer
          ${isDragActive && !isDragReject ? 'upload-zone-active' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${hasErrors ? 'border-red-300' : ''}
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 1 }}
          animate={{ 
            scale: isDragActive ? 1.1 : 1,
            rotate: isDragActive ? 5 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          {isDragReject ? (
            <AlertCircle className="w-16 h-16 mx-auto text-red-400" />
          ) : (
            <Upload className="w-16 h-16 mx-auto text-gray-400" />
          )}
        </motion.div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive 
                ? isDragReject 
                  ? 'Invalid file type!' 
                  : 'Drop files here...'
                : 'Choose PDF files'
              }
            </h3>
            <p className="text-gray-600">
              {isDragActive 
                ? isDragReject
                  ? 'Only PDF files are allowed'
                  : 'Release to upload'
                : 'Drag and drop PDF files here, or click to browse'
              }
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="pointer-events-none"
          >
            <FileText className="w-5 h-5 mr-2" />
            Select Files
          </Button>

          <div className="text-sm text-gray-500 space-y-1">
            <p>• Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB</p>
            <p>• Maximum files: {maxFiles}</p>
            <p>• Supported: PDF files only</p>
          </div>
        </div>
      </motion.div>

      {/* Error Messages */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">
                  Some files were rejected:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {fileRejections.map(({ file, errors }, index) => (
                    <li key={index}>
                      <span className="font-medium">{file.name}:</span>{' '}
                      {errors.map(error => error.message).join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUploadZone
