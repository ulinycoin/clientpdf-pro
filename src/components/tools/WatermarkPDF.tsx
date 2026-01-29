import React, { useState, useEffect, useRef } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { PDFDocument, rgb, degrees, type PDFFont, type PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { UploadedFile, PDFFileInfo } from '@/types/pdf';
import { FileCheck, Type, Move, Palette, Sliders, Image as ImageIcon, Upload } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type Position = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal' | 'custom';

interface WatermarkSettings {
  mode: 'text' | 'image';
  text: string;
  position: Position;
  opacity: number;
  fontSize: number;
  rotation: number;
  color: { r: number; g: number; b: number };
  imageScale: number;
}

// Ensure Roboto is available for preview metrics
const fontStyles = `
  @font-face {
    font-family: 'Roboto';
    src: url('/fonts/Roboto-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
`;

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
    mode: 'text',
    text: 'CONFIDENTIAL',
    position: 'diagonal',
    opacity: 30,
    fontSize: 48,
    rotation: -45,
    color: { r: 128, g: 128, b: 128 },
    imageScale: 50,
  });

  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const [previewScale, setPreviewScale] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculate scaling factor when image loads or resizes
  useEffect(() => {
    const updateScale = () => {
      if (imageRef.current && file?.info?.dimensions) {
        // file.info.dimensions are from viewport scale 1.5 (see handleFilesSelected)
        // Original PDF width in points = dimensions.width / 1.5
        const pdfOriginalWidth = file.info.dimensions.width / 1.5;
        const displayedWidth = imageRef.current.clientWidth;

        if (pdfOriginalWidth > 0) {
          setPreviewScale(displayedWidth / pdfOriginalWidth);
        }
      }
    };

    // Initial calculation
    const img = imageRef.current;
    if (img) {
      if (img.complete) updateScale();
      else img.onload = updateScale;
    }

    // Resize observer for responsiveness
    const observer = new ResizeObserver(updateScale);
    if (img) observer.observe(img);

    return () => observer.disconnect();
  }, [file, previewUrl]);

  const [customPosition, setCustomPosition] = useState({ x: 50, y: 50 }); // Percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.watermark-element')) {
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      dragStartRef.current = { x: clientX, y: clientY };

      // If not already custom, calculate current position as percentage and set it
      if (settings.position !== 'custom') {
        // This is a simplification; ideally we convert...
        setSettings(prev => ({ ...prev, position: 'custom' }));
      }
    }
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;

    e.preventDefault(); // Prevent scrolling on touch

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;

    setCustomPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x + deltaXPercent)),
      y: Math.max(0, Math.min(100, prev.y + deltaYPercent))
    }));

    dragStartRef.current = { x: clientX, y: clientY };
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Sync custom position when switching logic
  useEffect(() => {
    if (settings.position !== 'custom') {
      // Map standard positions to initial % for smoother transition if user starts dragging
      const map: Record<string, { x: number, y: number }> = {
        'center': { x: 50, y: 50 },
        'top-left': { x: 10, y: 10 },
        'top-right': { x: 90, y: 10 },
        'bottom-left': { x: 10, y: 90 },
        'bottom-right': { x: 90, y: 90 },
        'diagonal': { x: 50, y: 50 },
      };
      if (map[settings.position]) {
        setCustomPosition(map[settings.position]);
      }
    }
  }, [settings.position]);

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
      case 'diagonal':
      case 'center':
        return {
          x: pageWidth / 2,
          y: pageHeight / 2,
        };
      case 'top-left':
        return {
          x: margin + textWidth / 2,
          y: pageHeight - margin - textHeight / 2
        };
      case 'top-right':
        return {
          x: pageWidth - margin - textWidth / 2,
          y: pageHeight - margin - textHeight / 2
        };
      case 'bottom-left':
        return {
          x: margin + textWidth / 2,
          y: margin + textHeight / 2
        };
      case 'bottom-right':
        return {
          x: pageWidth - margin - textWidth / 2,
          y: margin + textHeight / 2
        };
      case 'custom':
        return {
          x: (customPosition.x / 100) * pageWidth,
          y: pageHeight - ((customPosition.y / 100) * pageHeight),
        };
      default:
        return {
          x: pageWidth / 2,
          y: pageHeight / 2,
        };
    }
  };

  const handleWatermarkImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkImage(file);
      const url = URL.createObjectURL(file);
      setWatermarkImagePreview(url);
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
    }
  };

  // Cleanup image preview
  useEffect(() => {
    return () => {
      if (watermarkImagePreview) URL.revokeObjectURL(watermarkImagePreview);
    };
  }, [watermarkImagePreview]);

  const loadCyrillicFont = async (pdfDoc: PDFDocument) => {
    try {
      // Always embed Roboto for Cyrillic support OR consistent metrics
      // This ensures that the PDF output matches the preview regardless of system fonts
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
    if (!file || (settings.mode === 'text' && !settings.text.trim()) || (settings.mode === 'image' && !watermarkImage)) {
      alert(settings.mode === 'text' ? t('watermark.errors.noText') : t('watermark.errors.noImage'));
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

      let font: PDFFont | null = null;
      let embeddedImage: PDFImage | null = null;

      if (settings.mode === 'text') {
        font = await loadCyrillicFont(pdfDoc);
      } else if (watermarkImage) {
        const imageBytes = await watermarkImage.arrayBuffer();
        if (watermarkImage.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }
        // Calculate size based on imageScale (percentage of page width)
        // We'll handle per-page sizing in the loop
      }

      // Get pages
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Add watermark to each page
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageRotation = page.getRotation().angle;

        // Correct dimensions if the page is rotated
        const isRotated = pageRotation === 90 || pageRotation === 270;
        const visibleWidth = isRotated ? height : width;
        const visibleHeight = isRotated ? width : height;

        let wWidth = 0;
        let wHeight = 0;

        if (settings.mode === 'text' && font) {
          wWidth = font.widthOfTextAtSize(settings.text, settings.fontSize);
          wHeight = settings.fontSize * 0.8; // Approximate height of the text block
        } else if (embeddedImage) {
          // Scale image relative to page width
          const scaleFactor = (settings.imageScale / 100) * (visibleWidth / embeddedImage.width);
          wWidth = embeddedImage.width * scaleFactor;
          wHeight = embeddedImage.height * scaleFactor;
        }

        // Calculate rotation angle
        // We negate settings.rotation because PDF-lib rotation is CCW (positive is up)
        // while CSS/User expectation is CW (standard for rotation sliders)
        let finalRotation = -settings.rotation;

        if (settings.position === 'diagonal') {
          // Actual corner-to-corner angle in degrees
          // slope up = positive angle in PDF
          finalRotation = Math.atan2(visibleHeight, visibleWidth) * (180 / Math.PI);
        }

        // Calculate center position on the visible page
        const pos = calculatePosition(
          settings.position,
          visibleWidth,
          visibleHeight,
          wWidth,
          wHeight
        );

        // Rotation math to match CSS transform-origin: center
        // PDF-lib rotation is around the point (x, y), which is the bottom-left of text/image
        // To rotate around center of the object, we apply an offset:
        const rad = (finalRotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Offset to move (x,y) from bottom-left to center before rotation, then rotate
        // and move back to original space.
        const rx = (-wWidth / 2) * cos - (-wHeight / 2) * sin;
        const ry = (-wWidth / 2) * sin + (-wHeight / 2) * cos;

        // Final coordinates: centered position + rotation offset
        // For text, pdf-lib draws from baseline, so we adjust ry slightly
        const drawX = pos.x + rx;
        const drawY = pos.y + ry;

        if (settings.mode === 'text' && font) {
          page.drawText(settings.text, {
            x: drawX,
            y: drawY,
            size: settings.fontSize,
            font: font,
            color: rgb(
              settings.color.r / 255,
              settings.color.g / 255,
              settings.color.b / 255
            ),
            opacity: settings.opacity / 100,
            rotate: degrees(finalRotation),
          });
        } else if (embeddedImage) {
          page.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: wWidth,
            height: wHeight,
            opacity: settings.opacity / 100,
            rotate: degrees(finalRotation),
          });
        }

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
          watermarkText: settings.mode === 'text' ? settings.text : 'Image',
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
    clearSharedFile(); // Explicitly clear to prevent auto-reload
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setPreviewUrl(null);
    setProgress(0);
    setProgressMessage('');
    setCustomPosition({ x: 50, y: 50 });
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
    const baseStyle: React.CSSProperties = {
      opacity: settings.opacity / 100,
      userSelect: 'none' as const,
      pointerEvents: 'auto' as const,
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'none' as const,
      position: 'absolute' as const,
    };

    let transform = '';
    let width = '';
    let height = '';
    let left = '';
    let top = '';
    let right = '';
    let bottom = '';

    if (settings.mode === 'text') {
      baseStyle.color = `rgb(${settings.color.r}, ${settings.color.g}, ${settings.color.b})`;
      baseStyle.fontSize = `${settings.fontSize * previewScale}px`;
      baseStyle.fontWeight = 'bold';
      baseStyle.fontFamily = 'Roboto, sans-serif';
      baseStyle.whiteSpace = 'nowrap';
    } else {
      // Image sizing relative to preview
      if (imageRef.current) {
        const displayedWidth = imageRef.current.clientWidth;
        const w = (settings.imageScale / 100) * displayedWidth;
        const ratio = imageDimensions.height / imageDimensions.width;
        width = `${w}px`;
        height = `${w * ratio}px`;
      }
    }

    let previewRotation = settings.rotation;
    if (settings.position === 'diagonal' && imageRef.current) {
      const w = imageRef.current.clientWidth;
      const h = imageRef.current.clientHeight;
      // CSS rotate is CW, slope up is negative angle
      previewRotation = -Math.atan2(h, w) * (180 / Math.PI);
    }

    if (settings.position === 'custom') {
      left = `${customPosition.x}%`;
      top = `${customPosition.y}%`;
      transform = `translate(-50%, -50%) rotate(${previewRotation}deg)`;
    } else {
      switch (settings.position) {
        case 'diagonal':
        case 'center':
          top = '50%';
          left = '50%';
          transform = `translate(-50%, -50%) rotate(${previewRotation}deg)`;
          break;
        case 'top-left':
          top = '20px';
          left = '20px';
          transform = `translate(0, 0) rotate(${previewRotation}deg)`;
          break;
        case 'top-right':
          top = '20px';
          right = '20px';
          transform = `translate(0, 0) rotate(${previewRotation}deg)`;
          break;
        case 'bottom-left':
          bottom = '20px';
          left = '20px';
          transform = `translate(0, 0) rotate(${previewRotation}deg)`;
          break;
        case 'bottom-right':
          bottom = '20px';
          right = '20px';
          transform = `translate(0, 0) rotate(${previewRotation}deg)`;
          break;
      }
    }

    return {
      ...baseStyle,
      width,
      height,
      left,
      top,
      right,
      bottom,
      transform,
    };
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
      <div className="relative bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800" style={{ minHeight: '600px' }}>
        {previewUrl ? (
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center p-8 bg-dots-light dark:bg-dots-dark"
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div className="relative shadow-2xl rounded-sm overflow-hidden" style={{ maxHeight: '550px' }}>
              <img
                ref={imageRef}
                src={previewUrl}
                alt="PDF Preview"
                className="max-h-[550px] w-auto object-contain"
              />
                {(settings.mode === 'text' ? settings.text : watermarkImagePreview) && (
                  <div
                    className="absolute watermark-element hover:ring-2 hover:ring-ocean-500/50 rounded px-2 transition-shadow flex items-center justify-center overflow-hidden"
                    style={getPreviewStyle()}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                  >
                    {settings.mode === 'text' ? (
                      settings.text
                    ) : (
                      <img src={watermarkImagePreview!} alt="Watermark" className="w-full h-full object-contain pointer-events-none" />
                    )}
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

        <Tabs value={settings.mode} onValueChange={(v) => setSettings({ ...settings, mode: v as 'text' | 'image' })}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm transition-all">
              <Type className="w-4 h-4 mr-2" />
              {t('watermark.textMode')}
            </TabsTrigger>
            <TabsTrigger value="image" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm transition-all">
              <ImageIcon className="w-4 h-4 mr-2" />
              {t('watermark.imageMode')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {settings.mode === 'text' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Type className="w-4 h-4 text-ocean-500" />
                {t('watermark.text')}
              </Label>
              <Input
                type="text"
                value={settings.text}
                onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                disabled={isProcessing}
                placeholder={t('watermark.watermarkPlaceholder')}
                className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-ocean-500 bg-white dark:bg-gray-900"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Palette className="w-4 h-4 text-ocean-500" />
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
                    style={{ backgroundColor: `rgb(${preset.value.r}, ${preset.value.g}, ${preset.value.b})` }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('watermark.fontSize')}</Label>
                <span className="text-xs text-ocean-600 dark:text-ocean-400 font-mono font-bold bg-ocean-50 dark:bg-ocean-900/30 px-2 py-0.5 rounded">{settings.fontSize}pt</span>
              </div>
              <input
                type="range" min="24" max="144" step="4"
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                disabled={isProcessing}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Upload className="w-4 h-4 text-ocean-500" />
                {t('watermark.image')}
              </Label>
              <div className="relative group">
                <Input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleWatermarkImageSelected}
                  disabled={isProcessing}
                  className="hidden"
                  id="watermark-image-upload"
                />
                <label
                  htmlFor="watermark-image-upload"
                  className={`
                    flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed
                    transition-all duration-200 cursor-pointer
                    ${watermarkImagePreview
                      ? 'border-ocean-500 bg-ocean-50/50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-ocean-400 dark:hover:border-ocean-600 bg-white dark:bg-gray-900'
                    }
                  `}
                >
                  {watermarkImagePreview ? (
                    <div className="relative w-full h-full p-2">
                      <img src={watermarkImagePreview} alt="Selected" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                        <span className="text-white text-xs font-bold">{t('common.change')}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">{t('watermark.chooseImage')}</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('watermark.imageScale')}</Label>
                <span className="text-xs text-ocean-600 dark:text-ocean-400 font-mono font-bold bg-ocean-50 dark:bg-ocean-900/30 px-2 py-0.5 rounded">{settings.imageScale}%</span>
              </div>
              <input
                type="range" min="10" max="100" step="5"
                value={settings.imageScale}
                onChange={(e) => setSettings({ ...settings, imageScale: parseInt(e.target.value) })}
                disabled={isProcessing}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
              />
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Move className="w-4 h-4 text-ocean-500" />
              {t('watermark.position')}
            </Label>
            <Select
              value={settings.position}
              onValueChange={(value) => setSettings({ ...settings, position: value as Position })}
              disabled={isProcessing}
            >
              <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 dark:border-gray-700">
                <SelectItem value="diagonal">{t('watermark.positions.diagonal')}</SelectItem>
                <SelectItem value="center">{t('watermark.positions.center')}</SelectItem>
                <SelectItem value="top-left">{t('watermark.positions.topLeft')}</SelectItem>
                <SelectItem value="top-right">{t('watermark.positions.topRight')}</SelectItem>
                <SelectItem value="bottom-left">{t('watermark.positions.bottomLeft')}</SelectItem>
                <SelectItem value="bottom-right">{t('watermark.positions.bottomRight')}</SelectItem>
                <SelectItem value="custom">{t('watermark.positions.custom') || 'Manual'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('watermark.opacity')}</Label>
                <span className="text-xs font-mono font-bold text-ocean-600 dark:text-ocean-400">{settings.opacity}%</span>
              </div>
              <input
                type="range" min="10" max="100" step="5"
                value={settings.opacity}
                onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
                disabled={isProcessing}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('watermark.rotation')}</Label>
                <span className="text-xs font-mono font-bold text-ocean-600 dark:text-ocean-400">{settings.rotation}°</span>
              </div>
              <input
                type="range" min="-180" max="180" step="5"
                value={settings.rotation}
                onChange={(e) => setSettings({ ...settings, rotation: parseInt(e.target.value) })}
                disabled={isProcessing}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-ocean-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    const isDisabled = isProcessing || (settings.mode === 'text' ? !settings.text.trim() : !watermarkImage);
    return (
      <Button
        onClick={handleAddWatermark}
        disabled={isDisabled}
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
      <style>{fontStyles}</style>
      {renderContent()}
    </ToolLayout>
  );
};
