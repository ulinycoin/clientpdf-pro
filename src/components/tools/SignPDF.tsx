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

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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
      alert('Please upload a PDF file');
      return;
    }

    if (settings.type === 'text' && !settings.text?.trim()) {
      alert('Please enter signature text');
      return;
    }

    if ((settings.type === 'draw' || settings.type === 'upload') && !signatureImage) {
      alert('Please draw or upload a signature');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      setProgressMessage('Loading PDF...');
      setProgress(10);

      // Load PDF
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(30);
      setProgressMessage('Adding signature...');

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
        setProgressMessage(`Signing page ${i + 1} of ${pagesToSign.length}...`);
      }

      setProgress(90);
      setProgressMessage('Saving signed PDF...');

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      setProgress(100);
      setProgressMessage('Signature added successfully!');

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
                    {file.info && ` • ${file.info.pages} pages`}
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

            {/* Signature Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Signature Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSettings({ ...settings, type: 'draw' })}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    settings.type === 'draw'
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-ocean-300'
                  }`}
                >
                  ✍️ Draw
                </button>
                <button
                  onClick={() => setSettings({ ...settings, type: 'upload' })}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    settings.type === 'upload'
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-ocean-300'
                  }`}
                >
                  📤 Upload
                </button>
                <button
                  onClick={() => setSettings({ ...settings, type: 'text' })}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    settings.type === 'text'
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-ocean-300'
                  }`}
                >
                  📝 Text
                </button>
              </div>
            </div>

            {/* Signature Input */}
            {settings.type === 'draw' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Draw Signature
                </label>
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
                <button
                  onClick={clearCanvas}
                  className="mt-2 text-sm text-ocean-600 hover:text-ocean-700 dark:text-ocean-400"
                  disabled={isProcessing}
                >
                  Clear signature
                </button>
              </div>
            )}

            {settings.type === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Signature Image
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Signature Text
                </label>
                <input
                  type="text"
                  value={settings.text || ''}
                  onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  placeholder="Your Name"
                />
                <div className="mt-2">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Text Size: {settings.textSize}pt
                  </label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position
              </label>
              <select
                value={settings.position}
                onChange={(e) => setSettings({ ...settings, position: e.target.value as SignaturePosition })}
                disabled={isProcessing}
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            {/* Page Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apply to Pages
              </label>
              <select
                value={settings.pageNumber}
                onChange={(e) => setSettings({ ...settings, pageNumber: e.target.value === 'all' ? 'all' : parseInt(e.target.value) })}
                disabled={isProcessing}
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                <option value="all">All Pages</option>
                {file.info && Array.from({ length: file.info.pages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Signature Size: {settings.width} × {settings.height}
              </label>
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
            <button
              onClick={handleAddSignature}
              disabled={isProcessing || (!signatureImage && settings.type !== 'text') || (settings.type === 'text' && !settings.text?.trim())}
              className="btn-primary w-full"
            >
              {isProcessing ? 'Adding signature...' : '✍️ Add Signature'}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Preview
            </h3>
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="PDF Preview"
                  className="w-full h-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400">Loading preview...</p>
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
                ✓ Signature Added Successfully
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Signed {result.metadata.pagesSigned} of {result.metadata.pageCount} pages
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Pages Signed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.metadata.pagesSigned}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
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
              What's next?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Continue working with your signed PDF:
            </p>

            {/* Action buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    Add password
                  </p>
                </div>
              </button>

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
                    Reduce size
                  </p>
                </div>
              </button>

              {/* Watermark */}
              <button
                onClick={() => handleQuickAction('watermark-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">💧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.watermark-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add watermark
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
                    Combine PDFs
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
