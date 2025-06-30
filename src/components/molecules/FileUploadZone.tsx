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

  const zoneStyle = {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    background: 'white'
  }

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        style={zoneStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6'
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db'
          e.currentTarget.style.background = 'white'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 16px',
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af'
          }}>
            📄
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              color: '#111827', 
              margin: '0 0 8px 0' 
            }}>
              Choose PDF files
            </h3>
            <p style={{ 
              color: '#6b7280',
              margin: 0,
              fontSize: '16px'
            }}>
              Drag and drop PDF files here, or click to browse
            </p>
          </div>

          <div style={{ pointerEvents: 'none' }}>
            <Button
              variant="primary"
              size="lg"
            >
              📁 Select Files
            </Button>
          </div>

          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <p style={{ margin: 0 }}>• Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB</p>
            <p style={{ margin: 0 }}>• Maximum files: {maxFiles}</p>
            <p style={{ margin: 0 }}>• Supported: PDF files only</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUploadZone
