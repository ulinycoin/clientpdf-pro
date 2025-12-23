import React, { useState, useEffect, useRef } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { pdfService } from '@/services/pdfService';
import type { UploadedFile, PDFFileInfo } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
  includeName?: boolean;
  nameText?: string;
  nameSize?: number;
}

export const SignPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, setSharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [result, setResult] = useState<{ blob: Blob; metadata: Record<string, unknown> } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [settings, setSettings] = useState<SignatureSettings>({
    type: 'draw',
    position: 'bottom-right',
    pageNumber: 'all',
    width: 200,
    height: 80,
    text: '',
    textSize: 12,
    customX: 50,
    customY: 50,
    includeName: false,
    nameText: '',
    nameSize: 14,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (sharedFile && !file) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFilesSelected([sharedFileObj]);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  useEffect(() => {
    if (result?.blob && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_signed.pdf') || 'signed.pdf';
      setSharedFile(result.blob, fileName, 'sign-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

  // Canvas initialization
  useEffect(() => {
    if (settings.type === 'draw' && canvasRef.current) {
      initCanvas();
    }
  }, [settings.type, file]); // Re-init when type changes or file is loaded (and settings panel appears)

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

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

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let dimensions = { width: 0, height: 0 };
      if (pdf.numPages > 0) {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        dimensions = { width: viewport.width, height: viewport.height };

        // Render preview
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // @ts-expect-error - type mismatch in pdfjs-dist definition
        await page.render({ canvasContext: context, viewport }).promise;
        setPreviewUrl(canvas.toDataURL());
      }

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

  // Drawing Logic
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
    const canvas = canvasRef.current;
    if (canvas) setSignatureImage(canvas.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    initCanvas();
    setSignatureImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setSignatureImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const calculatePosition = (position: SignaturePosition, pageWidth: number, pageHeight: number, sigWidth: number, sigHeight: number) => {
    const margin = 30;
    switch (position) {
      case 'bottom-left': return { x: margin, y: margin };
      case 'bottom-right': return { x: pageWidth - margin - sigWidth, y: margin };
      case 'top-left': return { x: margin, y: pageHeight - margin - sigHeight };
      case 'top-right': return { x: pageWidth - margin - sigWidth, y: pageHeight - margin - sigHeight };
      case 'custom': {
        const x = ((settings.customX || 50) / 100) * (pageWidth - sigWidth);
        const y = (1 - (settings.customY || 50) / 100) * (pageHeight - sigHeight);
        return { x, y };
      }
      default: return { x: pageWidth - margin - sigWidth, y: margin };
    }
  };

  const handleApplySignature = async () => {
    if (!file) return;
    if (settings.type === 'text' && !settings.text?.trim()) { alert(t('sign.enterText')); return; }
    if ((settings.type === 'draw' || settings.type === 'upload') && !signatureImage) { alert(t('sign.provideSignature')); return; }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);



      let signatureImageBytes: Uint8Array | null = null;
      if (settings.type !== 'text' && signatureImage) {
        const base64Data = signatureImage.split(',')[1];
        const binaryString = atob(base64Data);
        signatureImageBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) signatureImageBytes[i] = binaryString.charCodeAt(i);
      }

      const pages = pdfDoc.getPages();
      const pagesToSign: number[] = settings.pageNumber === 'all'
        ? pages.map((_, i) => i)
        : [(settings.pageNumber as number) - 1].filter(p => p >= 0 && p < pages.length);

      for (let i = 0; i < pagesToSign.length; i++) {
        const page = pages[pagesToSign[i]];
        const { width, height } = page.getSize();
        const pos = calculatePosition(settings.position, width, height, settings.width, settings.height);

        if (settings.type === 'text') {
          page.drawText(settings.text || '', { x: pos.x, y: pos.y, size: settings.textSize || 12, color: rgb(0, 0, 0) });
        } else if (signatureImageBytes) {
          const signatureImg = await pdfDoc.embedPng(signatureImageBytes);
          const sigWidth = settings.width;
          const sigHeight = settings.height;

          page.drawImage(signatureImg, { x: pos.x, y: pos.y, width: sigWidth, height: sigHeight });

          if (settings.includeName && settings.nameText) {
            const fontSize = settings.nameSize || 14;
            // Draw name centered below signature
            page.drawText(settings.nameText, {
              x: pos.x + (sigWidth / 2) - (settings.nameText.length * fontSize * 0.25), // Rough centering
              y: pos.y - (fontSize + 10),
              size: fontSize,
              color: rgb(0, 0, 0)
            });
          }
        }

      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

      setResult({
        blob,
        metadata: {
          originalSize: file.size,
          finalSize: blob.size,
          pageCount: pages.length,
          pagesSigned: pagesToSign.length,
        }
      });
    } catch (e) {
      console.error(e);
      alert('Failed to sign PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) pdfService.downloadFile(result.blob, file?.name.replace('.pdf', '_signed.pdf') || 'signed.pdf');
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setPreviewUrl(null);
    setSignatureImage(null);
    clearSharedFile();
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    const previewContainer = document.getElementById('signature-preview-container');
    if (!previewContainer) return;

    const rect = previewContainer.getBoundingClientRect();
    const percentDeltaX = (deltaX / rect.width) * 100;
    const percentDeltaY = (deltaY / rect.height) * 100;

    setSettings(prev => ({
      ...prev,
      position: 'custom',
      customX: Math.max(0, Math.min(100, (prev.customX || 50) + percentDeltaX)),
      customY: Math.max(0, Math.min(100, (prev.customY || 50) + percentDeltaY))
    }));

    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const renderCombinedNameSettings = () => (
    <div className="space-y-4 pt-4 border-t border-dashed">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeName"
          checked={settings.includeName}
          onCheckedChange={(checked) => setSettings({ ...settings, includeName: !!checked })}
        />
        <Label htmlFor="includeName" className="cursor-pointer font-medium">{t('sign.includeName')}</Label>
      </div>

      {settings.includeName && (
        <div className="space-y-3 pl-6 animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('sign.printedName')}</Label>
            <Input
              value={settings.nameText}
              onChange={e => setSettings({ ...settings, nameText: e.target.value })}
              placeholder={t('sign.namePlaceholder')}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('sign.nameSize')}: {settings.nameSize}pt</Label>
            <Input
              type="range"
              min="8"
              max="32"
              value={settings.nameSize}
              onChange={e => setSettings({ ...settings, nameSize: parseInt(e.target.value) })}
              className="h-4"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderSignaturePreviewOverlay = () => {
    if (!signatureImage && (!settings.text || settings.type !== 'text')) return null;

    const style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      width: settings.type === 'text' ? 'auto' : '20%',
      height: 'auto',
      border: '2px dashed #3b82f6',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: isDragging ? 'none' : 'all 0.2s ease',
      userSelect: 'none',
      borderRadius: '4px',
      padding: '4px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    };

    if (settings.position === 'bottom-right') { style.bottom = '5%'; style.right = '5%'; }
    else if (settings.position === 'bottom-left') { style.bottom = '5%'; style.left = '5%'; }
    else if (settings.position === 'top-right') { style.top = '5%'; style.right = '5%'; }
    else if (settings.position === 'top-left') { style.top = '5%'; style.left = '5%'; }
    else {
      style.top = `${settings.customY}%`;
      style.left = `${settings.customX}%`;
      style.transform = 'translate(-50%, -50%)';
    }

    return (
      <div
        style={style}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onMouseMove={handleDragMove}
        onTouchMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        onMouseLeave={handleDragEnd}
        className="group relative"
      >
        {settings.type === 'text' ? (
          <div style={{
            fontSize: `${(settings.textSize || 12) * 1.5}px`,
            fontFamily: 'serif',
            whiteSpace: 'nowrap',
            color: '#000'
          }}>
            {settings.text}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <img src={signatureImage!} alt="sig" className="w-full h-auto pointer-events-none" />
            {settings.includeName && settings.nameText && (
              <div style={{
                fontSize: `${(settings.nameSize || 14) * 0.8}px`,
                fontFamily: 'sans-serif',
                color: '#000',
                borderTop: '1px solid #ccc',
                paddingTop: '2px',
                width: '100%',
                textAlign: 'center'
              }}>
                {settings.nameText}
              </div>
            )}
          </div>
        )}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {t('sign.dragToMove')}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <Tabs value={settings.type} onValueChange={(v) => {
        setSettings({ ...settings, type: v as SignatureType });
        // Need a timeout to let canvas render before init
        if (v === 'draw') setTimeout(initCanvas, 50);
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="draw">{t('sign.modeDraw')}</TabsTrigger>
          <TabsTrigger value="upload">{t('sign.modeUpload')}</TabsTrigger>
          <TabsTrigger value="text">{t('sign.modeText')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {settings.type === 'draw' && (
        <div className="space-y-2">
          <Label>{t('sign.drawSignature')}</Label>
          <div className="border rounded-md overflow-hidden bg-white shadow-sm">
            <canvas
              ref={canvasRef}
              width={300} // Smaller for sidebar
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full cursor-crosshair touch-none"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs w-full text-red-500 hover:text-red-600">
            {t('sign.clearSignature')}
          </Button>
          {signatureImage && renderCombinedNameSettings()}
        </div>
      )}

      {settings.type === 'upload' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('sign.uploadImage')}</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {signatureImage && (
              <div className="border rounded p-2 bg-white">
                <img src={signatureImage} className="max-h-20 mx-auto" alt="preview" />
              </div>
            )}
          </div>
          {signatureImage && renderCombinedNameSettings()}
        </div>
      )}

      {settings.type === 'text' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('sign.signatureText')}</Label>
            <Input value={settings.text} onChange={e => setSettings({ ...settings, text: e.target.value })} placeholder="Your Name" />
          </div>
          <div className="space-y-1">
            <Label>{t('sign.textSize')}: {settings.textSize}pt</Label>
            <Input type="range" min="8" max="72" value={settings.textSize} onChange={e => setSettings({ ...settings, textSize: parseInt(e.target.value) })} />
          </div>
        </div>
      )}

      <div className="space-y-3 pt-4 border-t">
        <Label>{t('sign.position')}</Label>
        <Select value={settings.position} onValueChange={(v: SignaturePosition) => setSettings({ ...settings, position: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="bottom-right">{t('sign.positions.bottomRight')}</SelectItem>
            <SelectItem value="bottom-left">{t('sign.positions.bottomLeft')}</SelectItem>
            <SelectItem value="top-right">{t('sign.positions.topRight')}</SelectItem>
            <SelectItem value="top-left">{t('sign.positions.topLeft')}</SelectItem>
            <SelectItem value="custom">{t('sign.positions.custom')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>{t('sign.applyToPages')}</Label>
        <Select value={String(settings.pageNumber)} onValueChange={(v) => setSettings({ ...settings, pageNumber: v === 'all' ? 'all' : parseInt(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('sign.allPages')}</SelectItem>
            {file?.info?.pages && Array.from({ length: file.info.pages }).map((_, i) => (
              <SelectItem key={i} value={String(i + 1)}>{t('sign.pageNumber', { number: i + 1 })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!file) return null;
    if (result) {
      return (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">{t('sign.successTitle')}</h2>

          <div className="flex justify-center gap-4">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700">{t('common.download')}</Button>
            <Button onClick={handleReset} variant="outline" size="lg">{t('common.convertAnother')}</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[400px] relative overflow-hidden">
        {previewUrl ? (
          <div id="signature-preview-container" className="relative shadow-lg max-w-full touch-none">
            <img src={previewUrl} alt="PDF Preview" className="max-h-[60vh] object-contain pointer-events-none" />
            {renderSignaturePreviewOverlay()}
          </div>
        ) : (
          <p className="text-gray-500">{t('sign.generatingPreview')}</p>
        )}
      </div>
    );
  };

  const renderActions = () => (
    <Button onClick={handleApplySignature} disabled={isProcessing || (!signatureImage && settings.type !== 'text') || (settings.type === 'text' && !settings.text)} className="w-full py-6 text-lg font-bold">
      {isProcessing ? t('common.processing') : t('sign.addSignature')}
    </Button>
  );

  return (
    <ToolLayout
      title={t('tools.sign-pdf.name')}
      description={t('tools.sign-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFilesSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      acceptedTypes=".pdf"
      settings={!result ? renderSettings() : null}
      actions={!result ? renderActions() : null}
      sidebarWidth="w-80" // Slightly wider for signature canvas
    >
      {renderContent()}
    </ToolLayout>
  );
};
