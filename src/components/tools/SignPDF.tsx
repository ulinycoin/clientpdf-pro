import React, { useState, useEffect, useRef } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as pdfjsLib from 'pdfjs-dist';
import { pdfService } from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type SignatureType = 'draw' | 'upload' | 'text';

interface PlacedSignature {
  id: string;
  type: SignatureType;
  page: number; // 1-indexed
  x: number; // percentage
  y: number; // percentage
  width: number;
  height: number;
  image?: string; // data URL for draw/upload
  text?: string;
  textSize?: number;
  color?: string;
  includeName?: boolean;
  nameText?: string;
  nameSize?: number;
}

interface SignatureSettings {
  type: SignatureType;
  width: number;
  height: number;
  text?: string;
  textSize?: number;
  color: string;
  includeName?: boolean;
  nameText?: string;
  nameSize?: number;
  includeDate?: boolean;
  dateSize?: number;
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
  const [activeSignId, setActiveSignId] = useState<string | null>(null);
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [pageSize, setPageSize] = useState({ width: 595.28, height: 841.89 }); // Default A4

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontBytes, setFontBytes] = useState<ArrayBuffer | null>(null);
  const [fontScale, setFontScale] = useState(1);

  const [settings, setSettings] = useState<SignatureSettings>({
    type: 'draw',
    width: 200,
    height: 80,
    text: '',
    textSize: 12,
    color: '#000000',
    includeName: false,
    nameText: '',
    nameSize: 14,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Load Roboto font for Cyrillic support
  useEffect(() => {
    const loadFont = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf');
        const bytes = await response.arrayBuffer();
        setFontBytes(bytes);
      } catch (e) {
        console.error('Failed to load font:', e);
      }
    };
    loadFont();
  }, []);

  // Update font scale when container width or zoom changes
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && pageSize.width > 0) {
        const renderedWidth = containerRef.current.getBoundingClientRect().width / zoom;
        setFontScale(renderedWidth / pageSize.width);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [pageSize.width, zoom, previewUrl]);

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

  // Sync settings with active signature for real-time updates
  useEffect(() => {
    if (activeSignId) {
      setPlacedSignatures(prev => prev.map(sig => {
        if (sig.id === activeSignId) {
          return {
            ...sig,
            width: settings.width,
            height: settings.height,
            text: settings.text,
            textSize: settings.textSize,
            color: settings.color,
            includeName: settings.includeName,
            nameText: settings.nameText,
            nameSize: settings.nameSize,
            image: signatureImage || sig.image, // Update image too if redrawn
          };
        }
        return sig;
      }));
    }
  }, [settings, signatureImage, activeSignId]);

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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = settings.color;
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
    setPlacedSignatures([]);
    setCurrentPage(1);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);
      await renderPagePreview(pdf, 1);
      setFile({ ...uploadedFile, status: 'completed' });
    } catch (error) {
      console.error('Failed to load PDF info:', error);
      setFile({ ...uploadedFile, status: 'error', error: 'Failed to read PDF' });
    }
  };

  const renderPagePreview = async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      // Use viewport at scale 1 to get original PDF points
      const originalViewport = page.getViewport({ scale: 1 });
      setPageSize({ width: originalViewport.width, height: originalViewport.height });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      // @ts-expect-error - type mismatch in pdfjs-dist definition
      await page.render({ canvasContext: context, viewport }).promise;
      setPreviewUrl(canvas.toDataURL());
    } catch (e) {
      console.error('Preview error:', e);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || !file) return;
    setCurrentPage(newPage);
    const arrayBuffer = await file.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    await renderPagePreview(pdf, newPage);
  };

  const handleAddSignature = () => {
    if (!signatureImage && settings.type !== 'text') return;
    if (settings.type === 'text' && !settings.text) return;

    const newSign: PlacedSignature = {
      id: `${Date.now()}`,
      type: settings.type,
      page: currentPage,
      x: 50,
      y: 50,
      width: settings.width,
      height: settings.height,
      image: signatureImage || undefined,
      text: settings.text,
      textSize: settings.textSize,
      color: settings.color,
      includeName: settings.includeName,
      nameText: settings.nameText,
      nameSize: settings.nameSize,
    };

    setPlacedSignatures(prev => [...prev, newSign]);
    setActiveSignId(newSign.id);
  };

  const handleRemoveSignature = (id: string) => {
    setPlacedSignatures(prev => prev.filter(s => s.id !== id));
    if (activeSignId === id) setActiveSignId(null);
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
    ctx.strokeStyle = settings.color;
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


  const handleApplySignature = async () => {
    if (!file || placedSignatures.length === 0) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      pdfDoc.registerFontkit(fontkit);

      let customFont;
      if (fontBytes) {
        customFont = await pdfDoc.embedFont(fontBytes);
      }

      const pages = pdfDoc.getPages();

      for (const sig of placedSignatures) {
        const pageIndex = sig.page - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        // Convert percentages to PDF coordinates (PDF origin is bottom-left)
        // Adjust for center positioning
        const posX = (sig.x / 100) * width - (sig.width / 2);
        const posY = (1 - sig.y / 100) * height - (sig.height / 2);

        // Parse color
        const colorHex = sig.color || '#000000';
        const r = parseInt(colorHex.slice(1, 3), 16) / 255;
        const g = parseInt(colorHex.slice(3, 5), 16) / 255;
        const b = parseInt(colorHex.slice(5, 7), 16) / 255;
        const color = rgb(r, g, b);

        if (sig.type === 'text') {
          const text = sig.text || '';
          const size = sig.textSize || 12;
          const textWidth = customFont ? customFont.widthOfTextAtSize(text, size) : text.length * size * 0.5;
          const textHeight = size; // Simplification

          page.drawText(text, {
            x: posX - textWidth / 2 + (sig.width / 2), // sig.width is the slider value, but we want to center relative to the drag point
            y: posY - textHeight / 2 + (sig.height / 2),
            size,
            color,
            font: customFont
          });
        } else if (sig.image) {
          const base64Data = sig.image.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

          const signatureImg = await pdfDoc.embedPng(bytes);
          page.drawImage(signatureImg, {
            x: posX,
            y: posY,
            width: sig.width,
            height: sig.height
          });

          if (sig.includeName && sig.nameText) {
            const fontSize = sig.nameSize || 14;
            page.drawText(sig.nameText, {
              x: posX + (sig.width / 2) - (sig.nameText.length * fontSize * 0.25),
              y: posY - (fontSize + 5),
              size: fontSize,
              color
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
          signaturesApplied: placedSignatures.length,
        }
      });
    } catch (e) {
      console.error(e);
      toast.error(t('sign.errors.signFailed') || 'Failed to sign PDF');
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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveSignId(id);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !activeSignId) return;
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

    setPlacedSignatures(prev => prev.map(sig => {
      if (sig.id === activeSignId) {
        return {
          ...sig,
          x: Math.max(0, Math.min(100, sig.x + percentDeltaX)),
          y: Math.max(0, Math.min(100, sig.y + percentDeltaY))
        };
      }
      return sig;
    }));

    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  const renderSignaturePreviewOverlay = () => {
    return (
      <>
        {placedSignatures.filter(sig => sig.page === currentPage).map(sig => (
          <div
            key={sig.id}
            style={{
              position: 'absolute',
              zIndex: 10,
              width: sig.type === 'text' ? 'auto' : `${(sig.width / pageSize.width) * 100}%`,
              height: sig.type === 'text' ? 'auto' : `${(sig.height / pageSize.height) * 100}%`,
              border: activeSignId === sig.id ? '2px solid #3b82f6' : '1px dashed #3b82f6',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              cursor: isDragging ? 'grabbing' : 'grab',
              top: `${sig.y}%`,
              left: `${sig.x}%`,
              transform: 'translate(-50%, -50%)',
              userSelect: 'none',
              borderRadius: '4px',
              padding: '4px',
            }}
            onMouseDown={(e) => handleDragStart(e, sig.id)}
            onTouchStart={(e) => handleDragStart(e, sig.id)}
            className="group relative"
          >
            {sig.type === 'text' ? (
              <div style={{
                fontSize: `${(sig.textSize || 12) * fontScale}px`,
                fontFamily: 'Roboto, sans-serif',
                whiteSpace: 'nowrap',
                color: sig.color,
                lineHeight: 1
              }}>
                {sig.text}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                {sig.image && <img src={sig.image} alt="sig" className="w-full h-auto pointer-events-none" />}
                {sig.includeName && sig.nameText && (
                  <div style={{
                    fontSize: `${(sig.nameSize || 14) * 0.8}px`,
                    fontFamily: 'sans-serif',
                    color: sig.color,
                    borderTop: '1px solid #ccc',
                    paddingTop: '2px',
                    width: '100%',
                    textAlign: 'center'
                  }}>
                    {sig.nameText}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleRemoveSignature(sig.id); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <Tabs value={settings.type} onValueChange={(v) => {
        setSettings({ ...settings, type: v as SignatureType });
        if (v === 'draw') setTimeout(initCanvas, 50);
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="draw">{t('sign.modeDraw')}</TabsTrigger>
          <TabsTrigger value="upload">{t('sign.modeUpload')}</TabsTrigger>
          <TabsTrigger value="text">{t('sign.modeText')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">{t('sign.color')}</Label>
        <div className="flex gap-3">
          {['#000000', '#0000FF', '#FF0000'].map(c => (
            <button
              key={c}
              onClick={() => {
                setSettings({ ...settings, color: c });
                if (settings.type === 'draw') setTimeout(initCanvas, 10);
              }}
              style={{ backgroundColor: c }}
              className={`w-8 h-8 rounded-full border-2 ${settings.color === c ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {settings.type === 'draw' && (
        <div className="space-y-2">
          <Label>{t('sign.drawSignature')}</Label>
          <div className="border rounded-md overflow-hidden bg-white shadow-inner h-32 relative">
            <canvas
              ref={canvasRef}
              width={300}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs w-full text-red-500 hover:text-red-600">
            {t('sign.clearSignature')}
          </Button>
          <Button onClick={handleAddSignature} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 h-9 text-xs">
            {t('sign.apply')}
          </Button>
        </div>
      )}

      {settings.type === 'upload' && (
        <div className="space-y-4">
          <Label>{t('sign.uploadImage')}</Label>
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          {signatureImage && (
            <div className="border rounded p-2 bg-white">
              <img src={signatureImage} className="max-h-20 mx-auto" alt="preview" />
            </div>
          )}
          <Button onClick={handleAddSignature} disabled={!signatureImage} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 h-9 text-xs">
            {t('sign.apply')}
          </Button>
        </div>
      )}

      {settings.type === 'text' && (
        <div className="space-y-3">
          <Label>{t('sign.signatureText')}</Label>
          <Input value={settings.text} onChange={e => setSettings({ ...settings, text: e.target.value })} placeholder="Your Name" />
          <Label>{t('sign.textSize')}: {settings.textSize}pt</Label>
          <Input type="range" min={8} max={72} value={settings.textSize} onChange={e => setSettings({ ...settings, textSize: parseInt(e.target.value) })} />
          <Button onClick={handleAddSignature} disabled={!settings.text} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 h-9 text-xs">
            {t('sign.apply')}
          </Button>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t">
        <div className="flex justify-between items-center text-xs">
          <Label>{t('sign.width')}: {settings.width}px</Label>
        </div>
        <Input type="range" min={50} max={600} value={settings.width} onChange={e => setSettings({ ...settings, width: parseInt(e.target.value) })} />

        <div className="flex justify-between items-center text-xs">
          <Label>{t('sign.height')}: {settings.height}px</Label>
        </div>
        <Input type="range" min={20} max={400} value={settings.height} onChange={e => setSettings({ ...settings, height: parseInt(e.target.value) })} />
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
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-gray-800 shadow-inner min-h-[600px]">
        {/* Page Navigation Toolbar */}
        <div className="bg-white dark:bg-gray-900 border-b p-2 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
              {t('sign.prevPage')}
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
              {t('sign.nextPage')}
            </Button>
          </div>

          <div className="flex items-center border rounded-md px-1 bg-gray-50 dark:bg-gray-800">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}>-</Button>
            <span className="text-xs font-mono min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(prev => Math.min(3.0, prev + 0.1))}>+</Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px]" onClick={() => setZoom(1.0)}>Reset</Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 relative overflow-auto"
          onMouseMove={handleDragMove} onTouchMove={handleDragMove} onMouseUp={handleDragEnd} onTouchEnd={handleDragEnd} onMouseLeave={handleDragEnd}>
          {previewUrl ? (
            <div id="signature-preview-container"
              ref={containerRef}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}
              className="relative shadow-2xl bg-white leading-[0] w-fit mx-auto">
              <img src={previewUrl} alt="PDF Preview" className="max-h-[550px] w-auto object-contain pointer-events-none select-none" />
              {renderSignaturePreviewOverlay()}
            </div>
          ) : (
            <p className="text-gray-500">{t('sign.generatingPreview')}</p>
          )}
        </div>
      </div>
    );
  };

  const renderActions = () => (
    <Button onClick={handleApplySignature} disabled={isProcessing || placedSignatures.length === 0} className="w-full py-6 text-lg font-bold bg-green-600 hover:bg-green-700 text-white">
      {isProcessing ? t('common.processing') : t('sign.finishAndSave')}
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
