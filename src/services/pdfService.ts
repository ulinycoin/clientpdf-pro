import { PDFDocument } from 'pdf-lib'

export interface PDFProcessingResult {
  success: boolean
  data?: Blob
  error?: string
  metadata?: {
    originalSize: number
    processedSize: number
    pageCount: number
    processingTime: number
  }
}

export interface PDFFileInfo {
  id: string
  file: File
  name: string
  size: number
  pageCount?: number
  isValid?: boolean
}

export class PDFService {
  private static instance: PDFService

  static getInstance(): PDFService {
    if (!this.instance) {
      this.instance = new PDFService()
    }
    return this.instance
  }

  /**
   * Validate if file is a valid PDF
   */
  async validatePDF(file: File): Promise<{ isValid: boolean; error?: string }> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      
      return {
        isValid: true
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid PDF file'
      }
    }
  }

  /**
   * Get PDF information (page count, etc.)
   */
  async getPDFInfo(file: File): Promise<PDFFileInfo> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      
      return {
        id: Date.now() + Math.random().toString(),
        file,
        name: file.name,
        size: file.size,
        pageCount,
        isValid: true
      }
    } catch (error) {
      return {
        id: Date.now() + Math.random().toString(),
        file,
        name: file.name,
        size: file.size,
        pageCount: 0,
        isValid: false
      }
    }
  }

  /**
   * Merge multiple PDF files into one
   */
  async mergePDFs(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<PDFProcessingResult> {
    const startTime = Date.now()
    
    try {
      // Create new PDF document
      const mergedPdf = await PDFDocument.create()
      let totalOriginalSize = 0
      let totalPages = 0

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        totalOriginalSize += file.size

        if (onProgress) {
          onProgress((i / files.length) * 80) // 80% for loading files
        }

        try {
          // Load PDF
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await PDFDocument.load(arrayBuffer)
          
          // Copy all pages
          const pageIndices = Array.from(
            { length: pdf.getPageCount() }, 
            (_, i) => i
          )
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices)
          
          // Add pages to merged document
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page)
          })

          totalPages += pdf.getPageCount()
        } catch (error) {
          console.warn(`Failed to process file ${file.name}:`, error)
          // Continue with other files instead of failing completely
        }
      }

      if (onProgress) {
        onProgress(90) // 90% for saving
      }

      // Save merged PDF
      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      if (onProgress) {
        onProgress(100)
      }

      const processingTime = Date.now() - startTime

      return {
        success: true,
        data: blob,
        metadata: {
          originalSize: totalOriginalSize,
          processedSize: blob.size,
          pageCount: totalPages,
          processingTime
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to merge PDFs'
      }
    }
  }

  /**
   * Download blob as file
   */
  downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Format processing time
   */
  formatTime(milliseconds: number): string {
    if (milliseconds < 1000) return `${milliseconds}ms`
    return `${(milliseconds / 1000).toFixed(1)}s`
  }
}

export default PDFService.getInstance()