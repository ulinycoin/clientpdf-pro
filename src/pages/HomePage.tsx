import { useState } from 'react'
import Header from '../components/organisms/Header'
import FileUploadZone from '../components/molecules/FileUploadZone'
import FileList from '../components/molecules/FileList'
import ToolsGrid from '../components/organisms/ToolsGrid'
import MergeTool from '../components/organisms/MergeTool'

interface FileItem {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  error?: string
}

const HomePage = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const handleFileSelect = (selectedFiles: File[]) => {
    const newFiles: FileItem[] = selectedFiles.map(file => ({
      id: Date.now() + Math.random().toString(),
      file,
      status: 'pending' as const
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Simulate file processing
    newFiles.forEach(fileItem => {
      simulateFileProcessing(fileItem.id)
    })
  }

  const simulateFileProcessing = (fileId: string) => {
    // Start processing
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'processing' as const, progress: 0 } : f
    ))

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5 // Random progress from 5 to 20%
      
      if (progress >= 100) {
        clearInterval(interval)
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed' as const, progress: 100 } : f
        ))
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ))
      }
    }, 200)
  }

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleRetryFile = (fileId: string) => {
    simulateFileProcessing(fileId)
  }

  const handleToolSelect = (toolId: string) => {
    const completedFiles = files.filter(f => f.status === 'completed')
    
    if (completedFiles.length === 0) {
      alert('Please upload some PDF files first!')
      return
    }

    // Open the tool
    setSelectedTool(toolId)
  }

  const handleCloseTool = () => {
    setSelectedTool(null)
  }

  const completedFiles = files.filter(f => f.status === 'completed').map(f => f.file)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Free PDF Tools
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Convert, merge, split and compress PDFs - all locally in your browser
            </p>
            <p className="text-sm text-gray-500">
              🔒 Your files never leave your device • 🚀 Fast processing • 💯 Completely free
            </p>
          </div>

          {/* File Upload Zone */}
          <div className="mb-8">
            <FileUploadZone
              onFileSelect={handleFileSelect}
              maxFiles={10}
              maxSizeBytes={50 * 1024 * 1024} // 50MB
              className="mb-6"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-8">
              <FileList
                files={files}
                onRemoveFile={handleRemoveFile}
                onRetryFile={handleRetryFile}
              />
            </div>
          )}
        </div>

        {/* Selected Tool */}
        {selectedTool && (
          <div className="max-w-4xl mx-auto px-4 mb-16">
            {selectedTool === 'merge' && (
              <MergeTool
                files={completedFiles}
                onClose={handleCloseTool}
              />
            )}
            {/* Add other tools here when implemented */}
          </div>
        )}

        {/* Tools Section */}
        {!selectedTool && (
          <div className="max-w-7xl mx-auto px-4 pb-16">
            <ToolsGrid onToolSelect={handleToolSelect} />
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage