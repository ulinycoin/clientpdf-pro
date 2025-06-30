import { PDFDocument } from 'pdf-lib'

/**
 * PDF Service - Core functionality for PDF operations
 * Ultra-minimalist approach: only essential functions
 */

export interface PDFValidationResult {
  isValid: boolean
  error?: string
  validFiles: File[]
}

export interface PDFMergeResult {
  success: boolean
  error?: string
  pdfBytes?: Uint8Array
}

/**
 * Validate selected files - only PDF files allowed
 */
export const validatePDFFiles = (files: FileList | File[]): PDFValidationResult => {
  const fileArray = Array.from(files)
  
  if (fileArray.length === 0) {
    return {
      isValid: false,
      error: 'Please select at least one file',
      validFiles: []
    }
  }

  const validFiles: File[] = []
  const invalidFiles: string[] = []

  fileArray.forEach(file => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      validFiles.push(file)
    } else {
      invalidFiles.push(file.name)
    }
  })

  if (validFiles.length === 0) {
    return {
      isValid: false,
      error: 'No valid PDF files found. Please select PDF files only.',
      validFiles: []
    }
  }

  if (invalidFiles.length > 0) {
    return {
      isValid: false,
      error: `Invalid files: ${invalidFiles.join(', ')}. Only PDF files are allowed.`,
      validFiles
    }
  }

  return {
    isValid: true,
    validFiles
  }
}

/**
 * Merge multiple PDF files into one
 */
export const mergePDFFiles = async (files: File[]): Promise<PDFMergeResult> => {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: 'No files to merge'
      }
    }

    if (files.length === 1) {
      // Single file - just return it as-is
      const arrayBuffer = await files[0].arrayBuffer()
      return {
        success: true,
        pdfBytes: new Uint8Array(arrayBuffer)
      }
    }

    // Create new PDF document
    const mergedPdf = await PDFDocument.create()

    // Process each file
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        
        pages.forEach((page) => {
          mergedPdf.addPage(page)
        })
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        return {
          success: false,
          error: `Failed to process file: ${file.name}. Please check if it's a valid PDF.`
        }
      }
    }

    // Generate final PDF
    const pdfBytes = await mergedPdf.save()
    
    return {
      success: true,
      pdfBytes
    }
  } catch (error) {
    console.error('PDF merge error:', error)
    return {
      success: false,
      error: 'Failed to merge PDF files. Please try again with different files.'
    }
  }
}

/**
 * Download PDF file to user's device
 */
export const downloadPDF = (pdfBytes: Uint8Array, filename: string = 'merged.pdf'): void => {
  try {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download error:', error)
    throw new Error('Failed to download PDF file')
  }
}

/**
 * Generate filename for merged PDF
 */
export const generateMergedFilename = (files: File[]): string => {
  if (files.length === 0) return 'merged.pdf'
  if (files.length === 1) return files[0].name
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
  return `merged-${files.length}-files-${timestamp}.pdf`
}

/**
 * Get human-readable file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}