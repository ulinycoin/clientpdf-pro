import { useState, useCallback, useRef } from 'react';
import {
  ExcelWorkbook,
  ConversionOptions,
  ConversionResult,
  ConversionProgress,
  FontSubset
} from '../types/excelToPdf.types';
import { excelParserService } from '../services/excelParserService';
import { excelToPDFGenerator } from '../services/excelToPDFGenerator';
import { fontManager } from '../services/fontManager';

interface UseExcelToPDFState {
  workbook: ExcelWorkbook | null;
  isProcessing: boolean;
  progress: ConversionProgress | null;
  error: string | null;
  result: ConversionResult | null;
  availableFonts: FontSubset[];
  showPreview: boolean;
  tableAnalysis: {
    isOverflowing: boolean;
    recommendedOrientation?: 'landscape' | 'portrait';
    recommendedPageSize?: string;
    columnCount: number;
    scaleFactor?: number;
  } | null;
}

interface UseExcelToPDFActions {
  parseFile: (file: File) => Promise<void>;
  convertToPDF: (options: ConversionOptions) => Promise<void>;
  downloadPDF: (pdfFile: { name: string; data: Uint8Array }) => void;
  downloadAllPDFs: () => void;
  reset: () => void;
  togglePreview: () => void;
  analyzeTable: (options: ConversionOptions) => void;
}

const DEFAULT_OPTIONS: ConversionOptions = {
  selectedSheets: [],
  orientation: 'portrait',
  pageSize: 'A4',
  fontSize: 10,
  fontFamily: 'helvetica',
  includeSheetNames: true,
  handleWideTablesWith: 'scale',
  outputFormat: 'single-pdf',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }
};

export function useExcelToPDF(): UseExcelToPDFState & UseExcelToPDFActions {
  const [state, setState] = useState<UseExcelToPDFState>({
    workbook: null,
    isProcessing: false,
    progress: null,
    error: null,
    result: null,
    availableFonts: fontManager.getAvailableFonts(),
    showPreview: false,
    tableAnalysis: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const setProgress = useCallback((progress: ConversionProgress) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isProcessing: false,
      progress: null
    }));
  }, []);

  const parseFile = useCallback(async (file: File) => {
    if (!file) {
      setError('No file provided');
      return;
    }

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }

    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      result: null,
      progress: {
        stage: 'parsing',
        progress: 0,
        message: 'Parsing Excel file...'
      }
    }));

    try {
      abortControllerRef.current = new AbortController();

      const workbook = await excelParserService.parseExcelFile(file);

      setState(prev => ({
        ...prev,
        workbook,
        isProcessing: false,
        progress: {
          stage: 'complete',
          progress: 100,
          message: 'File parsed successfully'
        }
      }));

      setTimeout(() => {
        setState(prev => ({ ...prev, progress: null }));
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to parse Excel file');
    }
  }, [setError]);

  const convertToPDF = useCallback(async (options: ConversionOptions) => {
    console.log('🚀 Starting convertToPDF with options:', options);

    if (!state.workbook) {
      console.error('❌ No Excel file loaded');
      setError('No Excel file loaded');
      return;
    }

    if (options.selectedSheets.length === 0) {
      console.error('❌ No sheets selected');
      setError('Please select at least one sheet to convert');
      return;
    }

    console.log('✅ Validation passed, starting conversion...');
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      result: null
    }));

    try {
      abortControllerRef.current = new AbortController();

      setProgress({
        stage: 'analyzing',
        progress: 10,
        message: 'Analyzing content...'
      });

      const requiredSubsets = state.workbook.metadata.detectedLanguages
        .map(lang => fontManager.getBestFontForLanguages([lang]).subset)
        .filter((subset, index, arr) => arr.indexOf(subset) === index);

      if (requiredSubsets.length > 0) {
        setProgress({
          stage: 'loading-fonts',
          progress: 30,
          message: 'Loading fonts...'
        });

        await fontManager.loadRequiredFonts(
          requiredSubsets,
          (loaded, total, fontName) => {
            const fontProgress = 30 + (loaded / total) * 20;
            setProgress({
              stage: 'loading-fonts',
              progress: fontProgress,
              message: `Loading ${fontName}...`
            });
          }
        );
      }

      setProgress({
        stage: 'generating',
        progress: 50,
        message: 'Generating PDF...'
      });

      const selectedSheets = state.workbook.sheets.filter(sheet =>
        options.selectedSheets.includes(sheet.name)
      );

      console.log('📊 Converting sheets:', selectedSheets.map(s => s.name));

      const result = await excelToPDFGenerator.generatePDF(
        selectedSheets,
        options,
        (progress, message) => {
          const totalProgress = 50 + (progress / 100) * 45;
          setProgress({
            stage: 'generating',
            progress: totalProgress,
            message
          });
        }
      );

      console.log('🎉 Conversion result:', {
        success: result.success,
        hasFiles: !!result.pdfFiles,
        filesCount: result.pdfFiles?.length,
        error: result.error,
        firstFileName: result.pdfFiles?.[0]?.name,
        firstFileSize: result.pdfFiles?.[0]?.data?.length
      });

      if (result.success) {
        console.log('✅ Setting state with result and showPreview=true');
        setState(prev => ({
          ...prev,
          result,
          isProcessing: false,
          showPreview: true, // Automatically show preview after successful conversion
          progress: {
            stage: 'complete',
            progress: 100,
            message: 'Conversion completed successfully!'
          }
        }));

        console.log('🔄 State should now have showPreview=true and result with files');

        setTimeout(() => {
          setState(prev => ({ ...prev, progress: null }));
        }, 2000);
      } else {
        console.error('❌ Conversion failed:', result.error);
        setError(result.error || 'Conversion failed');
      }

    } catch (error) {
      console.error('❌ Conversion error:', error);
      setError(error instanceof Error ? error.message : 'Conversion failed');
    }
  }, [state.workbook, setError, setProgress]);

  const downloadPDF = useCallback((pdfFile: { name: string; data: Uint8Array }) => {
    try {
      const blob = new Blob([pdfFile.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download PDF');
    }
  }, [setError]);

  const downloadAllPDFs = useCallback(() => {
    if (!state.result?.pdfFiles) {
      setError('No PDF files to download');
      return;
    }

    state.result.pdfFiles.forEach(pdfFile => {
      downloadPDF(pdfFile);
    });
  }, [state.result?.pdfFiles, downloadPDF, setError]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      workbook: null,
      isProcessing: false,
      progress: null,
      error: null,
      result: null,
      availableFonts: fontManager.getAvailableFonts(),
      showPreview: false,
      tableAnalysis: null
    });
  }, []);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, showPreview: !prev.showPreview }));
  }, []);

  const analyzeTable = useCallback((options: ConversionOptions) => {
    if (!state.workbook || options.selectedSheets.length === 0) {
      setState(prev => ({ ...prev, tableAnalysis: null }));
      return;
    }

    try {
      // Analyze the first selected sheet for overflow
      const selectedSheet = state.workbook.sheets.find(sheet =>
        options.selectedSheets.includes(sheet.name)
      );

      if (!selectedSheet) {
        setState(prev => ({ ...prev, tableAnalysis: null }));
        return;
      }

      const analysis = excelToPDFGenerator.analyzeTableLayout(selectedSheet, options);

      setState(prev => ({
        ...prev,
        tableAnalysis: {
          isOverflowing: analysis.isOverflowing,
          recommendedOrientation: analysis.recommendedOrientation,
          recommendedPageSize: analysis.recommendedPageSize,
          columnCount: analysis.columnCount,
          scaleFactor: analysis.scaleFactor
        }
      }));
    } catch (error) {
      console.warn('Table analysis failed:', error);
      setState(prev => ({ ...prev, tableAnalysis: null }));
    }
  }, [state.workbook]);

  return {
    ...state,
    parseFile,
    convertToPDF,
    downloadPDF,
    downloadAllPDFs,
    reset,
    togglePreview,
    analyzeTable
  };
}

export { DEFAULT_OPTIONS };
