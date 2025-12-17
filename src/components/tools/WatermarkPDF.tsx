import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { UploadedFile, PDFFileInfo } from '@/types/pdf';
import { FileCheck, Type, Move, Palette, Sliders, RotateCw } from 'lucide-react';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  const [result, setResult] = useState<{ blob: Blob; metadata: Record<string, unknown> } | null>(null);
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

        // @ts-expect-error - RenderParameters type definition mismatch in pdfjs-dist
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
  const loadCyrillicFont = async (pdfDoc: PDFDocument) => {
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
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

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

  const renderContent = () => {
    if (!file) return null;

    if (result) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('watermark.success.title')}
              </h2>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6 text-sm">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-600 dark:text-gray-400">{t('watermark.success.size')}</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {((result.metadata.finalSize as number) / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-600 dark:text-gray-400">{t('watermark.success.watermarkApplied')}</div>
                  <div className="font-bold text-gray-900 dark:text-white truncate" title={result.metadata.watermarkText as string}>
                    {result.metadata.watermarkText as string}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              {t('common.download')}
            </Button>
            <Button variant="outline" onClick={handleReset} size="lg">
              {t('common.newFile')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Preview Panel (Main Area) */}
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700" style={{ minHeight: '600px' }}>
          {previewUrl ? (
            <div className="w-full h-full flex items-center justify-center p-8 bg-dots-light dark:bg-dots-dark">
              <div className="relative shadow-2xl rounded-sm overflow-hidden" style={{ maxHeight: '550px' }}>
                <img
                  src={previewUrl}
                  alt="PDF Preview"
                  className="max-h-[550px] w-auto object-contain"
                />
                {settings.text && (
                  <div
                    className="absolute"
                    style={getPreviewStyle()}
                  >
                    {settings.text}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-500"></div>
                <p className="text-gray-500 dark:text-gray-400">{t('watermark.loadingPreview')}</p>
              </div>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="mt-8">
            <ProgressBar progress={progress} message={progressMessage} />
          </div>
        )}
      </>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-ocean-500" />
            {t('watermark.settings')}
          </h3>
        </div>

        {/* Text Input */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Type className="w-4 h-4 text-gray-500" />
            {t('watermark.text')}
          </Label>
          <Input
            type="text"
            value={settings.text}
            onChange={(e) => setSettings({ ...settings, text: e.target.value })}
            disabled={isProcessing}
            placeholder={t('watermark.watermarkPlaceholder')}
            className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-ocean-500"
          />
        </div>

        {/* Position */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Move className="w-4 h-4 text-gray-500" />
            {t('watermark.position')}
          </Label>
          <Select
            value={settings.position}
            onValueChange={(value) => setSettings({ ...settings, position: value as Position })}
            disabled={isProcessing}
          >
            <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diagonal">{t('watermark.positions.diagonal')}</SelectItem>
              <SelectItem value="center">{t('watermark.positions.center')}</SelectItem>
              <SelectItem value="top-left">{t('watermark.positions.topLeft')}</SelectItem>
              <SelectItem value="top-right">{t('watermark.positions.topRight')}</SelectItem>
              <SelectItem value="bottom-left">{t('watermark.positions.bottomLeft')}</SelectItem>
              <SelectItem value="bottom-right">{t('watermark.positions.bottomRight')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Color Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            {t('watermark.color')}
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSettings({ ...settings, color: preset.value })}
                disabled={isProcessing}
                className={`
                  relative h-10 w-full rounded-lg transition-all duration-200 border-2
                  ${settings.color.r === preset.value.r &&
                    settings.color.g === preset.value.g &&
                    settings.color.b === preset.value.b
                    ? 'border-ocean-500 scale-105 shadow-md'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }
                `}
                style={{
                  backgroundColor: `rgb(${preset.value.r}, ${preset.value.g}, ${preset.value.b})`,
                }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Sliders Area */}
        <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          {/* Opacity */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">{t('watermark.opacity')}</Label>
              <span className="text-xs text-gray-500 font-mono">{settings.opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={settings.opacity}
              onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
              disabled={isProcessing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
            />
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">{t('watermark.fontSize')}</Label>
              <span className="text-xs text-gray-500 font-mono">{settings.fontSize}pt</span>
            </div>
            <input
              type="range"
              min="24"
              max="96"
              step="4"
              value={settings.fontSize}
              onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
              disabled={isProcessing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
            />
          </div>

          {/* Rotation */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium flex items-center gap-2">
                <RotateCw className="w-3 h-3 text-gray-500" />
                {t('watermark.rotation')}
              </Label>
              <span className="text-xs text-gray-500 font-mono">{settings.rotation}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="5"
              value={settings.rotation}
              onChange={(e) => setSettings({ ...settings, rotation: parseInt(e.target.value) })}
              disabled={isProcessing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    return (
      <Button
        onClick={handleAddWatermark}
        disabled={isProcessing || !settings.text.trim()}
        className="w-full py-6 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
      >
        {t('watermark.apply')}
      </Button>
    );
  };

  return (
    <ToolLayout
      title={t('tools.watermark-pdf.name')}
      description={t('tools.watermark-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFilesSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      settings={!result ? renderSettings() : null}
      actions={!result ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
