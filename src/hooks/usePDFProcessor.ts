import { useState, useCallback } from 'react'
import pdfService, { PDFFileInfo, PDFProcessingResult } from '../services/pdfService'

interface UsePDFProcessorState {
  isProcessing: boolean
  progress: number
  error: string | null
  result: PDFProcessingResult | null
}

export const usePDFProcessor = () => {
  const [state, setState] = useState<UsePDFProcessorState>({
    isProcessing: false,
    progress: 0,
    error: null,
    result: null
  })

  const resetState = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      error: null,
      result: null
    })
  }, [])

  const validatePDF = useCallback(async (file: File) => {
    return await pdfService.validatePDF(file)
  }, [])

  const getPDFInfo = useCallback(async (file: File): Promise<PDFFileInfo> => {
    return await pdfService.getPDFInfo(file)
  }, [])

  const mergePDFs = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      setState(prev => ({ ...prev, error: 'No files to merge' }))
      return
    }

    setState({
      isProcessing: true,
      progress: 0,
      error: null,
      result: null
    })

    try {
      const result = await pdfService.mergePDFs(
        files,
        (progress) => {
          setState(prev => ({ ...prev, progress }))
        }
      )

      setState({
        isProcessing: false,
        progress: 100,
        error: result.success ? null : result.error?.message || 'Unknown error',
        result
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to merge PDFs'
      setState({
        isProcessing: false,
        progress: 0,
        error: errorMessage,
        result: null
      })
    }
  }, [])

  const downloadResult = useCallback((filename?: string) => {
    if (state.result?.success && state.result.data) {
      const name = filename || `merged-${new Date().toISOString().split('T')[0]}.pdf`
      pdfService.downloadFile(state.result.data, name)
    }
  }, [state.result])

  return {
    // State
    isProcessing: state.isProcessing,
    progress: state.progress,
    error: state.error,
    result: state.result,
    
    // Actions
    mergePDFs,
    validatePDF,
    getPDFInfo,
    downloadResult,
    resetState,
    
    // Utilities
    formatFileSize: pdfService.formatFileSize,
    formatTime: pdfService.formatTime
  }
}