import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, WifiOff, Loader2, Brain, Sparkles } from 'lucide-react';
import { useOCR } from '../../../hooks/useOCR';
import { useTranslation } from '../../../hooks/useI18n';
import Button from '../../atoms/Button';
// OCRCanvas removed - simplified interface without area selection
import OCRSettings from './components/OCRSettings';
import OCRToolbar from './components/OCRToolbar';
import OCRTextEditor from './components/OCRTextEditor';
import SmartOCRRecommendations from '../../molecules/SmartOCRRecommendations';
import type { OCRStrategyAdvanced } from '../../../services/smartPDFService';
import {
  detectLanguageAdvanced,
  type LanguageDetectionResult
} from '../../../utils/languageDetector';
import { QuickOCR } from '../../../utils/quickOCR';
import { textToPDFGenerator } from '../../../utils/textToPDFGenerator';
import { documentGenerator } from '../../../utils/documentGenerator';

// SelectionArea interface removed - simplified OCR without area selection

interface ModernOCRToolProps {
  files: File[];
  onComplete?: (result: any) => void;
  onClose: () => void;
  className?: string;
}

const ModernOCRTool: React.FC<ModernOCRToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const { t } = useTranslation();

  // AI Enhancement toggle
  const [useAIEnhancement, setUseAIEnhancement] = useState(true);

  // Standard OCR hook
  const standardOCR = useOCR();

  // AI-Enhanced OCR hook

  // Use appropriate OCR based on toggle
  const {
    isProcessing,
    progress,
    result,
    error,
    options,
    supportedLanguages,
    processFile,
    updateOptions,
    resetState,
    downloadResult,
    canProcess,
    getFileTypeInfo,
  } = standardOCR;

  // UI State
  const selectedFile = files[0]; // OCR works with single file
  console.log('ModernOCRTool received files:', files, 'selectedFile:', selectedFile);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [languageDetection, setLanguageDetection] = useState<LanguageDetectionResult | null>(null);
  const [tesseractSupported, setTesseractSupported] = useState<boolean | null>(null);

  // Text editing state
  const [showEditor, setShowEditor] = useState(false);
  const [editedText, setEditedText] = useState<string>('');
  const currentTextRef = useRef<string>(''); // Track current text for closing

  // New: Advanced mode toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [aiRecommendedStrategy, setAiRecommendedStrategy] = useState<OCRStrategyAdvanced | null>(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);

  // Check Tesseract.js support on component mount
  useEffect(() => {
    const checkTesseractSupport = async () => {
      try {
        const hasWorker = typeof Worker !== 'undefined';
        const hasWasm = typeof WebAssembly !== 'undefined';
        const hasCanvas = typeof HTMLCanvasElement !== 'undefined';
        
        if (!hasWorker || !hasWasm || !hasCanvas) {
          setTesseractSupported(false);
          return;
        }

        const tesseract = await import('tesseract.js');
        setTesseractSupported(true);
      } catch (error) {
        console.error('Tesseract.js not supported:', error);
        setTesseractSupported(false);
      }
    };

    checkTesseractSupport();
  }, []);

  // Initialize with provided file
  useEffect(() => {
    const initializeFile = async () => {
      if (selectedFile && canProcess(selectedFile)) {
        setIsLoadingFile(true);
        try {
          setCurrentPage(1);

          // Language detection
          const filenameDetection = detectLanguageAdvanced(selectedFile.name);
          setLanguageDetection(filenameDetection);
          updateOptions({ language: filenameDetection.language });

          // Enhanced content analysis for images - try smart language detection
          const shouldAnalyzeContent = selectedFile.type.startsWith('image/') ||
                                     (selectedFile.type === 'application/pdf' && filenameDetection.confidence !== 'high');

          if (shouldAnalyzeContent) {
            setIsAnalyzing(true);
            try {
              // For images, start with filename-based detection but try Russian first for better coverage
              let bestDetection = filenameDetection;
              
              // If filename suggests Russian or we're not confident, try Russian first
              if (selectedFile.type.startsWith('image/') && (filenameDetection.language === 'rus' || filenameDetection.confidence === 'low')) {
                console.log('🇷🇺 Starting with Russian-optimized detection for image');
                bestDetection = {
                  language: 'rus',
                  confidence: 'medium',
                  details: 'Smart fallback to Russian for image content',
                  detectionMethods: ['image_heuristic']
                };
              }
              
              const contentDetection = await QuickOCR.quickAnalyzeForLanguage(selectedFile);
              
              // Use content detection if it's reliable or if it's for images
              const shouldUseContentDetection = selectedFile.type.startsWith('image/') ||
                                              contentDetection.confidence === 'high' ||
                                              (contentDetection.confidence === 'medium' && filenameDetection.confidence === 'low');

              if (shouldUseContentDetection) {
                setLanguageDetection(contentDetection);
                updateOptions({ language: contentDetection.language });
              } else {
                setLanguageDetection(bestDetection);
                updateOptions({ language: bestDetection.language });
              }
            } catch (error) {
              console.error('Content analysis failed:', error);
              // Fallback to Russian for images if analysis fails
              if (selectedFile.type.startsWith('image/')) {
                const fallbackDetection = {
                  language: 'rus',
                  confidence: 'low' as const,
                  details: 'Fallback to Russian after analysis failure',
                  detectionMethods: ['fallback']
                };
                setLanguageDetection(fallbackDetection);
                updateOptions({ language: fallbackDetection.language });
              }
            } finally {
              setIsAnalyzing(false);
            }
          }
        } finally {
          setIsLoadingFile(false);
        }
      }
    };

    initializeFile();
  }, [selectedFile, canProcess, updateOptions]);

  // Auto-run AI analysis in background
  useEffect(() => {
    const runBackgroundAnalysis = async () => {
      if (!selectedFile || !useAIEnhancement || aiAnalysisComplete) return;

      try {
        console.log('🤖 Running background AI analysis...');
        const { smartPDFService } = await import('../../../services/smartPDFService');

        const recommendations = await smartPDFService.analyzePDFForOCR(selectedFile);

        // Find best strategy (highest confidence)
        const bestStrategy = recommendations.strategies
          .sort((a, b) => b.confidence - a.confidence)[0];

        setAiRecommendedStrategy(bestStrategy);
        setAiAnalysisComplete(true);

        // Show warning if document quality is low
        if (recommendations.documentAnalysis.imageQuality.clarity < 70 ||
            recommendations.documentAnalysis.imageQuality.recommendPreprocessing) {
          setShowQualityWarning(true);
        }

        console.log('✅ AI analysis complete:', bestStrategy.name);
      } catch (error) {
        console.error('❌ Background AI analysis failed:', error);
        setAiAnalysisComplete(true); // Mark as complete even if failed
      }
    };

    runBackgroundAnalysis();
  }, [selectedFile, useAIEnhancement, aiAnalysisComplete]);

  // Handle Smart OCR - one-click processing with AI recommendations
  const handleSmartOCR = async () => {
    if (!selectedFile) return;

    // If AI analysis is complete and we have a recommendation, use it
    if (aiAnalysisComplete && aiRecommendedStrategy) {
      console.log('🤖 Using AI-recommended strategy:', aiRecommendedStrategy.name);
      await handleApplyStrategy(aiRecommendedStrategy);
    } else {
      // Fallback to standard processing
      console.log('📄 Using standard OCR (AI analysis not ready)');
      await processFile(selectedFile);
    }
  };

  // Handle processing - simplified for full document only
  const handleProcess = async () => {
    if (!selectedFile) return;

    console.log('📄 Processing full document:', {
      fileName: selectedFile?.name,
      outputFormat: options.outputFormat
    });

    await processFile(selectedFile);
  };

  // Crop functionality removed - simplified interface for full document processing only


  // Handle reset
  const handleReset = () => {
    setLanguageDetection(null);
    setCurrentPage(1);
    setTotalPages(1);
    setShowEditor(false);
    setEditedText('');
    resetState();
  };

  // Handle AI strategy application
  const handleApplyStrategy = async (strategy: OCRStrategyAdvanced) => {
    console.log('🎯 Applying OCR strategy:', strategy.id, strategy.settings);

    // Update OCR options based on strategy settings
    updateOptions({
      language: strategy.settings.languages.join('+'),
      preserveLayout: strategy.settings.preserveLayout,
      outputFormat: options.outputFormat, // Keep user's output format choice
      imagePreprocessing: strategy.settings.preprocessImage
    });

    // Auto-trigger processing with the new settings
    if (selectedFile) {
      await handleProcess();
    }
  };

  // Handle text editor actions
  const handleEditText = () => {
    if (result && result.result?.text) {
      setEditedText(result.result.text);
      currentTextRef.current = result.result.text; // Initialize ref with original text
      setShowEditor(true);
    }
  };

  const handleSaveEditedText = (newText: string) => {
    setEditedText(newText);
    currentTextRef.current = newText; // Update ref with current text
    // Just update local state for now - don't trigger parent update during editing
    console.log('Text saved locally:', newText.substring(0, 50) + '...');
  };

  const handleFinalSave = async (textToSave?: string) => {
    // This is called when user closes editor or wants to apply changes
    const finalText = textToSave || editedText;
    console.log('handleFinalSave called with:', finalText?.substring(0, 50) + '...', 'original:', result?.result?.text?.substring(0, 50) + '...');
    
    if (result && finalText !== result.result?.text) {
      // Preserve the original outputFormat choice from OCR settings
      const originalOutputFormat = result.result?.originalOutputFormat || result.result?.outputFormat || options.outputFormat;
      console.log('🎯 Original output format:', originalOutputFormat);
      
      let newDownloadUrl: string;
      let mimeType: string;
      
      try {
        if (originalOutputFormat === 'searchable-pdf') {
          console.log('📄 Generating PDF from edited text...');
          
          // Generate PDF from edited text
          const originalName = selectedFile?.name || 'document';
          const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');
          
          const pdfBlob = await textToPDFGenerator.generatePDF(
            finalText,
            `${baseName}_edited_ocr`,
            {
              fontSize: 11,
              pageSize: 'A4',
              orientation: 'portrait',
              margins: 50,
              lineHeight: 1.4
            }
          );
          
          newDownloadUrl = URL.createObjectURL(pdfBlob);
          mimeType = 'application/pdf';
          console.log('✅ PDF generated successfully:', pdfBlob.size, 'bytes');
        } else if (originalOutputFormat === 'docx') {
          console.log('📄 Generating DOCX from edited text...');

          const originalName = selectedFile?.name || 'document';
          const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');

          // Prepare metadata for document
          const metadata = {
            confidence: result.result?.confidence,
            processingTime: result.processingTime,
            wordsCount: result.result?.words?.length || 0,
            language: supportedLanguages.find(lang => lang.code === options.language)?.name || options.language,
            originalFileName: selectedFile?.name
          };
          
          const docxBlob = await documentGenerator.generateDOCX(
            finalText,
            metadata,
            {
              title: `${baseName} - OCR Results`,
              author: 'LocalPDF OCR Tool',
              subject: 'OCR Extracted Text',
              fontSize: 11,
              fontFamily: 'Times New Roman',
              includeMetadata: true
            }
          );
          
          newDownloadUrl = URL.createObjectURL(docxBlob);
          mimeType = documentGenerator.getMimeType('docx');
          console.log('✅ DOCX generated successfully:', docxBlob.size, 'bytes');
        } else if (originalOutputFormat === 'rtf') {
          console.log('📄 Generating RTF from edited text...');

          const originalName = selectedFile?.name || 'document';
          const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');

          // Prepare metadata for document
          const metadata = {
            confidence: result.result?.confidence,
            processingTime: result.processingTime,
            wordsCount: result.result?.words?.length || 0,
            language: supportedLanguages.find(lang => lang.code === options.language)?.name || options.language,
            originalFileName: selectedFile?.name
          };
          
          const rtfBlob = documentGenerator.generateRTF(
            finalText,
            metadata,
            {
              title: `${baseName} - OCR Results`,
              author: 'LocalPDF OCR Tool',
              fontSize: 11,
              fontFamily: 'Times New Roman',
              includeMetadata: true
            }
          );
          
          newDownloadUrl = URL.createObjectURL(rtfBlob);
          mimeType = documentGenerator.getMimeType('rtf');
          console.log('✅ RTF generated successfully:', rtfBlob.size, 'bytes');
        } else {
          console.log('📝 Creating text blob from edited text...');
          // Create text blob for 'text' output format
          const textBlob = new Blob([finalText], { type: 'text/plain;charset=utf-8' });
          newDownloadUrl = URL.createObjectURL(textBlob);
          mimeType = 'text/plain';
        }
        
        // Clean up old URL if it exists
        if (result.downloadUrl && result.downloadUrl.startsWith('blob:')) {
          URL.revokeObjectURL(result.downloadUrl);
        }
        
        const updatedResult = {
          ...result,
          result: {
            ...result.result,
            text: finalText,
            isEdited: true,
            outputFormat: originalOutputFormat, // Preserve original choice
            originalOutputFormat: originalOutputFormat // Keep track of original choice
          },
          downloadUrl: newDownloadUrl,
          mimeType: mimeType
        };
        
        console.log('Final save - updating parent with edited content:', {
          textLength: finalText.length,
          outputFormat: originalOutputFormat,
          mimeType: mimeType
        });
        
        // Trigger parent component update through onComplete
        if (onComplete) {
          onComplete(updatedResult);
        }
        
      } catch (error) {
        console.error('❌ Failed to generate blob for edited text:', error);
        
        // Fallback to text format if PDF generation fails
        console.log('🔄 Falling back to text format...');
        const fallbackBlob = new Blob([finalText], { type: 'text/plain;charset=utf-8' });
        const fallbackUrl = URL.createObjectURL(fallbackBlob);
        
        // Clean up old URL if it exists
        if (result.downloadUrl && result.downloadUrl.startsWith('blob:')) {
          URL.revokeObjectURL(result.downloadUrl);
        }
        
        const fallbackResult = {
          ...result,
          result: {
            ...result.result,
            text: finalText,
            isEdited: true,
            outputFormat: 'text', // Fallback to text
            originalOutputFormat: originalOutputFormat,
            error: 'PDF generation failed, saved as text'
          },
          downloadUrl: fallbackUrl,
          mimeType: 'text/plain'
        };
        
        if (onComplete) {
          onComplete(fallbackResult);
        }
      }
    } else {
      console.log('Final save - no changes detected or no result available');
    }
  };

  const handleScrollToResults = () => {
    // Close editor and scroll to results
    setShowEditor(false);
    
    // Small delay to ensure editor closes first, then scroll
    setTimeout(() => {
      // Find the results section and scroll to it smoothly
      const resultsElement = document.querySelector('[data-ocr-results]') || 
                            document.querySelector('.bg-white\\/90[class*="backdrop-blur"]') ||
                            document.querySelector('[class*="CheckCircle"]')?.closest('.bg-white');
      
      if (resultsElement) {
        resultsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      } else {
        // Fallback: scroll to top
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
    }, 150);
  };

  const handleDownloadEditedText = async (text: string, format: 'txt' | 'pdf' | 'docx' | 'rtf') => {
    if (format === 'txt') {
      try {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const originalName = selectedFile?.name || 'document';
        const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');
        const fileName = `${baseName}_edited_ocr.txt`;
        
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ Text file downloaded:', fileName);
      } catch (error) {
        console.error('❌ Failed to download text file:', error);
      }
    } else if (format === 'pdf') {
      try {
        console.log('📄 Generating PDF for immediate download...');
        
        const originalName = selectedFile?.name || 'document';
        const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');
        const fileName = `${baseName}_edited_ocr.pdf`;
        
        const pdfBlob = await textToPDFGenerator.generatePDF(
          text,
          baseName,
          {
            fontSize: 11,
            pageSize: 'A4',
            orientation: 'portrait',
            margins: 50,
            lineHeight: 1.4
          }
        );
        
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ PDF file downloaded:', fileName, pdfBlob.size, 'bytes');
      } catch (error) {
        console.error('❌ Failed to download PDF file:', error);
        alert('PDF генерация не удалась. Попробуйте скачать как текстовый файл.');
      }
    } else if (format === 'docx') {
      try {
        console.log('📄 Generating DOCX for immediate download...');
        
        const originalName = selectedFile?.name || 'document';
        const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');
        const fileName = `${baseName}_edited_ocr.docx`;
        
        // Prepare metadata for document
        const metadata = {
          confidence: result?.result.confidence,
          processingTime: result?.processingTime,
          wordsCount: result?.result.words?.length || 0,
          language: supportedLanguages.find(lang => lang.code === options.language)?.name || options.language,
          originalFileName: selectedFile?.name
        };
        
        const docxBlob = await documentGenerator.generateDOCX(
          text,
          metadata,
          {
            title: `${baseName} - OCR Results`,
            author: 'LocalPDF OCR Tool',
            subject: 'OCR Extracted Text',
            fontSize: 11,
            fontFamily: 'Times New Roman',
            includeMetadata: true
          }
        );
        
        const url = URL.createObjectURL(docxBlob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ DOCX file downloaded:', fileName, docxBlob.size, 'bytes');
      } catch (error) {
        console.error('❌ Failed to download DOCX file:', error);
        alert('DOCX генерация не удалась. Попробуйте скачать как текстовый файл.');
      }
    } else if (format === 'rtf') {
      try {
        console.log('📄 Generating RTF for immediate download...');
        
        const originalName = selectedFile?.name || 'document';
        const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');
        const fileName = `${baseName}_edited_ocr.rtf`;
        
        // Prepare metadata for document
        const metadata = {
          confidence: result?.result.confidence,
          processingTime: result?.processingTime,
          wordsCount: result?.result.words?.length || 0,
          language: supportedLanguages.find(lang => lang.code === options.language)?.name || options.language,
          originalFileName: selectedFile?.name
        };
        
        const rtfBlob = documentGenerator.generateRTF(
          text,
          metadata,
          {
            title: `${baseName} - OCR Results`,
            author: 'LocalPDF OCR Tool',
            fontSize: 11,
            fontFamily: 'Times New Roman',
            includeMetadata: true
          }
        );
        
        const url = URL.createObjectURL(rtfBlob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ RTF file downloaded:', fileName, rtfBlob.size, 'bytes');
      } catch (error) {
        console.error('❌ Failed to download RTF file:', error);
        alert('RTF генерация не удалась. Попробуйте скачать как текстовый файл.');
      }
    }
  };

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile) : null;

  // Show loading state while checking Tesseract support
  if (tesseractSupported === null) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`} style={{ height: 'calc(100vh - 60px)', minHeight: '800px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('tools.ocr.loading.title') || 'Initializing OCR Engine...'}
            </h3>
            <p className="text-gray-600">
              {t('tools.ocr.loading.description') || 'Checking browser compatibility and loading OCR components...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if Tesseract is not supported
  if (tesseractSupported === false) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`} style={{ height: 'calc(100vh - 60px)', minHeight: '800px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-800 mb-4">
              {t('tools.ocr.unsupported.title') || 'OCR Not Available'}
            </h3>
            <div className="text-gray-700 space-y-3 mb-6">
              <p>
                {t('tools.ocr.unsupported.description') || 
                 'OCR functionality requires modern browser features that are not available in your current browser.'}
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              {t('common.retry') || 'Retry'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no file provided
  if (!selectedFile) {
    return (
      <div className={`max-w-3xl mx-auto ${className}`}>
        <div className={`bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg p-8 text-center`}>
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white mb-4">
            {t('tools.ocr.fileNotSelected') || 'No File Selected'}
          </h2>
          <p className="text-gray-800 dark:text-gray-100 font-medium mb-6">
            {t('tools.ocr.fileNotSelectedDescription') || 'Please select a file to process with OCR.'}
          </p>
          <button
            onClick={onClose}
            className="btn-ocean-modern"
          >
            {t('common.back') || 'Back'}
          </button>
        </div>
      </div>
    );
  }

  // Main OCR interface - use similar styling to ModernRotateTool
  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              {useAIEnhancement ? <Brain className="w-8 h-8" /> : '🔍'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-black dark:text-white">
                {useAIEnhancement
                  ? (t('tools.ocr.aiTitle') || 'AI-Enhanced OCR')
                  : (t('tools.ocr.title') || 'OCR Text Recognition')
                }
              </h2>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {selectedFile.name} • {((selectedFile.size || 0) / 1024 / 1024).toFixed(1)} {t('common.fileSizeUnit') || 'MB'}
              </p>
            </div>
          </div>

          {/* AI Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Standard OCR
              </span>
              <button
                onClick={() => setUseAIEnhancement(!useAIEnhancement)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  useAIEnhancement
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={useAIEnhancement}
              >
                <span className="sr-only">Toggle AI Enhancement</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    useAIEnhancement ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Brain className="w-4 h-4 text-blue-500" />
                AI Enhanced
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 disabled:opacity-50"
            aria-label={t('common.close') || 'Close'}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('tools.ocr.trustIndicators.private') || 'Private & Secure'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('tools.ocr.trustIndicators.quality') || 'High Quality OCR'}
            </span>
          </div>
        </div>
      </div>

      {/* Smart OCR Main Action - Simple Mode */}
      {!result && !isProcessing && selectedFile && !showAdvanced && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-lg border border-blue-200/50 dark:border-blue-800/50 rounded-2xl shadow-lg p-8 mb-6">
          {/* AI Analysis Status */}
          {!aiAnalysisComplete && useAIEnhancement && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                🤖 AI analyzing document...
              </span>
            </div>
          )}

          {/* Quality Warning - only show if needed */}
          {showQualityWarning && aiAnalysisComplete && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-1">
                    Document Quality Issues Detected
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
                    AI has detected low image quality. We recommend using High Accuracy mode for better results.
                  </p>
                  <button
                    onClick={() => setShowAdvanced(true)}
                    className="text-sm font-medium text-yellow-900 dark:text-yellow-300 underline hover:no-underline"
                  >
                    View recommended settings →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Smart OCR Button */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to extract text
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {useAIEnhancement && aiAnalysisComplete
                ? "AI has analyzed your document and selected optimal settings"
                : "Click below to start text recognition"}
            </p>

            <button
              onClick={handleSmartOCR}
              disabled={isProcessing || (useAIEnhancement && !aiAnalysisComplete)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {useAIEnhancement ? (
                <>
                  <Brain className="w-6 h-6" />
                  <span>Start Smart OCR</span>
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6" />
                  <span>Start OCR</span>
                </>
              )}
            </button>

            {/* Advanced Settings Toggle */}
            <div className="mt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 mx-auto group"
              >
                <svg
                  className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Advanced Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Section - Collapsible Advanced Mode */}
      {showAdvanced && useAIEnhancement && !result && !isProcessing && selectedFile && (
        <div className="mb-6 animate-in slide-in-from-top duration-300">
          <SmartOCRRecommendations
            file={selectedFile}
            onApplyStrategy={handleApplyStrategy}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Settings Panel - Only show in Advanced mode or when processing/complete */}
        {(showAdvanced || isProcessing || result) && (
          <OCRSettings
            selectedFile={selectedFile}
            fileInfo={fileInfo}
            options={options}
            supportedLanguages={supportedLanguages}
            onOptionsChange={updateOptions}
            languageDetection={languageDetection}
            isAnalyzing={isAnalyzing}
            isProcessing={isProcessing}
            progress={progress}
            result={result}
            error={error}
            onProcess={handleProcess}
            onDownload={downloadResult}
            onReset={handleReset}
          />
        )}

        {/* Results and Preview area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden m-4">
            {showEditor && result ? (
              // Text Editor
              <OCRTextEditor
                initialText={editedText || result.result?.text || ''}
                originalFileName={selectedFile?.name || 'document'}
                confidence={result.result?.confidence || 0}
                processingTime={result.processingTime || 0}
                wordsCount={result.result?.words?.length || 0}
                onSave={handleSaveEditedText}
                onDownload={handleDownloadEditedText}
                onApplyChanges={(text) => {
                  setEditedText(text); // Update local state
                  handleFinalSave(text); // Apply changes immediately with the text
                }}
                onScrollToResults={handleScrollToResults}
                onClose={() => {
                  handleFinalSave(currentTextRef.current || editedText); // Save changes before closing with current text
                  setShowEditor(false);
                }}
                className="h-full"
              />
            ) : result ? (
              // OCR Results Display - A4 page size (1122px height at 96 DPI)
              <div className="h-full max-h-[1122px] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                {/* Results Header */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      OCR Results
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleEditText}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                        </svg>
                        {t('tools.ocr.buttons.editText') || 'Edit Text'}
                      </Button>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Confidence: {(result?.result?.confidence || 0).toFixed(1)}%</span>
                        <span>Words: {result?.result?.words?.length || 0}</span>
                        <span>Time: {((result?.processingTime || 0) / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable Text Content - A4 height minus header */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" style={{ maxHeight: '950px' }}>
                  {result.result?.text && result.result.text.trim() ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Extracted Text:</h4>
                        <div className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed font-mono" style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {result.result.text.split('\n').map((line, index) => {
                            // Highlight page separators
                            if (line.startsWith('═══')) {
                              return <div key={index} className="text-blue-600 dark:text-blue-400 font-bold my-1">{line}</div>;
                            }
                            // Highlight page numbers
                            if (line.match(/^PAGE \d+$/)) {
                              return <div key={index} className="text-blue-700 dark:text-blue-300 font-bold text-center my-1 bg-blue-50 dark:bg-blue-900/30 py-1 px-2 rounded">{line}</div>;
                            }
                            // Regular line
                            return <div key={index}>{line || '\u00A0'}</div>;
                          })}
                        </div>
                      </div>

                      {/* Character and word count */}
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div>Characters: {result.result?.text?.length || 0}</div>
                        <div>Lines: {result.result?.text?.split('\n').length || 0}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8 max-w-md">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No Text Found
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                          OCR processing completed but no text was detected in the document.
                        </p>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                          <h4 className="font-medium text-yellow-800 mb-2">💡 Troubleshooting Tips:</h4>
                          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                            <li>Check if the correct language is selected (Russian for Cyrillic text)</li>
                            <li>Ensure the document contains readable text (not handwritten)</li>
                            <li>Try enabling "Image Preprocessing" in Advanced Options</li>
                            <li>Verify the image quality is clear and high resolution</li>
                          </ul>
                        </div>

                        {/* Diagnostic Information */}
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                          <h4 className="font-medium text-gray-700 mb-2">🔍 Diagnostic Info:</h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Language: {options.language}</div>
                            <div>Output Format: {options.outputFormat}</div>
                            <div>Confidence: {(result.result?.confidence || 0).toFixed(1)}%</div>
                            <div>Words Found: {result.result?.words?.length || 0}</div>
                            <div>Processing Time: {((result.processingTime || 0) / 1000).toFixed(1)}s</div>
                          </div>
                        </div>

                        {/* Quick retry button */}
                        <div className="mt-4">
                          <Button
                            onClick={() => {
                              // Reset result and try again
                              resetState();
                              setTimeout(() => handleProcess(), 100);
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300"
                          >
                            🔄 Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : isProcessing ? (
              // Processing State
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Processing Document...
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {progress?.status === 'recognizing text' 
                      ? `Recognizing text... ${Math.round(progress?.progress || 0)}%`
                      : progress?.status || 'Initializing OCR engine...'
                    }
                  </p>
                  {progress?.progress && (
                    <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedFile ? (
              // File Ready State
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Document Ready for OCR
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Configure OCR settings and click "Extract Text with OCR" to begin
                  </p>
                </div>
              </div>
            ) : (
              // Ready State
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Document Ready for OCR
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Configure OCR settings and click "Extract Text with OCR" to begin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernOCRTool;