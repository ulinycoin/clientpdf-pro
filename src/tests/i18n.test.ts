import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../types/i18n';

describe('i18n', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should contain valid language codes', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(5);
      expect(SUPPORTED_LANGUAGES.map(l => l.code)).toContain('en');
      expect(SUPPORTED_LANGUAGES.map(l => l.code)).toContain('ru');
    });

    it('should have default language in supported languages', () => {
      const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      expect(supportedCodes).toContain(DEFAULT_LANGUAGE);
    });
  });
});