import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Button from '../atoms/Button'
import Icon from '../atoms/Icon'

interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSizeBytes?: number
  className?: string
  disabled?: boolean
}

const FileUploadZone = ({
  onFileSelect,
  acceptedTypes = ['.pdf'],
  maxFiles = 10,
  maxSizeBytes = 50 * 1024 * 1024, // 50MB default
  className = '',
  disabled = false
}: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = (files: File[]): { valid: File[], errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files at once`)
      return { valid, errors }
    }

    files.forEach(file => {
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!acceptedTypes.includes(fileExtension)) {
        errors.push(`${file.name}: unsupported file type`)
        return
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024))
        errors.push(`${file.name}: file too large (max ${maxSizeMB}MB)`)
        return
      }

      // Check if it's actually a PDF
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: not a valid PDF file`)
        return
      }

      valid.push(file)
    })

    return { valid, errors }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const { valid, errors } = validateFiles(fileArray)

    if (errors.length > 0) {
      setError(errors.join(', '))
      setTimeout(() => setError(null), 5000)
    }

    if (valid.length > 0) {
      setError(null)
      onFileSelect(valid)
    }
  }

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    handleFiles(files)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Clear input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const formatFileTypes = () => {
    return acceptedTypes.join(', ').toUpperCase()
  }

  const formatMaxSize = () => {
    const sizeMB = Math.round(maxSizeBytes / (1024 * 1024))
    return `${sizeMB}MB`
  }

  const baseClasses = `
    relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-400'}
    ${isDragging && !disabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
    ${error ? 'border-red-400 bg-red-50' : ''}
  `

  return (
    <div className={`${baseClasses} ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className="h-full w-full"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Icon */}
          <div className={`p-4 rounded-full ${error ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Icon 
              name={error ? 'x' : 'upload'} 
              size={32} 
              className={error ? 'text-red-500' : 'text-blue-500'} 
            />
          </div>

          {/* Main text */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isDragging && !disabled
                ? 'Drop files here'
                : error
                ? 'Upload failed'
                : 'Upload PDF files'
              }
            </h3>
            
            {!error && (
              <p className="text-sm text-gray-600">
                Drag and drop files here or{' '}
                <span className="text-blue-600 font-medium">click to browse</span>
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Upload button */}
          {!isDragging && !error && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                openFileDialog()
              }}
              variant="primary"
              size="md"
              disabled={disabled}
            >
              Choose Files
            </Button>
          )}

          {/* Additional info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Supported formats: {formatFileTypes()}</p>
            <p>Maximum size: {formatMaxSize()} per file</p>
            {maxFiles > 1 && <p>Up to {maxFiles} files at once</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUploadZone