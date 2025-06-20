import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Settings, Download } from 'lucide-react'
import { usePDFLoader, usePDFPreloader, usePDFValidator } from '@/hooks/usePDFLoader'
import { PDFLoadingProgress, PDFLoadingOverlay, usePDFLoadingToast } from '@/components/ui/PDFLoadingProgress'

/**
 * Пример интеграции оптимизированной загрузки PDF
 * Демонстрирует все best practices для производительности
 */
export const OptimizedPDFProcessor: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processingMode, setProcessingMode] = useState<'merge' | 'split' | 'compress'>('merge')
  
  // Hooks для управления PDF загрузкой
  const { 
    isLoading, 
    progress, 
    error, 
    loadLibrary, 
    preloadAll, 
    resetError,
    isSupported 
  } = usePDFLoader()
  
  const { triggerPreload, cancelPreload } = usePDFPreloader()
  const { validateFiles } = usePDFValidator()
  const { showToast, ToastComponent } = usePDFLoadingToast()
  
  // Предзагрузка при hover на кнопки PDF операций
  const handlePreloadTrigger = useCallback(() => {
    if (!isLoading) {
      triggerPreload()
      showToast({
        isLoading: true,
        progress: 10,
        message: 'Preparing PDF tools...'
      })
    }
  }, [isLoading, triggerPreload, showToast])
  
  // Обработка загрузки файлов
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const fileArray = Array.from(files)
    const validation = validateFiles(fileArray)
    
    if (validation.hasErrors) {
      showToast({
        isLoading: false,
        progress: 0,
        error: validation.errors[0] || 'Invalid files'
      })
      return
    }
    
    setSelectedFiles(validation.validFiles)
    
    // Предзагружаем PDF библиотеки после успешной загрузки файлов
    if (validation.validFiles.length > 0) {
      try {
        await preloadAll()
        showToast({
          isLoading: false,
          progress: 100,
          message: 'PDF tools ready!'
        })
      } catch (error) {
        console.warn('Preload failed, will load on demand')
      }
    }
  }, [validateFiles, setSelectedFiles, preloadAll, showToast])
  
  // Обработка PDF операций
  const handlePDFOperation = useCallback(async () => {
    if (selectedFiles.length === 0) return
    
    resetError()
    
    try {
      // Загружаем нужные библиотеки в зависимости от операции
      switch (processingMode) {
        case 'merge':
          await loadLibrary('pdf-lib')
          break
        case 'split':
          await loadLibrary('pdfjs')
          break
        case 'compress':
          await loadLibrary('pdf-generator')
          break
      }
      
      // Здесь будет реальная обработка PDF
      console.log(`Processing ${selectedFiles.length} files in ${processingMode} mode`)
      
      // Симуляция обработки
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      showToast({
        isLoading: false,
        progress: 100,
        message: `${processingMode} operation completed!`
      })
      
    } catch (error) {
      console.error('PDF operation failed:', error)
      showToast({
        isLoading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Operation failed'
      })
    }
  }, [selectedFiles, processingMode, loadLibrary, resetError, showToast])
  
  if (!isSupported) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">PDF Processing Not Supported</h3>
        </div>
        <p className="text-gray-600">
          Your browser doesn't support the required features for PDF processing.
          Please use a modern browser like Chrome, Firefox, or Safari.
        </p>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Optimized PDF Processor
        </h1>
        <p className="text-gray-600">
          High-performance PDF operations with lazy loading and progress tracking
        </p>
      </div>
      
      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Processing Mode
        </label>
        <div className="flex gap-2">
          {(['merge', 'split', 'compress'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setProcessingMode(mode)}
              onMouseEnter={handlePreloadTrigger}
              onMouseLeave={cancelPreload}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                processingMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* File Upload Zone */}
      <motion.div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload PDF Files
        </h3>
        <p className="text-gray-500 mb-4">
          Drag and drop your PDF files here, or click to browse
        </p>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
        >
          <Upload className="h-4 w-4" />
          Select Files
        </label>
      </motion.div>
      
      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 mb-2">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="flex-1">{file.name}</span>
                <span className="text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Progress Display */}
      {(isLoading || error) && (
        <div className="mt-6">
          <PDFLoadingProgress
            isLoading={isLoading}
            progress={progress}
            error={error}
            variant="detailed"
            size="lg"
          />
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={handlePDFOperation}
          disabled={selectedFiles.length === 0 || isLoading}
          onMouseEnter={handlePreloadTrigger}
          onMouseLeave={cancelPreload}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Settings className="h-4 w-4" />
          Process PDF
        </button>
        
        <button
          onClick={() => setSelectedFiles([])}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Clear Files
        </button>
      </div>
      
      {/* Performance Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-12 p-4 bg-blue-50 rounded-lg"
      >
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Performance Optimizations
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Libraries loaded on-demand to reduce initial bundle size</li>
          <li>• PDF operations performed entirely in browser for privacy</li>
          <li>• Progress tracking for better user experience</li>
          <li>• Automatic preloading on user interaction</li>
          <li>• File validation before processing</li>
          <li>• Optimized chunking strategy for faster loading</li>
        </ul>
      </motion.div>
      
      {/* Loading Overlay */}
      <PDFLoadingOverlay
        isLoading={isLoading && progress > 50}
        progress={progress}
        error={error}
        title="Processing Your PDF"
        description="This may take a moment for large files..."
        allowCancel={true}
        onCancel={() => {
          // Implement cancellation logic
          console.log('Operation cancelled')
        }}
      />
      
      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  )
}

export default OptimizedPDFProcessor
