import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatFileSize,
  generateFilename,
  generateFileId,
  getFileExtension,
  isPDF,
  isImage,
  isWordDocument,
  getTotalFileSize,
  sortFiles,
  removeDuplicateFiles,
  validateFile,
} from './fileHelpers'

// Mock File constructor for tests
class MockFile extends File {
  constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
    super(parts, name, options)
  }
}

// Mock global File if not available
if (typeof global.File === 'undefined') {
  global.File = MockFile as any
}

describe('File Helpers', () => {
  describe('formatFileSize', () => {
    it('formats zero bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('formats bytes in binary units by default', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
    })

    it('formats bytes in decimal units when specified', () => {
      expect(formatFileSize(1000, { units: 'decimal' })).toBe('1.0 kB')
      expect(formatFileSize(1000 * 1000, { units: 'decimal' })).toBe('1.0 MB')
    })

    it('respects precision option', () => {
      expect(formatFileSize(1536, { precision: 2 })).toBe('1.50 KB')
      expect(formatFileSize(1536, { precision: 0 })).toBe('2 KB')
    })
  })

  describe('generateFilename', () => {
    it('generates filename with suffix', () => {
      expect(generateFilename('document.pdf', 'compressed'))
        .toBe('document_compressed.pdf')
    })

    it('uses custom extension when provided', () => {
      expect(generateFilename('document.pdf', 'converted', 'docx'))
        .toBe('document_converted.docx')
    })

    it('sanitizes invalid characters', () => {
      expect(generateFilename('doc<>ument.pdf', 'suf:fix'))
        .toBe('doc__ument_suf_fix.pdf')
    })

    it('replaces spaces with underscores', () => {
      expect(generateFilename('my document.pdf', 'new version'))
        .toBe('my_document_new_version.pdf')
    })

    it('handles files without extension', () => {
      expect(generateFilename('document', 'suffix'))
        .toBe('document_suffix.pdf')
    })

    it('limits filename length', () => {
      const longName = 'a'.repeat(100) + '.pdf'
      const result = generateFilename(longName, 'suffix')
      expect(result.length).toBeLessThan(70) // 50 + suffix + extension
    })
  })

  describe('generateFileId', () => {
    it('generates unique IDs', () => {
      const id1 = generateFileId()
      const id2 = generateFileId()

      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(10)
    })

    it('includes timestamp and random component', () => {
      const id = generateFileId()
      expect(id).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('getFileExtension', () => {
    it('extracts extension from filename', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('image.JPG')).toBe('jpg')
    })

    it('falls back to MIME type when no extension', () => {
      expect(getFileExtension('document', 'application/pdf')).toBe('pdf')
      expect(getFileExtension('image', 'image/jpeg')).toBe('jpg')
    })

    it('returns bin for unknown types', () => {
      expect(getFileExtension('file')).toBe('bin')
      expect(getFileExtension('file', 'unknown/type')).toBe('bin')
    })
  })

  describe('isPDF', () => {
    it('identifies PDF files by MIME type', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' })
      expect(isPDF(pdfFile)).toBe(true)
    })

    it('identifies PDF files by extension', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/octet-stream' })
      expect(isPDF(pdfFile)).toBe(true)
    })

    it('rejects non-PDF files', () => {
      const txtFile = new File([''], 'test.txt', { type: 'text/plain' })
      expect(isPDF(txtFile)).toBe(false)
    })
  })

  describe('isImage', () => {
    it('identifies image files by MIME type', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      expect(isImage(imageFile)).toBe(true)
    })

    it('identifies image files by extension', () => {
      const imageFile = new File([''], 'test.png', { type: 'application/octet-stream' })
      expect(isImage(imageFile)).toBe(true)
    })

    it('rejects non-image files', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' })
      expect(isImage(pdfFile)).toBe(false)
    })
  })

  describe('isWordDocument', () => {
    it('identifies Word files by MIME type', () => {
      const docFile = new File([''], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      expect(isWordDocument(docFile)).toBe(true)
    })

    it('identifies Word files by extension', () => {
      const docFile = new File([''], 'test.doc', { type: 'application/octet-stream' })
      expect(isWordDocument(docFile)).toBe(true)
    })

    it('rejects non-Word files', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' })
      expect(isWordDocument(pdfFile)).toBe(false)
    })
  })

  describe('getTotalFileSize', () => {
    it('calculates total size of multiple files', () => {
      const files = [
        new File(['a'.repeat(100)], 'file1.pdf'),
        new File(['b'.repeat(200)], 'file2.pdf'),
        new File(['c'.repeat(300)], 'file3.pdf'),
      ]

      expect(getTotalFileSize(files)).toBe(600)
    })

    it('returns 0 for empty array', () => {
      expect(getTotalFileSize([])).toBe(0)
    })
  })

  describe('sortFiles', () => {
    let files: File[]

    beforeEach(() => {
      files = [
        new File(['c'.repeat(300)], 'charlie.pdf', { lastModified: 3000 }),
        new File(['a'.repeat(100)], 'alpha.pdf', { lastModified: 1000 }),
        new File(['b'.repeat(200)], 'beta.pdf', { lastModified: 2000 }),
      ]
    })

    it('sorts by name ascending by default', () => {
      const sorted = sortFiles(files)
      expect(sorted.map(f => f.name)).toEqual(['alpha.pdf', 'beta.pdf', 'charlie.pdf'])
    })

    it('sorts by name descending', () => {
      const sorted = sortFiles(files, 'name', false)
      expect(sorted.map(f => f.name)).toEqual(['charlie.pdf', 'beta.pdf', 'alpha.pdf'])
    })

    it('sorts by size', () => {
      const sorted = sortFiles(files, 'size')
      expect(sorted.map(f => f.size)).toEqual([100, 200, 300])
    })

    it('sorts by date', () => {
      const sorted = sortFiles(files, 'date')
      expect(sorted.map(f => f.lastModified)).toEqual([1000, 2000, 3000])
    })
  })

  describe('removeDuplicateFiles', () => {
    it('removes files with same name and size', () => {
      const files = [
        new File(['content'], 'file1.pdf'),
        new File(['content'], 'file2.pdf'),
        new File(['content'], 'file1.pdf'), // duplicate
        new File(['different'], 'file1.pdf'), // different size, keep
      ]

      const unique = removeDuplicateFiles(files)
      expect(unique).toHaveLength(3)
      expect(unique.map(f => f.name)).toEqual(['file1.pdf', 'file2.pdf', 'file1.pdf'])
    })

    it('keeps all files if no duplicates', () => {
      const files = [
        new File(['a'], 'file1.pdf'),
        new File(['b'], 'file2.pdf'),
        new File(['c'], 'file3.pdf'),
      ]

      const unique = removeDuplicateFiles(files)
      expect(unique).toHaveLength(3)
    })
  })

  describe('validateFile', () => {
    it('validates correct file type (non-PDF)', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(imageFile, ['image/jpeg'])
      expect(result.isValid).toBe(true)
    })

    it('rejects incorrect file type', () => {
      const txtFile = new File([''], 'test.txt', { type: 'text/plain' })
      const result = validateFile(txtFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not supported')
    })

    it('rejects oversized files', () => {
      const largeFile = new File(['x'.repeat(1000)], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(largeFile, ['image/jpeg'], 100) // 100 bytes limit
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('exceeds maximum')
    })

    it('accepts files within size limit (non-PDF)', () => {
      const smallFile = new File(['small'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(smallFile, ['image/jpeg'], 100)
      expect(result.isValid).toBe(true)
    })
  })
})
