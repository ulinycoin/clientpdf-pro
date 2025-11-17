import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as pdfjsLib from 'pdfjs-dist';
import type { UploadedFile, PDFFileInfo } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

// Configure PDF.js worker
// Worker configured in pdfService.ts

type Position = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal';

interface WatermarkSettings {
  text: string;
  position: Position;
  opacity: number;
  fontSize: number;
  rotation: number;
  color: { r: number; g: number; b: number };
}

export const WatermarkPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, setSharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  const [settings, setSettings] = useState<WatermarkSettings>({
    text: 'CONFIDENTIAL',
    position: 'diagonal',
    opacity: 30,
    fontSize: 48,
    rotation: -45,
    color: { r: 128, g: 128, b: 128 },
  });

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Auto-adjust rotation based on position
  useEffect(() => {
    if (settings.position === 'diagonal') {
      setSettings(prev => ({ ...prev, rotation: -45 }));
    } else if (settings.position === 'center') {
      setSettings(prev => ({ ...prev, rotation: 0 }));
    }
  }, [settings.position]);

  // Auto-load shared file from other tools
  useEffect(() => {
    if (sharedFile && !file) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFilesSelected([sharedFileObj]);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // Auto-save result to sharedFile when processing is complete
  useEffect(() => {
    if (result?.blob && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_watermarked.pdf') || 'watermarked.pdf';
      setSharedFile(result.blob, fileName, 'watermark-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;

    const uploadedFile: UploadedFile = {
      id: `${Date.now()}`,
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      status: 'pending',
    };

    setFile(uploadedFile);
    setResult(null);
    setResultSaved(false);

    // Generate preview
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let dimensions = { width: 0, height: 0 };

      if (pdf.numPages > 0) {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        dimensions = {
          width: viewport.width,
          height: viewport.height,
        };

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

      // Get PDF info
      const info: PDFFileInfo = {
        pages: pdf.numPages,
        originalSize: selectedFile.size,
        dimensions,
      };

      setFile({ ...uploadedFile, info, status: 'completed' });
    } catch (error) {
      console.error('Failed to load PDF:', error);
      setFile({ ...uploadedFile, status: 'error', error: 'Failed to read PDF' });
    }
  };

  const calculatePosition = (
    position: Position,
    pageWidth: number,
    pageHeight: number,
    textWidth: number,
    textHeight: number
  ): { x: number; y: number } => {
    const margin = 50;

    switch (position) {
      case 'center':
        return {
          x: (pageWidth - textWidth) / 2,
          y: (pageHeight - textHeight) / 2,
        };
      case 'top-left':
        return { x: margin, y: pageHeight - margin - textHeight };
      case 'top-right':
        return { x: pageWidth - margin - textWidth, y: pageHeight - margin - textHeight };
      case 'bottom-left':
        return { x: margin, y: margin };
      case 'bottom-right':
        return { x: pageWidth - margin - textWidth, y: margin };
      case 'diagonal':
        return {
          x: pageWidth / 2 - textWidth / 2,
          y: pageHeight / 2 - textHeight / 2,
        };
      default:
        return {
          x: (pageWidth - textWidth) / 2,
          y: (pageHeight - textHeight) / 2,
        };
    }
  };

  // Load font with Cyrillic support
  const loadCyrillicFont = async (pdfDoc: any) => {
    try {
      // Check if text contains Cyrillic characters
      const hasCyrillic = /[а-яА-ЯёЁ]/.test(settings.text);

      if (!hasCyrillic) {
        // Use standard font for Latin text
        return await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      // Register fontkit for custom fonts
      pdfDoc.registerFontkit(fontkit);

      // Load local Roboto font with Cyrillic support
      // Font is bundled in public/fonts/ to avoid CORS issues
      const fontUrl = '/fonts/Roboto-Regular.ttf';

      console.log('Loading local Roboto font with Cyrillic support...');
      const response = await fetch(fontUrl);

      if (!response.ok) {
        throw new Error(`Font fetch failed: ${response.status}`);
      }

      const fontBytes = await response.arrayBuffer();
      const font = await pdfDoc.embedFont(fontBytes);
      console.log('Successfully loaded Roboto font with Cyrillic support');
      return font;
    } catch (error) {
      console.error('Failed to load Cyrillic font:', error);
      alert(t('watermark.errors.failed') + '\n\n' + t('watermark.errors.cyrillicNotSupported'));
      throw error; // Don't continue with broken Cyrillic
    }
  };

  const handleAddWatermark = async () => {
    if (!file || !settings.text.trim()) {
      alert(t('watermark.errors.noText'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      setProgressMessage(t('watermark.loading'));
      setProgress(10);

      // Load PDF
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(30);
      setProgressMessage(t('watermark.processing'));

      // Load font with Cyrillic support if needed
      const font = await loadCyrillicFont(pdfDoc);

      // Get pages
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Add watermark to each page
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Calculate text dimensions
        const textWidth = font.widthOfTextAtSize(settings.text, settings.fontSize);
        const textHeight = settings.fontSize;

        // Calculate position
        const position = calculatePosition(
          settings.position,
          width,
          height,
          textWidth,
          textHeight
        );

        // Draw watermark
        page.drawText(settings.text, {
          x: position.x,
          y: position.y,
          size: settings.fontSize,
          font: font,
          color: rgb(
            settings.color.r / 255,
            settings.color.g / 255,
            settings.color.b / 255
          ),
          opacity: settings.opacity / 100,
          rotate: degrees(settings.rotation),
        });

        // Update progress
        const pageProgress = 30 + ((i + 1) / totalPages) * 60;
        setProgress(Math.round(pageProgress));
        setProgressMessage(t('watermark.processingPage', { current: i + 1, total: totalPages }));
      }

      setProgress(90);
      setProgressMessage(t('watermark.saving'));

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

      setProgress(100);
      setProgressMessage(t('watermark.completed'));

      setResult({
        blob,
        metadata: {
          originalSize: file.size,
          finalSize: blob.size,
          pageCount: totalPages,
          watermarkText: settings.text,
        },
      });

    } catch (error) {
      console.error('Watermark error:', error);
      alert(t('watermark.errors.failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file?.name.replace('.pdf', '')}_watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setPreviewUrl(null);
    setProgress(0);
    setProgressMessage('');
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleQuickAction = async (toolId: Tool) => {
    // Save the watermarked PDF to shared state for the next tool
    if (result?.blob) {
      setSharedFile(result.blob, `${file?.name.replace('.pdf', '')}_watermarked.pdf`, 'watermark-pdf');
    }

    // Small delay to ensure state is updated before navigation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to the selected tool
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  // Color presets
  const colorPresets = [
    { name: t('watermark.colors.gray'), value: { r: 128, g: 128, b: 128 } },
    { name: t('watermark.colors.red'), value: { r: 220, g: 38, b: 38 } },
    { name: t('watermark.colors.blue'), value: { r: 59, g: 130, b: 246 } },
    { name: t('watermark.colors.black'), value: { r: 0, g: 0, b: 0 } },
  ];

  // Get preview position style
  const getPreviewStyle = () => {
    const baseStyle = {
      color: `rgb(${settings.color.r}, ${settings.color.g}, ${settings.color.b})`,
      opacity: settings.opacity / 100,
      fontSize: `${Math.max(12, settings.fontSize / 4)}px`,
      fontWeight: 'bold' as const,
      userSelect: 'none' as const,
      pointerEvents: 'none' as const,
      whiteSpace: 'nowrap' as const,
    };

    switch (settings.position) {
      case 'center':
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${settings.rotation}deg)`,
        };
      case 'top-left':
        return {
          ...baseStyle,
          top: '10px',
          left: '10px',
          transform: `rotate(${settings.rotation}deg)`,
        };
      case 'top-right':
        return {
          ...baseStyle,
          top: '10px',
          right: '10px',
          transform: `rotate(${settings.rotation}deg)`,
        };
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: '10px',
          left: '10px',
          transform: `rotate(${settings.rotation}deg)`,
        };
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: '10px',
          right: '10px',
          transform: `rotate(${settings.rotation}deg)`,
        };
      case 'diagonal':
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${settings.rotation}deg)`,
        };
      default:
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${settings.rotation}deg)`,
        };
    }
  };

  return (
    <div className="watermark-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.watermark-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.watermark-pdf.description')}
        </p>
      </div>

      {/* File Upload */}
      {!file && (
        <div className="card p-6">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".pdf"
            maxFiles={1}
            maxSizeMB={50}
          />
        </div>
      )}

      {/* Settings & Preview */}
      {file && !result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <div className="card p-6 space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📄</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                    {file.info && ` • ${file.info.pages} ${t('compress.pages')}`}
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

            {/* Watermark Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('watermark.text')}
              </label>
              <input
                type="text"
                value={settings.text}
                onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                disabled={isProcessing}
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                placeholder="Enter watermark text..."
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('watermark.position')}
              </label>
              <select
                value={settings.position}
                onChange={(e) => setSettings({ ...settings, position: e.target.value as Position })}
                disabled={isProcessing}
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                <option value="diagonal">{t('watermark.positions.diagonal')}</option>
                <option value="center">{t('watermark.positions.center')}</option>
                <option value="top-left">{t('watermark.positions.topLeft')}</option>
                <option value="top-right">{t('watermark.positions.topRight')}</option>
                <option value="bottom-left">{t('watermark.positions.bottomLeft')}</option>
                <option value="bottom-right">{t('watermark.positions.bottomRight')}</option>
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('watermark.color')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setSettings({ ...settings, color: preset.value })}
                    disabled={isProcessing}
                    className={`px-3 py-2 rounded-lg border-2 transition-all ${
                      settings.color.r === preset.value.r &&
                      settings.color.g === preset.value.g &&
                      settings.color.b === preset.value.b
                        ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-ocean-300'
                    }`}
                  >
                    <div
                      className="w-full h-6 rounded"
                      style={{
                        backgroundColor: `rgb(${preset.value.r}, ${preset.value.g}, ${preset.value.b})`,
                      }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('watermark.opacity')}: {settings.opacity}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.opacity}
                onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
                disabled={isProcessing}
                className="w-full"
              />
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('watermark.fontSize')}: {settings.fontSize}pt
              </label>
              <input
                type="range"
                min="24"
                max="96"
                step="4"
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                disabled={isProcessing}
                className="w-full"
              />
            </div>

            {/* Rotation (manual override) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('watermark.rotation')}: {settings.rotation}°
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                step="5"
                value={settings.rotation}
                onChange={(e) => setSettings({ ...settings, rotation: parseInt(e.target.value) })}
                disabled={isProcessing}
                className="w-full"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={handleAddWatermark}
              disabled={isProcessing || !settings.text.trim()}
              className="btn-primary w-full"
            >
              {isProcessing ? t('watermark.processing') : t('watermark.apply')}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('watermark.preview')}
            </h3>
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="PDF Preview"
                    className="w-full h-auto"
                  />
                  {settings.text && (
                    <div
                      className="absolute"
                      style={getPreviewStyle()}
                    >
                      {settings.text}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400">{t('watermark.loadingPreview')}</p>
                </div>
              )}
            </div>
          </div>
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

      {/* Result */}
      {result && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('watermark.success.title')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('watermark.success.watermarkApplied')}: "{result.metadata.watermarkText}"
              </p>
            </div>
            <button
              onClick={handleReset}
              className="btn-secondary text-sm"
            >
              {t('common.newFile')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('watermark.success.pages')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.metadata.pageCount}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('watermark.success.size')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(result.metadata.finalSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="btn-primary w-full"
          >
            💾 {t('common.download')}
          </button>

          {/* Quick Actions */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('watermark.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('watermark.quickActions.description')}
            </p>

            {/* Action buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Compress */}
              <button
                onClick={() => handleQuickAction('compress-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">🗜️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.compress-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('watermark.quickActions.compress')}
                  </p>
                </div>
              </button>

              {/* Protect */}
              <button
                onClick={() => handleQuickAction('protect-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">🔒</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.protect-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('watermark.quickActions.protect')}
                  </p>
                </div>
              </button>

              {/* Split */}
              <button
                onClick={() => handleQuickAction('split-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">✂️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.split-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('watermark.quickActions.split')}
                  </p>
                </div>
              </button>

              {/* Merge */}
              <button
                onClick={() => handleQuickAction('merge-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">📑</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.merge-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('watermark.quickActions.merge')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
