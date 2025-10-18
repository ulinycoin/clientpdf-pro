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
}

export const OCRPDF: React.FC = () => {
  const { t, language } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<OCRResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    TESSERACT_LANGUAGES[language] || 'eng'
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const workerRef = useRef<Tesseract.Worker | null>(null);

  // Update selected language when UI language changes
  useEffect(() => {
    setSelectedLanguage(TESSERACT_LANGUAGES[language] || 'eng');
  }, [language]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else if (selectedFile.type === 'application/pdf') {
      // For PDF, render first page as preview
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;

        if (pdf.numPages > 0) {
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
        console.error('Failed to render PDF preview:', error);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setPreviewUrl(null);
    setProgress(0);
    setProgressMessage('');
  };

  const extractImageFromPDF = async (file: File, pageNum: number = 1): Promise<HTMLCanvasElement> => {
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
      // Create Tesseract worker
      setProgressMessage(t('ocr.loadingModel'));
      workerRef.current = await Tesseract.createWorker(selectedLanguage, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const prog = Math.round(m.progress * 100);
            setProgress(prog);
            setProgressMessage(`${t('ocr.recognizing')} ${prog}%`);
          }
        },
      });

      let imageToProcess: string | HTMLCanvasElement;

      // Process based on file type
      if (file.type.startsWith('image/')) {
        setProgressMessage(t('ocr.processingImage'));
        imageToProcess = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
        setProgressMessage(t('ocr.processingPDF'));
        // Extract first page (for simplicity, could be extended to all pages)
        const canvas = await extractImageFromPDF(file, 1);
        imageToProcess = canvas;
      } else {
        throw new Error('Unsupported file type');
      }

      // Perform OCR
      setProgressMessage(t('ocr.recognizing'));
      const { data } = await workerRef.current.recognize(imageToProcess);

      setResult({
        text: data.text,
        confidence: data.confidence,
        language: selectedLanguage,
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
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {t('tools.ocr-pdf.name')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.ocr-pdf.description')}
        </p>
      </div>

      {/* File Upload */}
      {!file && (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept=".pdf,.jpg,.jpeg,.png"
          maxFiles={1}
          maxSizeMB={50}
        />
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
                  {(file.size / 1024 / 1024).toFixed(2)} MB
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

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('ocr.recognitionLanguage')}
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              disabled={isProcessing}
            >
              <option value="eng">English</option>
              <option value="rus">Русский</option>
              <option value="deu">Deutsch</option>
              <option value="fra">Français</option>
              <option value="spa">Español</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('ocr.languageHint')}
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
                {t('ocr.confidence')}: {result.confidence.toFixed(1)}%
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

      {/* Info Section */}
      <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4">
        <h4 className="font-medium text-ocean-900 dark:text-ocean-300 mb-2">
          {t('ocr.infoTitle')}
        </h4>
        <ul className="text-sm text-ocean-700 dark:text-ocean-400 space-y-1">
          <li>• {t('ocr.info1')}</li>
          <li>• {t('ocr.info2')}</li>
          <li>• {t('ocr.info3')}</li>
        </ul>
      </div>
    </div>
  );
};
