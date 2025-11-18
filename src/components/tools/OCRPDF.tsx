import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useSharedFile } from '@/hooks/useSharedFile';
import * as Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { detectLanguageAdvanced, type LanguageDetectionResult } from '@/utils/languageDetector';
import { QuickOCR } from '@/utils/quickOCR';
import { OCRWorkerManager } from '@/utils/ocrWorkerManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const DEFAULT_LANGUAGE = 'eng';

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  pagesProcessed: number;
  hocr?: string; // hOCR format (HTML with text positioning)
  tsv?: string;  // TSV format (tab-separated values)
}

type PageSelectionMode = 'all' | 'range' | 'first';
type OutputFormat = 'text' | 'searchable-pdf' | 'hocr' | 'tsv';

// Supported languages for OCR
const SUPPORTED_LANGUAGES = [
  // Major European languages
  { code: 'eng', name: 'English', nativeName: 'English' },
  { code: 'rus', name: 'Russian', nativeName: 'Русский' },
  { code: 'deu', name: 'German', nativeName: 'Deutsch' },
  { code: 'fra', name: 'French', nativeName: 'Français' },
  { code: 'spa', name: 'Spanish', nativeName: 'Español' },
  { code: 'ita', name: 'Italian', nativeName: 'Italiano' },
  { code: 'por', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pol', name: 'Polish', nativeName: 'Polski' },

  // Baltic languages
  { code: 'lav', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lit', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'est', name: 'Estonian', nativeName: 'Eesti' },

  // Nordic languages
  { code: 'swe', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'nor', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'dan', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fin', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'isl', name: 'Icelandic', nativeName: 'Íslenska' },

  // Eastern European languages
  { code: 'ukr', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'bel', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'ces', name: 'Czech', nativeName: 'Čeština' },
  { code: 'slk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'slv', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'hrv', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'srp', name: 'Serbian', nativeName: 'Српски' },
  { code: 'bul', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'mkd', name: 'Macedonian', nativeName: 'Македонски' },

  // Western European languages
  { code: 'nld', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'cat', name: 'Catalan', nativeName: 'Català' },
  { code: 'glg', name: 'Galician', nativeName: 'Galego' },
  { code: 'eus', name: 'Basque', nativeName: 'Euskara' },

  // Southern European languages
  { code: 'ron', name: 'Romanian', nativeName: 'Română' },
  { code: 'hun', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ell', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'tur', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'sqi', name: 'Albanian', nativeName: 'Shqip' },

  // Asian languages
  { code: 'chi_sim', name: 'Chinese Simplified', nativeName: '简体中文' },
  { code: 'chi_tra', name: 'Chinese Traditional', nativeName: '繁體中文' },
  { code: 'jpn', name: 'Japanese', nativeName: '日本語' },
  { code: 'kor', name: 'Korean', nativeName: '한국어' },
  { code: 'hin', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'tha', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vie', name: 'Vietnamese', nativeName: 'Tiếng Việt' },

  // Middle Eastern languages
  { code: 'ara', name: 'Arabic', nativeName: 'العربية' },
  { code: 'heb', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fas', name: 'Persian', nativeName: 'فارسی' },
];

export const OCRPDF: React.FC = () => {
  const { sharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<OCRResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [languageDetection, setLanguageDetection] = useState<LanguageDetectionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageMode, setPageMode] = useState<PageSelectionMode>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('text');
  const [showSettings, setShowSettings] = useState(false);
  const [editedText, setEditedText] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Auto-load shared file from WelcomeScreen
  useEffect(() => {
    if (sharedFile && !file) {
      const loadedFile = new File([sharedFile.blob], sharedFile.name, {
        type: sharedFile.blob.type,
      });

      // Check if file type is supported by OCR
      const fileExt = loadedFile.name.toLowerCase().split('.').pop();
      const supportedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

      if (fileExt && supportedExtensions.includes(fileExt)) {
        handleFilesSelected([loadedFile]);
      } else {
        alert(`OCR only supports PDF and image files (JPG, PNG). Your file type (.${fileExt}) is not supported.`);
      }

      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Advanced language detection using new utilities
  const performLanguageDetection = async (file: File): Promise<void> => {
    setIsAnalyzing(true);
    try {
      // Step 1: Filename-based detection
      const filenameDetection = detectLanguageAdvanced(file.name);
      setLanguageDetection(filenameDetection);
      setSelectedLanguage(filenameDetection.language);

      // Step 2: Content analysis for better detection (especially for images)
      const shouldAnalyzeContent = file.type.startsWith('image/') ||
        (file.type === 'application/pdf' && filenameDetection.confidence !== 'high');

      if (shouldAnalyzeContent && autoDetectLanguage) {
        setProgressMessage('Analyzing document content...');
        const contentDetection = await QuickOCR.quickAnalyzeForLanguage(file);

        // For images, prefer content detection over filename
        const shouldUseContentDetection = file.type.startsWith('image/') ||
          contentDetection.confidence === 'high' ||
          (contentDetection.confidence === 'medium' && filenameDetection.confidence === 'low');

        if (shouldUseContentDetection) {
          setLanguageDetection(contentDetection);
          setSelectedLanguage(contentDetection.language);
        }
      }
    } catch (error) {
      console.error('Language detection failed:', error);
    } finally {
      setIsAnalyzing(false);
      setProgressMessage('');
    }
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    // Perform advanced language detection
    await performLanguageDetection(selectedFile);

    // Get total pages for PDF
    if (selectedFile.type === 'application/pdf') {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        setTotalPages(numPages);
        setPageRange({ start: 1, end: numPages });

        // Render first page as preview
        if (numPages > 0) {
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const url = canvas.toDataURL();
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error('Failed to load PDF:', error);
      }
    } else if (selectedFile.type.startsWith('image/')) {
      setTotalPages(1);
      setPageRange({ start: 1, end: 1 });
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setPreviewUrl(null);
    setProgress(0);
    setProgressMessage('');
    setTotalPages(1);
    setPageRange({ start: 1, end: 1 });
    setLanguageDetection(null);
    setIsAnalyzing(false);
  };

  const extractImageFromPDF = async (file: File, pageNum: number): Promise<HTMLCanvasElement> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas;
  };

  const handleOCR = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setProgressMessage('Initializing OCR engine...');

    try {
      // Determine pages to process
      let pagesToProcess: number[] = [];
      if (file.type.startsWith('image/')) {
        pagesToProcess = [1];
      } else {
        if (pageMode === 'first') {
          pagesToProcess = [1];
        } else if (pageMode === 'range') {
          const start = Math.max(1, pageRange.start);
          const end = Math.min(totalPages, pageRange.end);
          for (let i = start; i <= end; i++) {
            pagesToProcess.push(i);
          }
        } else { // 'all'
          for (let i = 1; i <= totalPages; i++) {
            pagesToProcess.push(i);
          }
        }
      }

      // If user wants searchable PDF, we'll skip text extraction and create it in handleDownload
      // For other formats, we need to extract data
      if (outputFormat !== 'searchable-pdf') {
        // Get reusable worker from manager
        setProgressMessage('Loading language model...');
        const worker = await OCRWorkerManager.getWorker(selectedLanguage);

        let combinedText = '';
        let combinedHOCR = '';
        let combinedTSV = '';
        let totalConfidence = 0;

        // For hOCR, we need to wrap pages in proper structure
        if (outputFormat === 'hocr') {
          combinedHOCR = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="ocr-system" content="tesseract.js">
  <meta name="ocr-capabilities" content="ocr_page ocr_carea ocr_par ocr_line ocrx_word">
  <title>OCR Result</title>
  <style>
    /* Basic styles for hOCR visualization */
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    .ocr_page {
      background: white;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .ocr_line {
      display: block;
      margin: 5px 0;
    }
    .ocrx_word {
      display: inline;
      margin-right: 5px;
    }
    /* Show confidence scores on hover */
    .ocrx_word:hover::after {
      content: attr(title);
      position: absolute;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
    }
  </style>
</head>
<body>
`;
        }

        // For TSV, add header
        if (outputFormat === 'tsv') {
          combinedTSV = 'level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n';
        }

        // Process each page
        for (let i = 0; i < pagesToProcess.length; i++) {
          const pageNum = pagesToProcess[i];
          const pageProgress = (i / pagesToProcess.length) * 100;

          setProgressMessage(`Processing page ${pageNum} of ${pagesToProcess.length}...`);
          setProgress(Math.round(pageProgress));

          let imageToProcess: string | HTMLCanvasElement;

          if (file.type.startsWith('image/')) {
            imageToProcess = URL.createObjectURL(file);
          } else {
            const canvas = await extractImageFromPDF(file, pageNum);
            imageToProcess = canvas;
          }

          // Perform OCR (Tesseract.js always returns all formats)
          const { data } = await worker.recognize(imageToProcess);

          // Accumulate data based on format
          if (outputFormat === 'text') {
            // Add page separator for multi-page documents
            if (i > 0) {
              combinedText += '\n\n' + '='.repeat(50) + '\n';
              combinedText += `Page ${pageNum}\n`;
              combinedText += '='.repeat(50) + '\n\n';
            }
            combinedText += data.text;
          } else if (outputFormat === 'hocr') {
            // Get hOCR from data
            const hocrData = data.hocr;

            if (hocrData) {
              // Extract body content from hOCR (skip html/head tags)
              const hocrBody = hocrData.match(/<body[^>]*>([\s\S]*)<\/body>/i);
              if (hocrBody && hocrBody[1]) {
                combinedHOCR += `  <!-- Page ${pageNum} -->\n${hocrBody[1]}\n`;
              } else {
                // If regex fails, just add the whole hOCR
                console.warn('Could not extract body from hOCR, using full hOCR');
                combinedHOCR += `  <!-- Page ${pageNum} -->\n${hocrData}\n`;
              }
            } else {
              console.error('hOCR data is missing from Tesseract result');
            }
          } else if (outputFormat === 'tsv') {
            // Get TSV from data
            const tsvData = data.tsv;

            if (tsvData) {
              // Add TSV data (skip header line from each page after first)
              const tsvLines = tsvData.split('\n');
              const dataLines = i === 0 ? tsvLines.slice(1) : tsvLines.slice(1);
              combinedTSV += dataLines.join('\n') + '\n';
            } else {
              console.error('TSV data is missing from Tesseract result');
            }
          }

          totalConfidence += data.confidence;
        }

        // Finalize hOCR
        if (outputFormat === 'hocr') {
          combinedHOCR += '</body>\n</html>';
        }

        const avgConfidence = totalConfidence / pagesToProcess.length;

        const ocrResult: OCRResult = {
          text: outputFormat === 'text' ? combinedText : '',
          confidence: avgConfidence,
          language: selectedLanguage,
          pagesProcessed: pagesToProcess.length,
        };

        if (outputFormat === 'hocr') {
          ocrResult.hocr = combinedHOCR;
          console.log('📄 hOCR data length:', combinedHOCR.length, 'characters');
        } else if (outputFormat === 'tsv') {
          ocrResult.tsv = combinedTSV;
          console.log('📊 TSV data length:', combinedTSV.length, 'characters');
        }

        setResult(ocrResult);
        setEditedText(combinedText); // Initialize editable text (for text format only)
        setIsEditMode(false); // Start in view mode

        setProgress(100);
        setProgressMessage('OCR completed!');

        // Don't cleanup worker - let manager handle it for reuse
      } else {
        // For searchable PDF, just set a placeholder result
        // Actual OCR will happen during download
        setResult({
          text: '(Searchable PDF will be created during download)',
          confidence: 0,
          language: selectedLanguage,
          pagesProcessed: pagesToProcess.length,
        });
        setProgress(100);
        setProgressMessage('Ready to create searchable PDF!');
      }

    } catch (error) {
      console.error('OCR error:', error);
      alert('OCR processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = editedText || result?.text;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      alert('Text copied to clipboard!');
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    const baseName = file.name.replace(/\.[^.]+$/, '');

    try {
      if (outputFormat === 'hocr') {
        // Download hOCR format
        const hocrContent = result.hocr || '';
        console.log('💾 Downloading hOCR, length:', hocrContent.length, 'characters');
        console.log('📝 First 200 chars:', hocrContent.substring(0, 200));
        console.log('📝 Last 200 chars:', hocrContent.substring(hocrContent.length - 200));

        if (hocrContent.length === 0) {
          alert('hOCR data is empty. Please try running OCR again.');
          return;
        }

        const blob = new Blob([hocrContent], { type: 'text/html;charset=utf-8' });
        console.log('📦 Blob created, size:', blob.size, 'bytes, type:', blob.type);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_ocr.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (outputFormat === 'tsv') {
        // Download TSV format
        const tsvContent = result.tsv || '';
        console.log('💾 Downloading TSV, length:', tsvContent.length, 'characters');

        if (tsvContent.length === 0) {
          alert('TSV data is empty. Please try running OCR again.');
          return;
        }

        const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_ocr.tsv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (outputFormat === 'text') {
        // Download as plain text
        const textToDownload = editedText || result.text;
        const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_ocr.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (outputFormat === 'searchable-pdf') {
        // Generate REAL searchable PDF with invisible text layer over original images
        setIsProcessing(true);
        setProgress(0);

        try {
          // Import the searchable PDF generator
          const { createSearchablePDF, createSearchablePDFFromImage } = await import('@/utils/searchablePDFGenerator');

          // Determine pages to process (same logic as handleOCR)
          let pagesToProcess: number[] = [];
          if (file.type.startsWith('image/')) {
            pagesToProcess = [1];
          } else {
            if (pageMode === 'first') {
              pagesToProcess = [1];
            } else if (pageMode === 'range') {
              const start = Math.max(1, pageRange.start);
              const end = Math.min(totalPages, pageRange.end);
              for (let i = start; i <= end; i++) {
                pagesToProcess.push(i);
              }
            } else { // 'all'
              for (let i = 1; i <= totalPages; i++) {
                pagesToProcess.push(i);
              }
            }
          }

          let pdfBlob: Blob;

          if (file.type.startsWith('image/')) {
            // For images, use image-specific function
            pdfBlob = await createSearchablePDFFromImage(
              file,
              selectedLanguage,
              (progress, message) => {
                setProgress(progress);
                setProgressMessage(message);
              }
            );
          } else {
            // For PDFs, use PDF-specific function
            pdfBlob = await createSearchablePDF(
              file,
              selectedLanguage,
              pagesToProcess,
              (progress, message) => {
                setProgress(progress);
                setProgressMessage(message);
              }
            );
          }

          // Download the searchable PDF
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${baseName}_searchable.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setProgressMessage('Searchable PDF downloaded!');
          setTimeout(() => setProgressMessage(''), 2000);

        } catch (pdfError) {
          console.error('Searchable PDF generation error:', pdfError);
          alert(`Failed to create searchable PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
          setProgressMessage('');
        } finally {
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate file. Please try again.');
      setProgressMessage('');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    handleRemoveFile();
  };

  return (
    <div className="ocr-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          OCR PDF
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Extract text from scanned PDFs
        </p>
      </div>

      {/* File Upload */}
      {!file && (
        <Card className="p-6">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".pdf,.jpg,.jpeg,.png"
            maxFiles={1}
            maxSizeMB={50}
          />
        </Card>
      )}

      {/* File Preview & Settings */}
      {file && !result && (
        <Card className="p-6 space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📄</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleRemoveFile}
              variant="secondary"
              size="sm"
              disabled={isProcessing}
            >
              Remove
            </Button>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 rounded shadow-md"
              />
            </div>
          )}

          {/* Page Selection (for PDF) */}
          {file.type === 'application/pdf' && totalPages > 1 && (
            <div>
              <Label className="block text-sm font-medium mb-2">
                Pages to process
              </Label>
              <RadioGroup
                value={pageMode}
                onValueChange={(value) => setPageMode(value as PageSelectionMode)}
                disabled={isProcessing}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="first" id="first" />
                  <Label htmlFor="first" className="text-sm font-normal cursor-pointer">
                    First page only
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-sm font-normal cursor-pointer">
                    All pages ({totalPages} pages)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range" className="text-sm font-normal cursor-pointer">
                    Page range
                  </Label>
                </div>
              </RadioGroup>
              {pageMode === 'range' && (
                <div className="ml-6 flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageRange.start}
                    onChange={(e) => setPageRange({ ...pageRange, start: parseInt(e.target.value) || 1 })}
                    disabled={isProcessing}
                    className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  />
                  <span className="text-sm text-gray-500">—</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageRange.end}
                    onChange={(e) => setPageRange({ ...pageRange, end: parseInt(e.target.value) || totalPages })}
                    disabled={isProcessing}
                    className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Language Selection with Detection Info */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              Recognition language
            </Label>

            {/* Language Detection Info */}
            {languageDetection && !isAnalyzing && (
              <div className={`mb-3 p-3 rounded-lg border ${
                languageDetection.confidence === 'high' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                languageDetection.confidence === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {languageDetection.confidence === 'high' ? '✅ High Confidence' :
                     languageDetection.confidence === 'medium' ? '⚠️ Medium Confidence' :
                     '❌ Low Confidence'}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage})
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {languageDetection.details}
                </p>
                {languageDetection.confidence !== 'high' && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    💡 Verify language selection for better OCR accuracy
                  </p>
                )}
              </div>
            )}

            {/* Analyzing state */}
            {isAnalyzing && (
              <div className="mb-3 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Analyzing document content...
                  </span>
                </div>
              </div>
            )}

            {/* Auto-detect toggle */}
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={autoDetectLanguage}
                onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                disabled={isProcessing}
                className="rounded text-ocean-500 focus:ring-ocean-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-detect language
              </span>
            </label>

            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              disabled={isProcessing || (autoDetectLanguage && isAnalyzing)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {autoDetectLanguage ? 'Language will be detected automatically from document content' : 'Select the language of text in your document'}
            </p>
          </div>

          {/* Output Format Selection */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              Output Format
            </Label>
            <RadioGroup
              value={outputFormat}
              onValueChange={(value) => setOutputFormat(value as OutputFormat)}
              disabled={isProcessing}
              className="space-y-3"
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem value="text" id="text" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="text" className="text-sm font-medium cursor-pointer">
                    📝 Plain Text (.txt)
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Extract text only, editable and copyable
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="searchable-pdf" id="searchable-pdf" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="searchable-pdf" className="text-sm font-medium cursor-pointer">
                    🔍 Searchable PDF (preserves original)
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Keeps original images with invisible OCR text layer - looks identical to original but fully searchable
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="hocr" id="hocr" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="hocr" className="text-sm font-medium cursor-pointer">
                    🌐 hOCR (.html)
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    HTML with precise word positioning and confidence scores - useful for automated processing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="tsv" id="tsv" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="tsv" className="text-sm font-medium cursor-pointer">
                    📊 TSV (.tsv)
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Tab-separated values with bounding boxes - easy to parse for data analysis
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Process Button */}
          <Button
            onClick={handleOCR}
            disabled={isProcessing || isAnalyzing}
            className="w-full"
          >
            {isProcessing ? 'Processing OCR...' : isAnalyzing ? 'Analyzing...' : 'Start OCR'}
          </Button>
        </Card>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar
          progress={progress}
          message={progressMessage}
          variant="default"
        />
      )}

      {/* Results */}
      {result && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {outputFormat === 'searchable-pdf' ? 'Ready to Create Searchable PDF' :
                 outputFormat === 'hocr' ? 'hOCR Data Ready' :
                 outputFormat === 'tsv' ? 'TSV Data Ready' :
                 'Recognized Text'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {outputFormat === 'searchable-pdf' ? (
                  <>
                    {result.pagesProcessed} {result.pagesProcessed === 1 ? 'page' : 'pages'} will be processed with OCR
                  </>
                ) : (
                  <>
                    Confidence: {result.confidence.toFixed(1)}% •
                    {result.pagesProcessed} {result.pagesProcessed === 1 ? 'page' : 'pages'} processed
                  </>
                )}
              </p>
            </div>
            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
            >
              New file
            </Button>
          </div>

          {/* Text Output with Edit Mode (only for text format) */}
          {outputFormat === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="block text-sm font-medium">
                  Extracted text
                </Label>
                <Button
                  onClick={() => setIsEditMode(!isEditMode)}
                  variant="outline"
                  size="sm"
                >
                  {isEditMode ? '👁️ View' : '✏️ Edit'}
                </Button>
              </div>

              {isEditMode ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-64 text-sm resize-y"
                    style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
                    placeholder="Edit your extracted text here..."
                  />
                  {editedText !== result.text && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <span className="animate-pulse">●</span>
                      <span>Text has been modified</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 overflow-auto">
                  <pre className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap break-words" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
                    {editedText || result.text}
                  </pre>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>📝 {editedText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                <span>📄 {editedText.split('\n').length} lines</span>
                <span>🔤 {editedText.length} characters</span>
              </div>
            </div>
          )}

          {/* Searchable PDF info */}
          {outputFormat === 'searchable-pdf' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Searchable PDF with Invisible Text Layer
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    The original document images will be preserved exactly as they appear.
                    OCR text will be added as an invisible layer, making the PDF fully searchable
                    and allowing text selection while maintaining the original visual appearance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* hOCR info */}
          {outputFormat === 'hocr' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌐</span>
                <div className="flex-1">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                    hOCR Format (HTML-based OCR)
                  </h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    HTML document with precise bounding boxes and confidence scores for each word.
                    Ideal for automated processing, NLP pipelines, and custom text extraction workflows.
                    Contains structured data about text positioning, hierarchy, and recognition quality.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TSV info */}
          {outputFormat === 'tsv' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                    TSV Format (Tab-Separated Values)
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Spreadsheet-compatible format with bounding box coordinates and confidence scores.
                    Easy to import into Excel, Google Sheets, or data analysis tools like Python/Pandas.
                    Each row contains level, page number, block, paragraph, line, word, position, and text.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={outputFormat === 'text' ? 'grid grid-cols-2 gap-3' : ''}>
            {outputFormat === 'text' && (
              <Button
                onClick={handleCopyText}
                variant="secondary"
              >
                📋 Copy text
              </Button>
            )}
            <Button
              onClick={handleDownload}
              className={outputFormat === 'searchable-pdf' || outputFormat === 'hocr' || outputFormat === 'tsv' ? 'w-full' : ''}
            >
              💾 {
                outputFormat === 'searchable-pdf' ? 'Create Searchable PDF' :
                outputFormat === 'hocr' ? 'Download hOCR (.html)' :
                outputFormat === 'tsv' ? 'Download TSV (.tsv)' :
                'Download TXT'
              }
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
