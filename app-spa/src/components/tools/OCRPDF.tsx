import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import * as Tesseract from 'tesseract.js';
import { getDocument } from 'pdfjs-dist';

// Language mapping for Tesseract
const TESSERACT_LANGUAGES: Record<string, string> = {
  en: 'eng',
  ru: 'rus',
  de: 'deu',
  fr: 'fra',
  es: 'spa',
};

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  pagesProcessed: number;
}

type PageSelectionMode = 'all' | 'range' | 'first';

export const OCRPDF: React.FC = () => {
  const { t, language } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<OCRResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    TESSERACT_LANGUAGES[language] || 'eng'
  );
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageMode, setPageMode] = useState<PageSelectionMode>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const workerRef = useRef<Tesseract.Worker | null>(null);

  // Update selected language when UI language changes (only if not auto-detect)
  useEffect(() => {
    if (!autoDetectLanguage) {
      setSelectedLanguage(TESSERACT_LANGUAGES[language] || 'eng');
    }
  }, [language, autoDetectLanguage]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const detectLanguageFromText = async (canvas: HTMLCanvasElement): Promise<string> => {
    // Quick scan with English to detect script
    const tempWorker = await Tesseract.createWorker('eng', 1, {
      logger: () => {} // Silent
    });

    const { data } = await tempWorker.recognize(canvas);
    await tempWorker.terminate();

    const text = data.text.toLowerCase();

    // Check for Cyrillic characters
    const cyrillicPattern = /[а-яё]/i;
    if (cyrillicPattern.test(text)) {
      return 'rus';
    }

    // Check for German umlauts
    const germanPattern = /[äöüß]/i;
    if (germanPattern.test(text)) {
      return 'deu';
    }

    // Check for French accents
    const frenchPattern = /[àâäçéèêëîïôùûü]/i;
    if (frenchPattern.test(text)) {
      return 'fra';
    }

    // Check for Spanish specific characters
    const spanishPattern = /[áéíóúñ¿¡]/i;
    if (spanishPattern.test(text)) {
      return 'spa';
    }

    // Default to English
    return 'eng';
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    // Get total pages for PDF
    if (selectedFile.type === 'application/pdf') {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
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

          // Auto-detect language if enabled
          if (autoDetectLanguage) {
            setProgressMessage(t('ocr.detectingLanguage'));
            const detectedLang = await detectLanguageFromText(canvas);
            setSelectedLanguage(detectedLang);
            setProgressMessage('');
          }
        }
      } catch (error) {
        console.error('Failed to load PDF:', error);
      }
    } else if (selectedFile.type.startsWith('image/')) {
      setTotalPages(1);
      setPageRange({ start: 1, end: 1 });
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      // Auto-detect language for images
      if (autoDetectLanguage) {
        try {
          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            setProgressMessage(t('ocr.detectingLanguage'));
            const detectedLang = await detectLanguageFromText(canvas);
            setSelectedLanguage(detectedLang);
            setProgressMessage('');
          };
          img.src = url;
        } catch (error) {
          console.error('Language detection failed:', error);
        }
      }
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
  };

  const extractImageFromPDF = async (file: File, pageNum: number): Promise<HTMLCanvasElement> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
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
      alert(t('ocr.errors.noFile'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setProgressMessage(t('ocr.initializing'));

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

      // Create Tesseract worker
      setProgressMessage(t('ocr.loadingModel'));
      workerRef.current = await Tesseract.createWorker(selectedLanguage, 1, {
        logger: () => {} // We'll handle progress manually
      });

      let combinedText = '';
      let totalConfidence = 0;

      // Process each page
      for (let i = 0; i < pagesToProcess.length; i++) {
        const pageNum = pagesToProcess[i];
        const pageProgress = (i / pagesToProcess.length) * 100;

        setProgressMessage(t('ocr.processingPage', { current: pageNum, total: pagesToProcess.length }));
        setProgress(Math.round(pageProgress));

        let imageToProcess: string | HTMLCanvasElement;

        if (file.type.startsWith('image/')) {
          imageToProcess = URL.createObjectURL(file);
        } else {
          const canvas = await extractImageFromPDF(file, pageNum);
          imageToProcess = canvas;
        }

        // Perform OCR on this page
        const { data } = await workerRef.current.recognize(imageToProcess);

        // Add page separator for multi-page documents
        if (i > 0) {
          combinedText += '\n\n' + '='.repeat(50) + '\n';
          combinedText += `Page ${pageNum}\n`;
          combinedText += '='.repeat(50) + '\n\n';
        }

        combinedText += data.text;
        totalConfidence += data.confidence;
      }

      const avgConfidence = totalConfidence / pagesToProcess.length;

      setResult({
        text: combinedText,
        confidence: avgConfidence,
        language: selectedLanguage,
        pagesProcessed: pagesToProcess.length,
      });

      setProgress(100);
      setProgressMessage(t('ocr.completed'));

      // Cleanup
      await workerRef.current.terminate();
      workerRef.current = null;

    } catch (error) {
      console.error('OCR error:', error);
      alert(t('ocr.errors.processingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      alert(t('ocr.textCopied'));
    }
  };

  const handleDownloadTXT = () => {
    if (!result?.text) return;

    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^.]+$/, '')}_ocr.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    handleRemoveFile();
  };

  return (
    <div className="ocr-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.ocr-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.ocr-pdf.description')}
        </p>
      </div>

      {/* File Upload */}
      {!file && (
        <div className="card p-6">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".pdf,.jpg,.jpeg,.png"
            maxFiles={1}
            maxSizeMB={50}
          />
        </div>
      )}

      {/* File Preview & Settings */}
      {file && !result && (
        <div className="card p-6 space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📄</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} {totalPages === 1 ? t('ocr.page') : t('ocr.pages')}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="btn-secondary text-sm"
              disabled={isProcessing}
            >
              {t('common.remove')}
            </button>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('ocr.pageSelection')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={pageMode === 'first'}
                    onChange={() => setPageMode('first')}
                    disabled={isProcessing}
                    className="text-ocean-500 focus:ring-ocean-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('ocr.firstPageOnly')}
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={pageMode === 'all'}
                    onChange={() => setPageMode('all')}
                    disabled={isProcessing}
                    className="text-ocean-500 focus:ring-ocean-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('ocr.allPages')} ({totalPages} {t('ocr.pages')})
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={pageMode === 'range'}
                    onChange={() => setPageMode('range')}
                    disabled={isProcessing}
                    className="text-ocean-500 focus:ring-ocean-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('ocr.pageRange')}
                  </span>
                </label>
                {pageMode === 'range' && (
                  <div className="ml-6 flex items-center gap-3">
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
            </div>
          )}

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('ocr.recognitionLanguage')}
            </label>

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
                {t('ocr.autoDetect')}
              </span>
            </label>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              disabled={isProcessing || autoDetectLanguage}
            >
              <option value="eng">English</option>
              <option value="rus">Русский</option>
              <option value="deu">Deutsch</option>
              <option value="fra">Français</option>
              <option value="spa">Español</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {autoDetectLanguage ? t('ocr.autoDetectHint') : t('ocr.languageHint')}
            </p>
          </div>

          {/* Process Button */}
          <button
            onClick={handleOCR}
            disabled={isProcessing}
            className="btn-primary w-full"
          >
            {isProcessing ? t('ocr.processing') : t('ocr.startOCR')}
          </button>
        </div>
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
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('ocr.results')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('ocr.confidence')}: {result.confidence.toFixed(1)}% •
                {result.pagesProcessed} {result.pagesProcessed === 1 ? t('ocr.page') : t('ocr.pages')} {t('ocr.processed')}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="btn-secondary text-sm"
            >
              {t('common.newFile')}
            </button>
          </div>

          {/* Text Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('ocr.extractedText')}
            </label>
            <textarea
              value={result.text}
              readOnly
              className="w-full h-64 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyText}
              className="btn-secondary"
            >
              📋 {t('ocr.copyText')}
            </button>
            <button
              onClick={handleDownloadTXT}
              className="btn-primary"
            >
              💾 {t('ocr.downloadTXT')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
