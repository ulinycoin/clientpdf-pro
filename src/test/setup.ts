import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Global test cleanup
afterEach(() => {
  cleanup()
})

// Mock browser APIs that might not be available in test environment
Object.defineProperty(window, 'URL', {
  writable: true,
  value: {
    createObjectURL: vi.fn().mockImplementation(() => 'mocked-url'),
    revokeObjectURL: vi.fn(),
  },
})

Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: class MockFileReader {
    result: any = null
    error: any = null
    readyState = 0
    EMPTY = 0
    LOADING = 1
    DONE = 2
    onload: ((event: any) => void) | null = null
    onerror: ((event: any) => void) | null = null

    readAsArrayBuffer = vi.fn().mockImplementation((file?: File) => {
      setTimeout(() => {
        // Mock PDF header for test files
        const mockBuffer = new ArrayBuffer(4)
        const mockView = new Uint8Array(mockBuffer)

        // Always return PDF signature for simplicity in tests
        mockView[0] = 37  // %
        mockView[1] = 80  // P
        mockView[2] = 68  // D
        mockView[3] = 70  // F

        this.result = mockBuffer
        this.readyState = this.DONE
        if (this.onload) {
          this.onload({ target: this })
        }
      }, 10) // Small delay to simulate async behavior
    })

    readAsText = vi.fn()
    readAsDataURL = vi.fn()
    addEventListener = vi.fn()
    removeEventListener = vi.fn()
  },
})

// Mock PDF-lib for tests
vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn().mockResolvedValue({
      addPage: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array()),
      copyPages: vi.fn().mockResolvedValue([]),
      getPages: vi.fn().mockReturnValue([]),
      getPageCount: vi.fn().mockReturnValue(1),
    }),
    load: vi.fn().mockResolvedValue({
      getPages: vi.fn().mockReturnValue([{}]),
      getPageIndices: vi.fn().mockReturnValue([0]),
      save: vi.fn().mockResolvedValue(new Uint8Array()),
    }),
  },
  rgb: vi.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
  degrees: vi.fn().mockImplementation(angle => angle),
}))

// Mock jsPDF for tests
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue(''),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    getTextWidth: vi.fn().mockReturnValue(100),
    internal: {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(595),
        getHeight: vi.fn().mockReturnValue(842),
      },
    },
  })),
}))

// Mock Tesseract.js for OCR tests
vi.mock('tesseract.js', () => ({
  recognize: vi.fn().mockResolvedValue({
    data: {
      text: 'Sample extracted text',
      confidence: 95,
    },
  }),
  createWorker: vi.fn().mockResolvedValue({
    load: vi.fn(),
    loadLanguage: vi.fn(),
    initialize: vi.fn(),
    recognize: vi.fn().mockResolvedValue({
      data: {
        text: 'Sample extracted text',
        confidence: 95,
      },
    }),
    terminate: vi.fn(),
  }),
}))

// Extend expect with custom matchers if needed
expect.extend({
  toBeFile(received: any) {
    const pass = received instanceof File
    return {
      message: () => `expected ${received} to be a File object`,
      pass,
    }
  },
})

// Global error handler to catch unhandled promises
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason)
})
