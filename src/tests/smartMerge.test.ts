import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmartMergeService } from '../services/smartMergeService';

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

describe('SmartMergeService', () => {
  let smartMergeService: SmartMergeService;
  let mockFiles: File[];

  beforeEach(() => {
    smartMergeService = SmartMergeService.getInstance();

    // Create mock PDF files
    mockFiles = [
      new File(['pdf content 1'], 'document1.pdf', {
        type: 'application/pdf',
        lastModified: Date.now() - 86400000 // 1 day ago
      }),
      new File(['pdf content 2'], 'document2.pdf', {
        type: 'application/pdf',
        lastModified: Date.now() - 43200000 // 12 hours ago
      }),
      new File(['pdf content 3'], 'contract_final.pdf', {
        type: 'application/pdf',
        lastModified: Date.now() // now
      })
    ];

    // Mock pdfService.getPDFInfo
    const { pdfService } = require('../services/pdfService');
    pdfService.getPDFInfo.mockImplementation((file: File) => {
      const basePdfInfo = {
        pages: 5,
        originalSize: file.size,
        dimensions: { width: 595, height: 842 }
      };

      // Different info based on filename
      if (file.name.includes('contract')) {
        return Promise.resolve({
          ...basePdfInfo,
          pages: 3,
          dimensions: { width: 612, height: 792 }
        });
      }

      return Promise.resolve(basePdfInfo);
    });
  });

  describe('Document Analysis', () => {
    it('should analyze documents and return basic information', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis).toBeDefined();
      expect(analysis.documents).toHaveLength(3);
      expect(analysis.documents[0].name).toBe('document1.pdf');
      expect(analysis.documents[0].pages).toBe(5);
      expect(analysis.documents[2].name).toBe('contract_final.pdf');
      expect(analysis.documents[2].pages).toBe(3);
    });

    it('should detect document types from filenames', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      // Contract document should be detected
      expect(analysis.content.documentTypes).toContain('contract');
    });

    it('should determine document orientation', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      // Most documents should be portrait (height > width)
      const portraitDocs = analysis.documents.filter(d => d.orientation === 'portrait');
      expect(portraitDocs.length).toBeGreaterThan(0);
    });
  });

  describe('Compatibility Analysis', () => {
    it('should analyze page size consistency', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis.compatibility).toBeDefined();
      expect(analysis.compatibility.pageSizeConsistency).toMatch(/uniform|similar|mixed/);
      expect(typeof analysis.compatibility.sizeVariancePercentage).toBe('number');
    });

    it('should detect orientation mismatches', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(typeof analysis.compatibility.orientationMismatch).toBe('boolean');
    });
  });

  describe('Smart Recommendations', () => {
    it('should generate file order recommendations', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis.recommendations.suggestedOrder).toBeDefined();
      expect(analysis.recommendations.suggestedOrder.fileIds).toHaveLength(3);
      expect(analysis.recommendations.suggestedOrder.confidence).toBeGreaterThan(0);
      expect(analysis.recommendations.suggestedOrder.confidence).toBeLessThanOrEqual(100);
      expect(analysis.recommendations.suggestedOrder.reasoning).toBeTruthy();
    });

    it('should suggest chronological order for dated documents', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      // Should suggest chronological order (oldest first)
      const firstFileIndex = parseInt(analysis.recommendations.suggestedOrder.fileIds[0]);
      const lastFileIndex = parseInt(analysis.recommendations.suggestedOrder.fileIds[2]);

      const firstFile = analysis.documents[firstFileIndex];
      const lastFile = analysis.documents[lastFileIndex];

      expect(firstFile.created.getTime()).toBeLessThan(lastFile.created.getTime());
    });

    it('should generate smart metadata', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis.recommendations.suggestedMetadata).toBeDefined();
      expect(analysis.recommendations.suggestedMetadata.title).toBeTruthy();
      expect(analysis.recommendations.suggestedMetadata.author).toBeTruthy();
      expect(analysis.recommendations.suggestedMetadata.subject).toBeTruthy();
      expect(Array.isArray(analysis.recommendations.suggestedMetadata.keywords)).toBe(true);
    });

    it('should identify warnings for problematic merges', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(Array.isArray(analysis.recommendations.warnings)).toBe(true);
      // Warnings are optional, so we just check the structure
      analysis.recommendations.warnings.forEach(warning => {
        expect(warning.type).toBeTruthy();
        expect(warning.severity).toMatch(/info|warning|error/);
        expect(warning.message).toBeTruthy();
        expect(warning.suggestion).toBeTruthy();
      });
    });
  });

  describe('Predictions', () => {
    it('should predict processing time', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis.predictions.processingTime).toBeDefined();
      expect(analysis.predictions.processingTime.estimated).toBeGreaterThan(0);
      expect(analysis.predictions.processingTime.range.min).toBeGreaterThan(0);
      expect(analysis.predictions.processingTime.range.max).toBeGreaterThan(
        analysis.predictions.processingTime.range.min
      );
      expect(analysis.predictions.processingTime.confidence).toBeGreaterThan(0);
    });

    it('should predict result size', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis.predictions.resultSize).toBeDefined();
      expect(analysis.predictions.resultSize.estimated).toBeGreaterThan(0);
      expect(typeof analysis.predictions.resultSize.compression).toBe('number');
      expect(analysis.predictions.resultSize.comparison.totalInputSize).toBeGreaterThan(0);
    });

    it('should forecast quality', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis.predictions.qualityForecast).toBeDefined();
      expect(analysis.predictions.qualityForecast.overall).toMatch(/excellent|good|acceptable|poor/);
      expect(analysis.predictions.qualityForecast.score).toBeGreaterThanOrEqual(0);
      expect(analysis.predictions.qualityForecast.score).toBeLessThanOrEqual(100);
    });

    it('should predict performance impact', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis.predictions.performanceImpact).toBeDefined();
      expect(analysis.predictions.performanceImpact.memoryUsage).toMatch(/low|medium|high/);
      expect(analysis.predictions.performanceImpact.browserLoad).toBeGreaterThanOrEqual(0);
      expect(analysis.predictions.performanceImpact.browserLoad).toBeLessThanOrEqual(100);
      expect(analysis.predictions.performanceImpact.processingStrategy).toMatch(/sequential|parallel|hybrid/);
    });
  });

  describe('Content Analysis', () => {
    it('should detect related documents', async () => {
      // Create related documents with similar names
      const relatedFiles = [
        new File(['content'], 'report_part1.pdf', { type: 'application/pdf' }),
        new File(['content'], 'report_part2.pdf', { type: 'application/pdf' }),
        new File(['content'], 'report_part3.pdf', { type: 'application/pdf' })
      ];

      const analysis = await smartMergeService.analyzeForMerge(relatedFiles);

      expect(analysis.content.relatedDocuments).toBe(true);
    });

    it('should detect document types from content analysis', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(Array.isArray(analysis.content.documentTypes)).toBe(true);
      expect(analysis.content.documentTypes.length).toBeGreaterThan(0);
    });

    it('should calculate confidence score', async () => {
      const analysis = await smartMergeService.analyzeForMerge(mockFiles);

      expect(analysis.content.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(analysis.content.confidenceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single file gracefully', async () => {
      const singleFile = [mockFiles[0]];

      const analysis = await smartMergeService.analyzeForMerge(singleFile);

      expect(analysis.documents).toHaveLength(1);
      expect(analysis.compatibility.pageSizeConsistency).toBe('uniform');
      expect(analysis.compatibility.orientationMismatch).toBe(false);
    });

    it('should handle files with similar names', async () => {
      const similarFiles = [
        new File(['content'], 'document.pdf', { type: 'application/pdf' }),
        new File(['content'], 'document_v2.pdf', { type: 'application/pdf' })
      ];

      const analysis = await smartMergeService.analyzeForMerge(similarFiles);

      expect(analysis.content.relatedDocuments).toBe(true);
    });

    it('should handle analysis timeout gracefully', async () => {
      const options = {
        enableContentAnalysis: true,
        enableLanguageDetection: true,
        enableQualityAnalysis: true,
        enablePerformanceOptimization: true,
        maxAnalysisTime: 1 // Very short timeout
      };

      // This should complete regardless of timeout due to fallback behavior
      const analysis = await smartMergeService.analyzeForMerge(mockFiles, options);
      expect(analysis).toBeDefined();
    });
  });
});

describe('SmartMergeService Integration', () => {
  it('should provide consistent results for same input', async () => {
    const service1 = SmartMergeService.getInstance();
    const service2 = SmartMergeService.getInstance();

    expect(service1).toBe(service2); // Should be singleton

    const files = [
      new File(['content'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content'], 'test2.pdf', { type: 'application/pdf' })
    ];

    const analysis1 = await service1.analyzeForMerge(files);
    const analysis2 = await service2.analyzeForMerge(files);

    // Should have same number of documents
    expect(analysis1.documents.length).toBe(analysis2.documents.length);

    // Should have same recommendations structure
    expect(analysis1.recommendations.suggestedOrder.algorithm)
      .toBe(analysis2.recommendations.suggestedOrder.algorithm);
  });
});