import { describe, it, expect } from 'vitest';
import { formatFileSize, generateFileName } from '../utils/fileUtils';

describe('fileUtils', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(500)).toBe('500 B');
    });
  });

  describe('generateFileName', () => {
    it('should generate filename with suffix', () => {
      const result = generateFileName('test.pdf', '_processed');
      expect(result).toBe('test_processed.pdf');
    });
  });
});