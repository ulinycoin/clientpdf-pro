import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { UploadedFile, PDFFileInfo } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Configure PDF.js worker
// Worker configured in pdfService.ts

type SignatureType = 'draw' | 'upload' | 'text';
type SignaturePosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'custom';

interface SignatureSettings {
  type: SignatureType;
  position: SignaturePosition;
  pageNumber: number | 'all';
  customX?: number;
  customY?: number;
  width: number;
  height: number;
  text?: string;
  textSize?: number;
}

export const SignPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, setSharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [settings, setSettings] = useState<SignatureSettings>({
    type: 'draw',
    position: 'bottom-right',
    pageNumber: 'all',
    width: 200,
    height: 80,
    text: '',
    textSize: 12,
  });

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
      const fileName = file?.name.replace(/\.pdf$/i, '_signed.pdf') || 'signed.pdf';
      setSharedFile(result.blob, fileName, 'sign-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

  // Initialize drawing canvas
  useEffect(() => {
    if (settings.type === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [settings.type]);

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

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Save canvas as signature image
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureImage(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const calculatePosition = (
    position: SignaturePosition,
    pageWidth: number,
    pageHeight: number,
    sigWidth: number,
    sigHeight: number
  ): { x: number; y: number } => {
    const margin = 30;

    switch (position) {
      case 'bottom-left':
        return { x: margin, y: margin };
      case 'bottom-right':
        return { x: pageWidth - margin - sigWidth, y: margin };
      case 'top-left':
        return { x: margin, y: pageHeight - margin - sigHeight };
      case 'top-right':
        return { x: pageWidth - margin - sigWidth, y: pageHeight - margin - sigHeight };
      case 'custom':
        return {
          x: settings.customX || pageWidth / 2 - sigWidth / 2,
          y: settings.customY || pageHeight / 2 - sigHeight / 2,
        };
      default:
        return { x: pageWidth - margin - sigWidth, y: margin };
    }
  };

  const handleAddSignature = async () => {
    if (!file) {
      alert(t('sign.noFile'));
      return;
    }

    if (settings.type === 'text' && !settings.text?.trim()) {
      alert(t('sign.enterText'));
      return;
    }

    if ((settings.type === 'draw' || settings.type === 'upload') && !signatureImage) {
      alert(t('sign.provideSignature'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      setProgressMessage(t('sign.loadingHighQuality'));
      setProgress(10);

      // Load PDF
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(30);
      setProgressMessage(t('sign.addingSignature'));

      // Prepare signature image
      let signatureImageBytes: Uint8Array | null = null;

      if (settings.type === 'draw' || settings.type === 'upload') {
        if (!signatureImage) {
          throw new Error('No signature image available');
        }

        // Convert data URL to bytes
        const base64Data = signatureImage.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        signatureImageBytes = bytes;
      }

      // Get pages
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Determine which pages to sign
      const pagesToSign: number[] = [];
      if (settings.pageNumber === 'all') {
        for (let i = 0; i < totalPages; i++) {
          pagesToSign.push(i);
        }
      } else {
        const pageNum = Number(settings.pageNumber);
        if (pageNum >= 1 && pageNum <= totalPages) {
          pagesToSign.push(pageNum - 1);
        }
      }

      // Add signature to each page
      for (let i = 0; i < pagesToSign.length; i++) {
        const pageIndex = pagesToSign[i];
        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        if (settings.type === 'text') {
          // Add text signature
          const position = calculatePosition(
            settings.position,
            width,
            height,
            settings.width,
            settings.height
          );

          page.drawText(settings.text || '', {
            x: position.x,
            y: position.y,
            size: settings.textSize || 12,
            color: rgb(0, 0, 0),
          });
        } else {
          // Add image signature
          if (!signatureImageBytes) continue;

          const signatureImg = await pdfDoc.embedPng(signatureImageBytes);

          const position = calculatePosition(
            settings.position,
            width,
            height,
            settings.width,
            settings.height
          );

          page.drawImage(signatureImg, {
            x: position.x,
            y: position.y,
            width: settings.width,
            height: settings.height,
          });
        }

        // Update progress
        const pageProgress = 30 + ((i + 1) / pagesToSign.length) * 60;
        setProgress(Math.round(pageProgress));
        setProgressMessage(t('sign.signingPage', { current: i + 1, total: pagesToSign.length }));
      }

      setProgress(90);
      setProgressMessage(t('sign.saving'));

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      setProgress(100);
      setProgressMessage(t('sign.successTitle'));

      setResult({
        blob,
        metadata: {
          originalSize: file.size,
          finalSize: blob.size,
          pageCount: totalPages,
          pagesSigned: pagesToSign.length,
          signatureType: settings.type,
        },
      });
    } catch (error) {
      console.error('Signature error:', error);
      alert('Failed to add signature: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file?.name.replace('.pdf', '')}_signed.pdf`;
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
    setSignatureImage(null);
    setProgress(0);
    setProgressMessage('');
    clearCanvas();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleQuickAction = async (toolId: Tool) => {
    // Save the signed PDF to shared state for the next tool
    if (result?.blob) {
      setSharedFile(result.blob, `${file?.name.replace('.pdf', '')}_signed.pdf`, 'sign-pdf');
    }

    // Small delay to ensure state is updated before navigation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to the selected tool
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  return (
    <div className="sign-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.sign-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.sign-pdf.description')}
        </p>
      </div>

      {/* File Upload */}
      {!file && (
        <Card className="p-6">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".pdf"
            maxFiles={1}
            maxSizeMB={50}
          />
        </Card>
      )}

      {/* Settings & Preview */}
      {file && !result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <Card className="p-6 space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📄</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                    {file.info && ` • ${file.info.pages} pages`}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemoveFile}
                variant="outline"
                size="sm"
                disabled={isProcessing}
              >
                {t('common.remove')}
              </Button>
            </div>

            {/* Signature Type */}
            <div>
              <Label className="mb-2">{t('sign.signatureType')}</Label>
              <Tabs value={settings.type} onValueChange={(value) => setSettings({ ...settings, type: value as SignatureType })}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="draw" disabled={isProcessing}>
                    ✍️ {t('sign.modeDraw')}
                  </TabsTrigger>
                  <TabsTrigger value="upload" disabled={isProcessing}>
                    📤 {t('sign.modeUpload')}
                  </TabsTrigger>
                  <TabsTrigger value="text" disabled={isProcessing}>
                    📝 {t('sign.modeText')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Signature Input */}
            {settings.type === 'draw' && (
              <div>
                <Label className="mb-2">{t('sign.drawSignature')}</Label>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full cursor-crosshair bg-white"
                  />
                </div>
                <Button
                  onClick={clearCanvas}
                  variant="link"
                  className="mt-2 text-sm"
                  disabled={isProcessing}
                >
                  {t('sign.clearSignature')}
                </Button>
              </div>
            )}

            {settings.type === 'upload' && (
              <div>
                <Label className="mb-2">{t('sign.uploadImage')}</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  disabled={isProcessing}
                />
                {signatureImage && (
                  <div className="mt-2 border rounded-lg p-2 bg-white">
                    <img src={signatureImage} alt="Signature" className="max-h-24 mx-auto" />
                  </div>
                )}
              </div>
            )}

            {settings.type === 'text' && (
              <div>
                <Label className="mb-2">{t('sign.signatureText')}</Label>
                <Input
                  type="text"
                  value={settings.text || ''}
                  onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                  disabled={isProcessing}
                  placeholder={t('sign.yourName')}
                />
                <div className="mt-2">
                  <Label className="text-xs mb-1">
                    {t('sign.textSize')}: {settings.textSize}pt
                  </Label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    step="1"
                    value={settings.textSize || 12}
                    onChange={(e) => setSettings({ ...settings, textSize: parseInt(e.target.value) })}
                    disabled={isProcessing}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Position */}
            <div>
              <Label className="mb-2">{t('sign.position')}</Label>
              <Select
                value={settings.position}
                onValueChange={(value) => setSettings({ ...settings, position: value as SignaturePosition })}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">{t('sign.positions.bottomRight')}</SelectItem>
                  <SelectItem value="bottom-left">{t('sign.positions.bottomLeft')}</SelectItem>
                  <SelectItem value="top-right">{t('sign.positions.topRight')}</SelectItem>
                  <SelectItem value="top-left">{t('sign.positions.topLeft')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Selection */}
            <div>
              <Label className="mb-2">{t('sign.applyToPages')}</Label>
              <Select
                value={String(settings.pageNumber)}
                onValueChange={(value) => setSettings({ ...settings, pageNumber: value === 'all' ? 'all' : parseInt(value) })}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('sign.allPages')}</SelectItem>
                  {file.info && Array.from({ length: file.info.pages }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{t('sign.pageNumber', { number: i + 1 })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size */}
            <div>
              <Label className="mb-2">
                {t('sign.signatureSize')}: {settings.width} × {settings.height}
              </Label>
              <input
                type="range"
                min="100"
                max="300"
                step="10"
                value={settings.width}
                onChange={(e) => {
                  const width = parseInt(e.target.value);
                  setSettings({ ...settings, width, height: Math.round(width * 0.4) });
                }}
                disabled={isProcessing}
                className="w-full"
              />
            </div>

            {/* Apply Button */}
            <Button
              onClick={handleAddSignature}
              disabled={isProcessing || (!signatureImage && settings.type !== 'text') || (settings.type === 'text' && !settings.text?.trim())}
              className="w-full"
            >
              {isProcessing ? t('sign.addingSignature') : `✍️ ${t('sign.addSignature')}`}
            </Button>
          </Card>

          {/* Preview Panel */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common.preview')}
            </h3>
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="PDF Preview"
                    className="w-full h-auto"
                  />
                  {/* Signature Overlay */}
                  {(signatureImage || (settings.type === 'text' && settings.text)) && (
                    <div
                      className="absolute pointer-events-none"
                      style={(() => {
                        const margin = 20; // Scaled margin for preview
                        const sigWidth = settings.width * 0.5; // Scale down for preview
                        const sigHeight = settings.height * 0.5;

                        let style: React.CSSProperties = {
                          width: `${sigWidth}px`,
                          height: `${sigHeight}px`,
                        };

                        switch (settings.position) {
                          case 'bottom-left':
                            style.bottom = `${margin}px`;
                            style.left = `${margin}px`;
                            break;
                          case 'bottom-right':
                            style.bottom = `${margin}px`;
                            style.right = `${margin}px`;
                            break;
                          case 'top-left':
                            style.top = `${margin}px`;
                            style.left = `${margin}px`;
                            break;
                          case 'top-right':
                            style.top = `${margin}px`;
                            style.right = `${margin}px`;
                            break;
                        }

                        return style;
                      })()}
                    >
                      {settings.type === 'text' ? (
                        <div
                          className="flex items-center justify-center border-2 border-dashed border-ocean-500 bg-ocean-50/80 dark:bg-ocean-900/40 rounded"
                          style={{
                            width: '100%',
                            height: '100%',
                            fontSize: `${(settings.textSize || 12) * 0.8}px`,
                            fontFamily: 'cursive',
                          }}
                        >
                          {settings.text}
                        </div>
                      ) : (
                        <img
                          src={signatureImage || ''}
                          alt="Signature Preview"
                          className="w-full h-full object-contain border-2 border-dashed border-ocean-500 bg-white/80 rounded"
                        />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400">{t('sign.generatingPreview')}</p>
                </div>
              )}
            </div>
          </Card>
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
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                ✓ {t('sign.successTitle')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('sign.pagesSigned')} {result.metadata.pagesSigned} / {result.metadata.pageCount}
              </p>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
            >
              {t('common.newFile')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('sign.pagesSigned')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.metadata.pagesSigned}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('sign.fileSize')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(result.metadata.finalSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            className="w-full"
          >
            💾 {t('common.download')}
          </Button>

          {/* Quick Actions */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('sign.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('sign.quickActions.description')}
            </p>

            {/* Action buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Protect */}
              <Button
                onClick={() => handleQuickAction('protect-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
              >
                <span className="text-3xl">🔒</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.protect-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('common.recommended')}
                  </p>
                </div>
              </Button>

              {/* Compress */}
              <Button
                onClick={() => handleQuickAction('compress-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
              >
                <span className="text-3xl">🗜️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.compress-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('tools.compress-pdf.description')}
                  </p>
                </div>
              </Button>

              {/* Watermark */}
              <Button
                onClick={() => handleQuickAction('watermark-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
              >
                <span className="text-3xl">💧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.watermark-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('tools.watermark-pdf.description')}
                  </p>
                </div>
              </Button>

              {/* Merge */}
              <Button
                onClick={() => handleQuickAction('merge-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
              >
                <span className="text-3xl">📑</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.merge-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('tools.merge-pdf.description')}
                  </p>
                </div>
              </Button>
            </div>
          </Card>
        </Card>
      )}
    </div>
  );
};
