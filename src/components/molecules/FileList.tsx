import Button from '../atoms/Button'
import Icon from '../atoms/Icon'
import ProgressBar from '../atoms/ProgressBar'

interface FileItem {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  error?: string
}

interface FileListProps {
  files: FileItem[]
  onRemoveFile: (id: string) => void
  onRetryFile?: (id: string) => void
  className?: string
}

const FileList = ({ 
  files, 
  onRemoveFile, 
  onRetryFile,
  className = '' 
}: FileListProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'completed':
        return <Icon name="check" size={20} className="text-green-600" />
      case 'error':
        return <Icon name="x" size={20} className="text-red-600" />
      case 'processing':
        return <Icon name="loading" size={20} className="text-blue-600 animate-spin" />
      default:
        return <Icon name="file-pdf" size={20} className="text-gray-600" />
    }
  }

  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'error':
        return 'red'
      case 'processing':
        return 'blue'
      default:
        return 'blue'
    }
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">
        Uploaded Files ({files.length})
      </h3>
      
      <div className="space-y-2">
        {files.map((fileItem) => (
          <div
            key={fileItem.id}
            className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            {/* File icon and status */}
            <div className="flex-shrink-0 mr-3">
              {getStatusIcon(fileItem.status)}
            </div>

            {/* File information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-sm text-gray-500 ml-2 flex-shrink-0">
                  {formatFileSize(fileItem.file.size)}
                </p>
              </div>

              {/* Progress bar or error */}
              {fileItem.status === 'processing' && fileItem.progress !== undefined && (
                <ProgressBar
                  progress={fileItem.progress}
                  size="sm"
                  color={getStatusColor(fileItem.status)}
                  showPercentage={false}
                />
              )}

              {fileItem.status === 'error' && fileItem.error && (
                <p className="text-sm text-red-600">{fileItem.error}</p>
              )}

              {fileItem.status === 'completed' && (
                <p className="text-sm text-green-600">Ready for processing</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-3">
              {fileItem.status === 'error' && onRetryFile && (
                <Button
                  onClick={() => onRetryFile(fileItem.id)}
                  variant="ghost"
                  size="sm"
                >
                  Retry
                </Button>
              )}
              
              <Button
                onClick={() => onRemoveFile(fileItem.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Icon name="x" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Overall stats */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-sm text-gray-600">
        <span>
          Ready: {files.filter(f => f.status === 'completed').length} of {files.length}
        </span>
        <span>
          Total size: {formatFileSize(files.reduce((total, f) => total + f.file.size, 0))}
        </span>
      </div>
    </div>
  )
}

export default FileList