import { useState } from 'react';
import { ConversionService } from '../services/conversionService';
import { ConversionSettings, ConversionResult } from '../types/wordToPdf.types';

export const useWordToPDF = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [conversionService] = useState(() => new ConversionService());

  const convertFile = async (file: File, settings?: ConversionSettings, autoDownload = true) => {
    console.log('🔄 useWordToPDF: Starting conversion...', { fileName: file.name, autoDownload });
    setIsConverting(true);
    setResult(null);

    try {
      const conversionResult = await conversionService.convertWordToPDF(file, settings);
      console.log('📋 useWordToPDF: Conversion result:', { 
        success: conversionResult.success, 
        hasPdfBytes: !!conversionResult.pdfBytes,
        bytesLength: conversionResult.pdfBytes?.length,
        error: conversionResult.error 
      });
      
      setResult(conversionResult);

      // Auto-download if successful and autoDownload is true
      if (conversionResult.success && conversionResult.pdfBytes && autoDownload) {
        await conversionService.downloadPDF(conversionResult.pdfBytes, file.name);
      }

    } catch (error) {
      console.error('❌ useWordToPDF: Conversion error:', error);
      setResult({
        success: false,
        error: error.message || 'Conversion failed'
      });
    } finally {
      console.log('🏁 useWordToPDF: Conversion finished, isConverting = false');
      setIsConverting(false);
    }
  };

  const downloadPDF = async (fileName: string) => {
    if (result?.success && result.pdfBytes) {
      await conversionService.downloadPDF(result.pdfBytes, fileName);
    }
  };

  const regenerateWithSettings = async (file: File, settings: ConversionSettings) => {
    // Convert without auto-download for preview
    await convertFile(file, settings, false);
  };

  const reset = () => {
    setResult(null);
    setIsConverting(false);
    setPreviewMode(false);
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  return {
    isConverting,
    result,
    previewMode,
    convertFile,
    downloadPDF,
    regenerateWithSettings,
    togglePreviewMode,
    reset
  };
};
