import { useState, useCallback } from 'react';
import { 
  ImageConversionOptions, 
  ImageConversionResult, 
  ImageConversionProgress, 
  ConvertedImage,
  ImageFormat,
  ImageQuality
} from '../types/image.types';
import { PdfToImageService } from '../services/pdfToImageService';

interface UsePdfToImageState {
  isConverting: boolean;
  progress: ImageConversionProgress | null;
  result: ImageConversionResult | null;
  error: string | null;
  previewImages: ConvertedImage[];
}

interface UsePdfToImageOptions {
  format: ImageFormat;
  quality: ImageQuality;
  pages: 'all' | 'specific' | 'range';
  pageNumbers: number[];
  pageRange: { start: number; end: number };
  backgroundColor: string;
}

export function usePdfToImage() {
  const [state, setState] = useState<UsePdfToImageState>({
    isConverting: false,
    progress: null,
    result: null,
    error: null,
    previewImages: []
  });

  const [options, setOptions] = useState<UsePdfToImageOptions>({
    format: 'png',
    quality: 'medium',
    pages: 'all',
    pageNumbers: [],
    pageRange: { start: 1, end: 1 },
    backgroundColor: '#ffffff'
  });

  const pdfToImageService = PdfToImageService.getInstance();

  const convertToImages = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      isConverting: true,
      progress: null,
      result: null,
      error: null,
      previewImages: []
    }));

    try {
      const conversionOptions: ImageConversionOptions = {
        format: options.format,
        quality: options.quality,
        pages: options.pages,
        pageNumbers: options.pageNumbers,
        pageRange: options.pageRange,
        backgroundColor: options.backgroundColor
      };

      const result = await pdfToImageService.convertToImages(
        file,
        conversionOptions,
        (progress) => {
          setState(prev => ({ ...prev, progress }));
        }
      );

      if (result.success) {
        setState(prev => ({
          ...prev,
          isConverting: false,
          result,
          previewImages: result.images.slice(0, 3), // Show first 3 for preview
          progress: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          isConverting: false,
          error: result.error || 'Conversion failed',
          progress: null
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConverting: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: null
      }));
    }
  }, [options, pdfToImageService]);

  const updateOptions = useCallback((newOptions: Partial<UsePdfToImageOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const downloadImage = useCallback((image: ConvertedImage) => {
    pdfToImageService.downloadImage(image);
  }, [pdfToImageService]);

  const downloadAllImages = useCallback(() => {
    if (state.result?.images) {
      pdfToImageService.downloadAllImages(state.result.images);
    }
  }, [state.result?.images, pdfToImageService]);

  const reset = useCallback(() => {
    setState({
      isConverting: false,
      progress: null,
      result: null,
      error: null,
      previewImages: []
    });
  }, []);

  const validatePageNumbers = useCallback((totalPages: number) => {
    // Validate and clean page numbers
    const validNumbers = options.pageNumbers.filter(n => n >= 1 && n <= totalPages);
    if (validNumbers.length !== options.pageNumbers.length) {
      setOptions(prev => ({ ...prev, pageNumbers: validNumbers }));
    }
    
    // Validate page range
    const validStart = Math.max(1, Math.min(options.pageRange.start, totalPages));
    const validEnd = Math.min(totalPages, Math.max(options.pageRange.end, validStart));
    
    if (validStart !== options.pageRange.start || validEnd !== options.pageRange.end) {
      setOptions(prev => ({
        ...prev,
        pageRange: { start: validStart, end: validEnd }
      }));
    }
  }, [options.pageNumbers, options.pageRange]);

  const addPageNumber = useCallback((pageNumber: number) => {
    if (!options.pageNumbers.includes(pageNumber)) {
      setOptions(prev => ({
        ...prev,
        pageNumbers: [...prev.pageNumbers, pageNumber].sort((a, b) => a - b)
      }));
    }
  }, [options.pageNumbers]);

  const removePageNumber = useCallback((pageNumber: number) => {
    setOptions(prev => ({
      ...prev,
      pageNumbers: prev.pageNumbers.filter(n => n !== pageNumber)
    }));
  }, []);

  const clearPageNumbers = useCallback(() => {
    setOptions(prev => ({ ...prev, pageNumbers: [] }));
  }, []);

  const setPageRange = useCallback((start: number, end: number) => {
    setOptions(prev => ({
      ...prev,
      pageRange: { start, end }
    }));
  }, []);

  const getEstimatedFileSize = useCallback(() => {
    if (!state.result) return null;
    
    const { images, metadata } = state.result;
    if (images.length === 0) return null;

    const averageSize = images.reduce((sum, img) => sum + img.size, 0) / images.length;
    
    return {
      totalSize: state.result.convertedSize,
      averagePerPage: averageSize,
      format: metadata?.format,
      quality: metadata?.quality
    };
  }, [state.result]);

  return {
    // State
    isConverting: state.isConverting,
    progress: state.progress,
    result: state.result,
    error: state.error,
    previewImages: state.previewImages,
    options,

    // Actions
    convertToImages,
    updateOptions,
    downloadImage,
    downloadAllImages,
    reset,
    
    // Page management
    validatePageNumbers,
    addPageNumber,
    removePageNumber,
    clearPageNumbers,
    setPageRange,
    
    // Utilities
    getEstimatedFileSize
  };
}