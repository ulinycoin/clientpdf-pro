import { useState, useEffect } from 'react'
import Button from '../atoms/Button'
import Icon from '../atoms/Icon'
import ProgressBar from '../atoms/ProgressBar'
import { usePDFProcessor } from '../../hooks/usePDFProcessor'

interface MergeToolProps {
  files: File[]
  onClose: () => void
  className?: string
}

const MergeTool = ({ files, onClose, className = '' }: MergeToolProps) => {
  const [mergeFiles, setMergeFiles] = useState<File[]>(files)
  const [mergeFilename, setMergeFilename] = useState('')
  
  const {
    isProcessing,
    progress,
    error,
    result,
    mergePDFs,
    downloadResult,
    resetState,
    formatFileSize,
    formatTime
  } = usePDFProcessor()

  useEffect(() => {
    // Generate default filename
    const timestamp = new Date().toISOString().split('T')[0]
    setMergeFilename(`merged-${timestamp}.pdf`)
  }, [])

  const handleRemoveFile = (index: number) => {
    setMergeFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleMoveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...mergeFiles]
    const [removed] = newFiles.splice(fromIndex, 1)
    newFiles.splice(toIndex, 0, removed)
    setMergeFiles(newFiles)
  }

  const handleMerge = async () => {
    if (mergeFiles.length === 0) return
    
    resetState()
    await mergePDFs(mergeFiles)
  }

  const handleDownload = () => {
    downloadResult(mergeFilename)
  }

  const canMerge = mergeFiles.length > 0 && !isProcessing
  const totalSize = mergeFiles.reduce((total, file) => total + file.size, 0)

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Icon name="merge" size={24} className="text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Merge PDFs</h2>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <Icon name="x" size={20} />
        </Button>
      </div>

      <div className="p-6">
        {/* File List */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Files to Merge ({mergeFiles.length})
          </h3>
          
          {mergeFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="file-pdf" size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No files selected for merging</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mergeFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Drag handle */}
                  <div className="cursor-move mr-3 text-gray-400">
                    <Icon name="file-pdf" size={20} />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Order controls */}
                  <div className="flex items-center space-x-1 mr-3">
                    <Button
                      onClick={() => handleMoveFile(index, Math.max(0, index - 1))}
                      variant="ghost"
                      size="sm"
                      disabled={index === 0 || isProcessing}
                      className="p-1"
                    >
                      ↑
                    </Button>
                    <Button
                      onClick={() => handleMoveFile(index, Math.min(mergeFiles.length - 1, index + 1))}
                      variant="ghost"
                      size="sm"
                      disabled={index === mergeFiles.length - 1 || isProcessing}
                      className="p-1"
                    >
                      ↓
                    </Button>
                  </div>

                  {/* Remove button */}
                  <Button
                    onClick={() => handleRemoveFile(index)}
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon name="x" size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filename input */}
        {mergeFiles.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output filename
            </label>
            <input
              type="text"
              value={mergeFilename}
              onChange={(e) => setMergeFilename(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="merged.pdf"
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="mb-6">
            <ProgressBar
              progress={progress}
              label="Merging PDFs..."
              color="blue"
              size="md"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <Icon name="x" size={20} className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {result?.success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Icon name="check" size={20} className="text-green-500 mr-2" />
              <p className="text-green-700 font-medium">PDF merged successfully!</p>
            </div>
            {result.metadata && (
              <div className="text-sm text-green-600 space-y-1">
                <p>Pages: {result.metadata.pageCount}</p>
                <p>Original size: {formatFileSize(result.metadata.originalSize)}</p>
                <p>Final size: {formatFileSize(result.metadata.processedSize)}</p>
                <p>Processing time: {formatTime(result.metadata.processingTime)}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {mergeFiles.length > 0 && (
              <span>Total size: {formatFileSize(totalSize)}</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            {result?.success ? (
              <Button
                onClick={handleDownload}
                variant="primary"
                size="md"
              >
                <Icon name="upload" size={16} className="mr-2" />
                Download PDF
              </Button>
            ) : (
              <Button
                onClick={handleMerge}
                variant="primary"
                size="md"
                disabled={!canMerge}
              >
                {isProcessing ? (
                  <>
                    <Icon name="loading" size={16} className="mr-2 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Icon name="merge" size={16} className="mr-2" />
                    Merge PDFs
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MergeTool