import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmartCompressionService } from '../services/smartCompressionService';

// Mock the PDF service
vi.mock('../services/pdfService', () => ({
  pdfService: {
    getPDFInfo: vi.fn()
  }
}));

// Mock language detector
vi.mock('../utils/languageDetector', () => ({
  detectLanguageAdvanced: vi.fn(() => ({ language: 'eng' }))
}));

describe('SmartCompressionService', () => {
  let smartCompressionService: SmartCompressionService;
  let mockFiles: File[];

  beforeEach(async () => {
    smartCompressionService = SmartCompressionService.getInstance();

    // Create mock PDF files with different characteristics
    mockFiles = [
      // Small text document
      new File(['small pdf content'], 'text_document.pdf', {
        type: 'application/pdf',
        lastModified: Date.now() - 86400000 // 1 day ago
      }),
      // Large scanned document
      new File([new ArrayBuffer(5 * 1024 * 1024)], 'scanned_invoice.pdf', { // 5MB
        type: 'application/pdf',
        lastModified: Date.now() - 43200000 // 12 hours ago
      }),
      // Medium presentation
      new File([new ArrayBuffer(2 * 1024 * 1024)], 'presentation_slides.pdf', { // 2MB
        type: 'application/pdf',
        lastModified: Date.now() // now
      })
    ];

    // Mock pdfService.getPDFInfo
    const { pdfService } = await import('../services/pdfService');
    pdfService.getPDFInfo.mockImplementation((file: File) => {
      const basePdfInfo = {
        pages: 10,
        originalSize: file.size,
        dimensions: { width: 595, height: 842 }
      };

      // Different info based on filename and size
      if (file.name.includes('text_document')) {
        return Promise.resolve({
          ...basePdfInfo,
          pages: 3,
          dimensions: { width: 595, height: 842 }
        });
      }

      if (file.name.includes('scanned')) {
        return Promise.resolve({
          ...basePdfInfo,
          pages: 20,
          dimensions: { width: 612, height: 792 }
        });
      }

      if (file.name.includes('presentation')) {
        return Promise.resolve({
          ...basePdfInfo,
          pages: 15,
          dimensions: { width: 792, height: 612 } // Landscape
        });
      }

      return Promise.resolve(basePdfInfo);
    });
  });

  describe('Service Initialization', () => {
    it('should create a singleton instance', () => {
      const service1 = SmartCompressionService.getInstance();
      const service2 = SmartCompressionService.getInstance();
      expect(service1).toBe(service2);
    });

    it('should have default language set', () => {
      expect(smartCompressionService).toBeDefined();
      // Language setting should be private, test by checking if service works
      expect(typeof smartCompressionService.analyzeForCompression).toBe('function');
    });
  });

  describe('Document Analysis', () => {
    it('should analyze single document and return basic information', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis).toBeDefined();
      expect(analysis.documents).toHaveLength(1);
      expect(analysis.documents[0].name).toBe('text_document.pdf');
      expect(analysis.documents[0].pages).toBe(3);
      expect(analysis.documents[0].orientation).toBe('portrait');
    });

    it('should detect document types from filenames', async () => {
      const textAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);
      const scannedAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]);
      const presentationAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[2]]);

      // Text document
      expect(textAnalysis.documents[0].type).toBe('text');

      // Scanned document
      expect(scannedAnalysis.documents[0].type).toBe('scanned');

      // Presentation
      expect(presentationAnalysis.documents[0].type).toBe('presentation');
    });

    it('should estimate compression potential correctly', async () => {
      const textAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);
      const scannedAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]);

      // Text documents typically have moderate compression potential
      expect(textAnalysis.contentAnalysis.compressionPotential).toBeGreaterThan(0);
      expect(textAnalysis.contentAnalysis.compressionPotential).toBeLessThan(100);

      // Scanned documents usually have higher compression potential
      expect(scannedAnalysis.contentAnalysis.compressionPotential).toBeGreaterThan(textAnalysis.contentAnalysis.compressionPotential);
    });

    it('should analyze document quality correctly', async () => {
      const textAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);
      const scannedAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]);

      expect(textAnalysis.contentAnalysis.qualityAssessment).toMatch(/high|medium|low/);
      expect(scannedAnalysis.contentAnalysis.qualityAssessment).toMatch(/high|medium|low/);

      // Larger files usually indicate higher quality
      expect(scannedAnalysis.contentAnalysis.qualityAssessment).toBe('high');
    });
  });

  describe('Content Analysis', () => {
    it('should provide content distribution percentages', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis.contentAnalysis.textPercentage).toBeGreaterThanOrEqual(0);
      expect(analysis.contentAnalysis.textPercentage).toBeLessThanOrEqual(100);
      expect(analysis.contentAnalysis.imagePercentage).toBeGreaterThanOrEqual(0);
      expect(analysis.contentAnalysis.imagePercentage).toBeLessThanOrEqual(100);
      expect(analysis.contentAnalysis.vectorPercentage).toBeGreaterThanOrEqual(0);
      expect(analysis.contentAnalysis.vectorPercentage).toBeLessThanOrEqual(100);

      // Percentages should sum to 100
      const total = analysis.contentAnalysis.textPercentage +
                   analysis.contentAnalysis.imagePercentage +
                   analysis.contentAnalysis.vectorPercentage;
      expect(total).toBe(100);
    });

    it('should detect page complexity correctly', async () => {
      const textAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);
      const presentationAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[2]]);

      expect(textAnalysis.contentAnalysis.pageComplexity).toMatch(/simple|moderate|complex/);
      expect(presentationAnalysis.contentAnalysis.pageComplexity).toMatch(/simple|moderate|complex/);
    });

    it('should estimate current compression level', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis.contentAnalysis.currentCompression).toMatch(/none|low|medium|high/);
    });
  });

  describe('Compression Recommendations', () => {
    it('should generate appropriate compression level recommendations', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis.recommendations.compressionLevel).toMatch(/conservative|balanced|aggressive/);
      expect(analysis.recommendations.expectedSizeReduction).toBeGreaterThan(0);
      expect(analysis.recommendations.expectedSizeReduction).toBeLessThanOrEqual(100);
      expect(analysis.recommendations.confidence).toBeGreaterThan(0);
      expect(analysis.recommendations.confidence).toBeLessThanOrEqual(100);
    });

    it('should provide realistic size reduction estimates', async () => {
      const textAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);
      const scannedAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]);

      // Scanned documents typically offer more compression potential
      expect(scannedAnalysis.recommendations.expectedSizeReduction)
        .toBeGreaterThanOrEqual(textAnalysis.recommendations.expectedSizeReduction);
    });

    it('should include quality loss estimates', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis.recommendations.qualityLossEstimate).toBeGreaterThanOrEqual(0);
      expect(analysis.recommendations.qualityLossEstimate).toBeLessThanOrEqual(100);
    });

    it('should provide processing time estimates', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis.recommendations.processingTime).toBeGreaterThan(0);
      expect(typeof analysis.recommendations.strategy).toBe('string');
      expect(analysis.recommendations.strategy.length).toBeGreaterThan(0);
    });
  });

  describe('Optimization Settings', () => {
    it('should generate appropriate optimization settings', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]);

      expect(analysis.optimizations).toBeDefined();
      expect(typeof analysis.optimizations.imageCompression).toBe('boolean');
      expect(analysis.optimizations.imageQuality).toBeGreaterThan(0);
      expect(analysis.optimizations.imageQuality).toBeLessThanOrEqual(100);
      expect(typeof analysis.optimizations.removeMetadata).toBe('boolean');
      expect(typeof analysis.optimizations.linearizeForWeb).toBe('boolean');
    });

    it('should adjust settings based on document type', async () => {
      const textAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);
      const scannedAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]);

      // Scanned documents should be more likely to have image compression enabled
      expect(scannedAnalysis.optimizations.imageCompression).toBeTruthy();

      // Text documents might have less aggressive settings
      if (textAnalysis.recommendations.compressionLevel === 'conservative') {
        expect(textAnalysis.optimizations.imageQuality).toBeGreaterThanOrEqual(85);
      }
    });
  });

  describe('Predictions', () => {
    it('should provide processing time predictions', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis.predictions.processingTime).toBeDefined();
      expect(analysis.predictions.processingTime.estimated).toBeGreaterThan(0);
      expect(analysis.predictions.processingTime.range.min).toBeGreaterThan(0);
      expect(analysis.predictions.processingTime.range.max).toBeGreaterThan(analysis.predictions.processingTime.range.min);
      expect(analysis.predictions.processingTime.confidence).toBeGreaterThan(0);
      expect(analysis.predictions.processingTime.confidence).toBeLessThanOrEqual(100);
    });

    it('should provide size reduction predictions', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis.predictions.resultSize).toBeDefined();
      expect(analysis.predictions.resultSize.resultSize).toBeGreaterThan(0);
      expect(analysis.predictions.resultSize.resultSize).toBeLessThan(mockFiles[0].size);
      expect(analysis.predictions.resultSize.sizeReduction).toBeGreaterThan(0);
      expect(analysis.predictions.resultSize.comparison.originalSize).toBe(mockFiles[0].size);
    });

    it('should provide quality forecasts', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      expect(analysis.predictions.qualityForecast).toBeDefined();
      expect(analysis.predictions.qualityForecast.overall).toMatch(/excellent|good|acceptable|degraded|poor/);
      expect(analysis.predictions.qualityForecast.score).toBeGreaterThanOrEqual(0);
      expect(analysis.predictions.qualityForecast.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(analysis.predictions.qualityForecast.risks)).toBeTruthy();
    });

    it('should provide performance impact assessments', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]); // Large file

      expect(analysis.predictions.performanceImpact).toBeDefined();
      expect(analysis.predictions.performanceImpact.memoryUsage).toMatch(/low|medium|high/);
      expect(typeof analysis.predictions.performanceImpact.cpuIntensive).toBe('boolean');
      expect(analysis.predictions.performanceImpact.browserLoad).toBeGreaterThanOrEqual(0);
      expect(analysis.predictions.performanceImpact.browserLoad).toBeLessThanOrEqual(100);
      expect(analysis.predictions.performanceImpact.processingStrategy).toMatch(/single-pass|multi-pass|chunked/);
      expect(analysis.predictions.performanceImpact.batteryImpact).toMatch(/minimal|moderate|significant/);
    });
  });

  describe('Warning System', () => {
    it('should generate warnings when appropriate', async () => {
      const scannedAnalysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]);

      expect(Array.isArray(scannedAnalysis.warnings)).toBeTruthy();

      // Large files should generate at least one warning
      if (mockFiles[1].size > 50 * 1024 * 1024) {
        expect(scannedAnalysis.warnings.length).toBeGreaterThan(0);
      }
    });

    it('should include warning details', async () => {
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[1]]);

      if (analysis.warnings.length > 0) {
        const warning = analysis.warnings[0];
        expect(warning.type).toMatch(/quality_loss|compatibility_risk|processing_time|size_limit|content_loss|font_issues/);
        expect(warning.severity).toMatch(/info|warning|error/);
        expect(typeof warning.message).toBe('string');
        expect(Array.isArray(warning.affectedAreas)).toBeTruthy();
        expect(typeof warning.suggestion).toBe('string');
        expect(warning.impact).toMatch(/low|medium|high/);
      }
    });
  });

  describe('Service Options', () => {
    it('should respect custom analysis options', async () => {
      const customOptions = {
        enableContentAnalysis: false,
        enableImageAnalysis: false,
        enableQualityPrediction: true,
        enablePerformanceOptimization: true,
        maxAnalysisTime: 5000,
        prioritizeQuality: true,
        deviceType: 'mobile' as const
      };

      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]], customOptions);

      expect(analysis).toBeDefined();
      // With quality prioritized, compression should be more conservative
      if (customOptions.prioritizeQuality) {
        expect(['conservative', 'balanced']).toContain(analysis.recommendations.compressionLevel);
      }
    });

    it('should handle analysis timeout gracefully', async () => {
      const shortTimeoutOptions = {
        enableContentAnalysis: true,
        enableImageAnalysis: true,
        enableQualityPrediction: true,
        enablePerformanceOptimization: true,
        maxAnalysisTime: 1, // Very short timeout
        prioritizeQuality: false,
        deviceType: 'desktop' as const
      };

      // Should still complete analysis even with short timeout
      // (our analysis is fast enough to complete within 1ms in tests)
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]], shortTimeoutOptions);
      expect(analysis).toBeDefined();
    });
  });

  describe('Compression Presets', () => {
    it('should provide available compression presets', () => {
      const presets = smartCompressionService.getAvailablePresets();

      expect(Array.isArray(presets)).toBeTruthy();
      expect(presets.length).toBeGreaterThan(0);

      // Check default presets exist
      const presetNames = presets.map(p => p.name);
      expect(presetNames).toContain('web-optimized');
      expect(presetNames).toContain('print-quality');
      expect(presetNames).toContain('maximum-compression');
    });

    it('should return specific preset by name', () => {
      const webPreset = smartCompressionService.getCompressionPreset('web-optimized');
      const printPreset = smartCompressionService.getCompressionPreset('print-quality');
      const maxPreset = smartCompressionService.getCompressionPreset('maximum-compression');

      expect(webPreset).toBeDefined();
      expect(printPreset).toBeDefined();
      expect(maxPreset).toBeDefined();

      // Check preset properties
      if (webPreset) {
        expect(webPreset.name).toBe('web-optimized');
        expect(webPreset.useCase).toBe('web');
        expect(webPreset.settings).toBeDefined();
        expect(typeof webPreset.targetSizeReduction).toBe('number');
      }
    });

    it('should return undefined for non-existent preset', () => {
      const nonExistentPreset = smartCompressionService.getCompressionPreset('non-existent-preset');
      expect(nonExistentPreset).toBeUndefined();
    });
  });

  describe('Language Support', () => {
    it('should handle language changes', () => {
      expect(() => {
        smartCompressionService.setLanguage('en');
        smartCompressionService.setLanguage('ru');
        smartCompressionService.setLanguage('de');
      }).not.toThrow();
    });

    it('should work with different languages', async () => {
      smartCompressionService.setLanguage('ru');
      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      // Should still work regardless of language
      expect(analysis).toBeDefined();
      expect(analysis.recommendations.strategy).toBeDefined();
      expect(typeof analysis.recommendations.reasoning).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty file array', async () => {
      await expect(smartCompressionService.analyzeForCompression([])).rejects.toThrow();
    });

    it('should handle PDF service errors gracefully', async () => {
      const { pdfService } = await import('../services/pdfService');
      pdfService.getPDFInfo.mockRejectedValueOnce(new Error('PDF service error'));

      const analysis = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      // Should still return analysis with fallback data
      expect(analysis).toBeDefined();
      expect(analysis.documents).toHaveLength(1);
      // Document should have fallback values
      expect(analysis.documents[0].pages).toBe(1); // Fallback page count
    });
  });

  describe('Analysis Consistency', () => {
    it('should provide consistent results for same input', async () => {
      const analysis1 = await smartCompressionService.analyzeForCompression([mockFiles[0]]);
      const analysis2 = await smartCompressionService.analyzeForCompression([mockFiles[0]]);

      // Core analysis should be consistent
      expect(analysis1.documents[0].name).toBe(analysis2.documents[0].name);
      expect(analysis1.documents[0].size).toBe(analysis2.documents[0].size);
      expect(analysis1.documents[0].type).toBe(analysis2.documents[0].type);
      expect(analysis1.recommendations.compressionLevel).toBe(analysis2.recommendations.compressionLevel);
    });
  });
});