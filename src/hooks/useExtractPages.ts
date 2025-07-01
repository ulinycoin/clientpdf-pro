import { useState, useCallback } from 'react';
import { extractPagesService } from '../services/extractPagesService';
import { 
  ExtractPagesState, 
  PageExtractionOptions, 
  PageInfo,
  PageExtractionResult 
} from '../types/pageExtraction.types';
import { downloadFile } from '../utils/fileHelpers';

export const useExtractPages = () => {
  const [state, setState] = useState<ExtractPagesState>({
    file: null,
    pages: [],
    totalPages: 0,
    selectedPages: [],
    isProcessing: false,
    result: null,
    error: null,
    progress: 0
  });

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const loadFile = useCallback(async (file: File) => {
    try {
      setState(prev => ({ 
        ...prev, 
        file, 
        error: null, 
        result: null,
        selectedPages: [],
        pages: [],
        totalPages: 0
      }));

      // Get page count and info
      const totalPages = await extractPagesService.getPageCount(file);
      const pageInfo = await extractPagesService.getPageInfo(file);

      const pages: PageInfo[] = pageInfo.map(info => ({
        pageNumber: info.pageNumber,
        selected: false,
        width: info.width,
        height: info.height
      }));

      setState(prev => ({
        ...prev,
        totalPages,
        pages
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load PDF file';
      setError(errorMessage);
    }
  }, []);

  const selectPage = useCallback((pageNumber: number) => {
    setState(prev => {
      const newSelectedPages = prev.selectedPages.includes(pageNumber)
        ? prev.selectedPages.filter(p => p !== pageNumber)
        : [...prev.selectedPages, pageNumber].sort((a, b) => a - b);

      const newPages = prev.pages.map(page => ({
        ...page,
        selected: newSelectedPages.includes(page.pageNumber)
      }));

      return {
        ...prev,
        selectedPages: newSelectedPages,
        pages: newPages
      };
    });
  }, []);

  const selectPageRange = useCallback((start: number, end: number) => {
    setState(prev => {
      const rangePages: number[] = [];
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        if (i >= 1 && i <= prev.totalPages) {
          rangePages.push(i);
        }
      }

      const newSelectedPages = Array.from(new Set([...prev.selectedPages, ...rangePages]))
        .sort((a, b) => a - b);

      const newPages = prev.pages.map(page => ({
        ...page,
        selected: newSelectedPages.includes(page.pageNumber)
      }));

      return {
        ...prev,
        selectedPages: newSelectedPages,
        pages: newPages
      };
    });
  }, []);

  const selectAllPages = useCallback(() => {
    setState(prev => {
      const allPages = Array.from({ length: prev.totalPages }, (_, i) => i + 1);
      const newPages = prev.pages.map(page => ({
        ...page,
        selected: true
      }));

      return {
        ...prev,
        selectedPages: allPages,
        pages: newPages
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => {
      const newPages = prev.pages.map(page => ({
        ...page,
        selected: false
      }));

      return {
        ...prev,
        selectedPages: [],
        pages: newPages
      };
    });
  }, []);

  const parseAndSelectRange = useCallback((rangeString: string) => {
    try {
      if (!state.file) {
        throw new Error('No file loaded');
      }

      const pages = extractPagesService.parsePageRange(rangeString, state.totalPages);
      
      setState(prev => {
        const newPages = prev.pages.map(page => ({
          ...page,
          selected: pages.includes(page.pageNumber)
        }));

        return {
          ...prev,
          selectedPages: pages,
          pages: newPages,
          error: null
        };
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid page range';
      setError(errorMessage);
    }
  }, [state.file, state.totalPages]);

  const extractPages = useCallback(async (customFileName?: string) => {
    if (!state.file || state.selectedPages.length === 0) {
      setError('Please select pages to extract');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null, progress: 0 }));

    try {
      const options: PageExtractionOptions = {
        selectedPages: state.selectedPages,
        outputFileName: customFileName
      };

      const result: PageExtractionResult = await extractPagesService.extractPages(
        state.file,
        options,
        setProgress
      );

      if (result.success && result.blob) {
        const fileName = customFileName || 
          extractPagesService.generateFileName(state.file.name, state.selectedPages);
        
        downloadFile(result.blob, fileName);
      }

      setState(prev => ({
        ...prev,
        result,
        isProcessing: false,
        error: result.success ? null : result.error || 'Extraction failed'
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract pages';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        result: null
      }));
    }
  }, [state.file, state.selectedPages]);

  const reset = useCallback(() => {
    setState({
      file: null,
      pages: [],
      totalPages: 0,
      selectedPages: [],
      isProcessing: false,
      result: null,
      error: null,
      progress: 0
    });
  }, []);

  // Helper functions
  const getSelectedPagesText = useCallback(() => {
    if (state.selectedPages.length === 0) return 'No pages selected';
    if (state.selectedPages.length === 1) return `Page ${state.selectedPages[0]}`;
    if (state.selectedPages.length === state.totalPages) return 'All pages';
    
    // Show first few and last few if many selected
    if (state.selectedPages.length > 6) {
      const first3 = state.selectedPages.slice(0, 3);
      const last3 = state.selectedPages.slice(-3);
      return `${first3.join(', ')} ... ${last3.join(', ')} (${state.selectedPages.length} total)`;
    }
    
    return state.selectedPages.join(', ');
  }, [state.selectedPages, state.totalPages]);

  const isValidSelection = useCallback(() => {
    return state.selectedPages.length > 0 && state.file !== null;
  }, [state.selectedPages.length, state.file]);

  return {
    // State
    ...state,
    
    // Actions
    loadFile,
    selectPage,
    selectPageRange,
    selectAllPages,
    clearSelection,
    parseAndSelectRange,
    extractPages,
    reset,
    
    // Helpers
    getSelectedPagesText,
    isValidSelection
  };
};
