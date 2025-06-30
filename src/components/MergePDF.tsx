import React, { useState } from 'react'
import { 
  validatePDFFiles, 
  mergePDFFiles, 
  downloadPDF, 
  generateMergedFilename,
  formatFileSize,
  PDFValidationResult 
} from '../services/pdfService'

interface MergePDFProps {
  files: FileList | null
  onClose: () => void
}

type ProcessingState = 'idle' | 'validating' | 'merging' | 'downloading' | 'success' | 'error'

const MergePDF: React.FC<MergePDFProps> = ({ files, onClose }) => {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [validationResult, setValidationResult] = useState<PDFValidationResult | null>(null)
  const [mergedFileSize, setMergedFileSize] = useState<number>(0)

  // Validate files on component mount
  React.useEffect(() => {
    if (files) {
      setProcessingState('validating')
      const result = validatePDFFiles(files)
      setValidationResult(result)
      
      if (!result.isValid) {
        setErrorMessage(result.error || 'Invalid files')
        setProcessingState('error')
      } else {
        setProcessingState('idle')
        setErrorMessage('')
      }
    }
  }, [files])

  const handleMergePDF = async () => {
    if (!validationResult?.validFiles.length) {
      setErrorMessage('No valid files to merge')
      setProcessingState('error')
      return
    }

    try {
      setProcessingState('merging')
      setErrorMessage('')

      const result = await mergePDFFiles(validationResult.validFiles)
      
      if (!result.success || !result.pdfBytes) {
        setErrorMessage(result.error || 'Failed to merge PDF files')
        setProcessingState('error')
        return
      }

      setProcessingState('downloading')
      setMergedFileSize(result.pdfBytes.length)
      
      const filename = generateMergedFilename(validationResult.validFiles)
      downloadPDF(result.pdfBytes, filename)
      
      setProcessingState('success')
    } catch (error) {
      console.error('Merge error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setProcessingState('error')
    }
  }

  const getProcessingMessage = (): string => {
    switch (processingState) {
      case 'validating': return 'Validating files...'
      case 'merging': return 'Merging PDF files...'
      case 'downloading': return 'Preparing download...'
      case 'success': return 'PDF merged successfully!'
      default: return ''
    }
  }

  const isProcessing = ['validating', 'merging', 'downloading'].includes(processingState)
  const canMerge = processingState === 'idle' && validationResult?.isValid

  return (
    <div className="merge-pdf-container">
      <div className="merge-pdf-header">
        <h2 className="text-xl mb-8">🔗 Merge PDF Files</h2>
        <button 
          onClick={onClose}
          className="btn btn-secondary text-sm"
          style={{ padding: '8px 16px' }}
        >
          Back
        </button>
      </div>

      {/* File List */}
      {validationResult?.validFiles && (
        <div className="file-list mb-24">
          <h3 className="text-base mb-16">Selected Files ({validationResult.validFiles.length}):</h3>
          <div className="file-items">
            {validationResult.validFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <span className="file-name text-sm">{file.name}</span>
                  <span className="file-size text-sm" style={{ color: '#6B7280' }}>
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <span className="file-status text-sm" style={{ color: '#059669' }}>✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="processing-state mb-24">
          <div className="processing-message text-base mb-16">
            {getProcessingMessage()}
          </div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      )}

      {/* Success State */}
      {processingState === 'success' && (
        <div className="success-state mb-24">
          <div className="success-message text-base mb-16" style={{ color: '#059669' }}>
            ✅ PDF merged successfully!
          </div>
          <div className="success-details text-sm" style={{ color: '#6B7280' }}>
            Final size: {formatFileSize(mergedFileSize)}
          </div>
        </div>
      )}

      {/* Error State */}
      {processingState === 'error' && errorMessage && (
        <div className="error-state mb-24">
          <div className="error-message text-base" style={{ color: '#DC2626' }}>
            ❌ {errorMessage}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="merge-actions">
        {canMerge && (
          <button 
            onClick={handleMergePDF}
            className="btn btn-primary"
            disabled={isProcessing}
          >
            Merge {validationResult.validFiles.length} PDF{validationResult.validFiles.length > 1 ? 's' : ''}
          </button>
        )}
        
        {processingState === 'success' && (
          <button 
            onClick={onClose}
            className="btn btn-primary"
          >
            Merge More Files
          </button>
        )}
      </div>
    </div>
  )
}

export default MergePDF