import { describe, it, expect, beforeEach } from 'vitest'
import { TextFormatter, TextFormattingOptions } from './textFormatter'

describe('TextFormatter', () => {
  let formatter: TextFormatter

  beforeEach(() => {
    formatter = TextFormatter.getInstance()
  })

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const instance1 = TextFormatter.getInstance()
      const instance2 = TextFormatter.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('formatText', () => {
    it('returns empty text unchanged', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: true,
        normalizeLineBreaks: true,
        removeEmptyLines: true,
        trimWhitespace: true,
      }
      expect(formatter.formatText('', options)).toBe('')
      expect(formatter.formatText('   ', options)).toBe('')
    })

    it('removes extra spaces when option is enabled', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: true,
        normalizeLineBreaks: false,
        removeEmptyLines: false,
        trimWhitespace: false,
      }
      const input = 'This  has    multiple     spaces'
      const expected = 'This has multiple spaces'
      expect(formatter.formatText(input, options)).toBe(expected)
    })

    it('keeps extra spaces when option is disabled', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: false,
        normalizeLineBreaks: false,
        removeEmptyLines: false,
        trimWhitespace: false,
      }
      const input = 'This  has    multiple     spaces'
      expect(formatter.formatText(input, options)).toBe(input)
    })

    it('normalizes line breaks', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: false,
        normalizeLineBreaks: true,
        removeEmptyLines: false,
        trimWhitespace: false,
      }
      const input = 'Line1\r\nLine2\rLine3\nLine4'
      const expected = 'Line1\nLine2\nLine3\nLine4'
      expect(formatter.formatText(input, options)).toBe(expected)
    })

    it('removes empty lines when option is enabled', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: false,
        normalizeLineBreaks: false,
        removeEmptyLines: true,
        trimWhitespace: false,
      }
      const input = 'Line1\n\nLine2\n   \nLine3'
      const expected = 'Line1\nLine2\nLine3'
      expect(formatter.formatText(input, options)).toBe(expected)
    })

    it('trims whitespace when option is enabled', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: false,
        normalizeLineBreaks: false,
        removeEmptyLines: false,
        trimWhitespace: true,
      }
      const input = '   Some text with spaces   '
      const expected = 'Some text with spaces'
      expect(formatter.formatText(input, options)).toBe(expected)
    })

    it('detects headings when option is enabled', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: false,
        normalizeLineBreaks: false,
        removeEmptyLines: false,
        trimWhitespace: false,
        detectHeadings: true,
      }
      const input = 'CHAPTER ONE\nThis is content\nANOTHER HEADING'
      const expected = '### CHAPTER ONE\nThis is content\n### ANOTHER HEADING'
      expect(formatter.formatText(input, options)).toBe(expected)
    })

    it('preserves list structure when option is enabled', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: false,
        normalizeLineBreaks: false,
        removeEmptyLines: false,
        trimWhitespace: false,
        preserveListStructure: true,
      }
      const input = '• Item 1\n  - Subitem\n1. Numbered item'
      const expected = '• Item 1\n  - Subitem\n1. Numbered item'
      expect(formatter.formatText(input, options)).toBe(expected)
    })

    it('applies multiple formatting options', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: true,
        normalizeLineBreaks: true,
        removeEmptyLines: true,
        trimWhitespace: true,
      }
      const input = '   This  has    multiple\r\n\r\nspaces   and   breaks   '
      const expected = 'This has multiple\nspaces and breaks'
      expect(formatter.formatText(input, options)).toBe(expected)
    })
  })

  describe('previewFormatting', () => {
    it('returns changes and preview', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: true,
        normalizeLineBreaks: true,
        removeEmptyLines: false,
        trimWhitespace: true,
      }
      const input = '   This  has    multiple  spaces   '
      const result = formatter.previewFormatting(input, options)

      expect(result.changes).toContain('Remove extra spaces')
      expect(result.changes).toContain('Normalize line breaks')
      expect(result.changes).toContain('Trim whitespace')
      expect(result.changes).not.toContain('Remove empty lines')

      expect(result.preview).toBe('This has multiple spaces')
    })

    it('truncates long text with ellipsis', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: false,
        normalizeLineBreaks: false,
        removeEmptyLines: false,
        trimWhitespace: false,
      }
      const longText = 'a'.repeat(300)
      const result = formatter.previewFormatting(longText, options)

      expect(result.preview).toHaveLength(203) // 200 + '...'
      expect(result.preview.endsWith('...')).toBe(true)
    })

    it('does not add ellipsis for short text', () => {
      const options: TextFormattingOptions = {
        removeExtraSpaces: false,
        normalizeLineBreaks: false,
        removeEmptyLines: false,
        trimWhitespace: false,
      }
      const shortText = 'Short text'
      const result = formatter.previewFormatting(shortText, options)

      expect(result.preview).toBe(shortText)
      expect(result.preview.endsWith('...')).toBe(false)
    })
  })

  describe('preset options', () => {
    it('returns default options', () => {
      const options = formatter.getDefaultOptions()
      expect(options.removeExtraSpaces).toBe(true)
      expect(options.normalizeLineBreaks).toBe(true)
      expect(options.removeEmptyLines).toBe(true)
      expect(options.trimWhitespace).toBe(true)
      expect(options.detectHeadings).toBe(false)
      expect(options.preserveListStructure).toBe(false)
    })

    it('returns minimal options', () => {
      const options = formatter.getMinimalOptions()
      expect(options.removeExtraSpaces).toBe(false)
      expect(options.normalizeLineBreaks).toBe(true)
      expect(options.removeEmptyLines).toBe(false)
      expect(options.trimWhitespace).toBe(true)
      expect(options.detectHeadings).toBe(false)
      expect(options.preserveListStructure).toBe(false)
    })

    it('returns advanced options', () => {
      const options = formatter.getAdvancedOptions()
      expect(options.removeExtraSpaces).toBe(true)
      expect(options.normalizeLineBreaks).toBe(true)
      expect(options.removeEmptyLines).toBe(true)
      expect(options.trimWhitespace).toBe(true)
      expect(options.detectHeadings).toBe(true)
      expect(options.preserveListStructure).toBe(true)
    })
  })
})
