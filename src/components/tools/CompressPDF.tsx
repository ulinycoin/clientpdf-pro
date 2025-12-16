import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/common/ToolLayout';
import { Minimize2, Shield, Stamp, Scissors } from 'lucide-react';
import { SmartCompressionPanel } from '@/components/smart/SmartCompressionPanel';
import type { CompressionAnalysis } from '@/types/pdf';

type CompressionQuality = 'low' | 'medium' | 'high';

export const CompressPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile: saveSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [quality, setQuality] = useState<CompressionQuality>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [loadedFromShared, setLoadedFromShared] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [analysis, setAnalysis] = useState<CompressionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-load file from shared state
  useEffect(() => {
    if (sharedFile && !file && !result) {
      // Convert Blob to File
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, {
        type: 'application/pdf',
      });

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}`,
        file: sharedFileObj,
        name: sharedFile.name,
        size: sharedFileObj.size,
        status: 'pending',
      };

      setFile(uploadedFile);
      setLoadedFromShared(true);

      // Get PDF info
      pdfService.getPDFInfo(sharedFileObj).then((info) => {
        setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      }).catch(() => {
        setFile((prev) =>
          prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
        );
      });

      // Analyze compression
      setIsAnalyzing(true);
      pdfService.analyzeCompression(sharedFileObj).then((res) => {
        setAnalysis(res);
        setQuality(res.recommendedQuality);
      }).catch(err => console.error(err))
        .finally(() => setIsAnalyzing(false));

      // Clear shared file after loading

      // Clear shared file after loading
      clearSharedFile();
    }
  }, [sharedFile, file, result, clearSharedFile]);

  // Auto-save result to sharedFile when processing is complete
  useEffect(() => {
    if (result?.blob && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_compressed.pdf') || 'compressed.pdf';
      saveSharedFile(result.blob, fileName, 'compress-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, saveSharedFile]);

  const handleFileSelected = async (selectedFiles: File[]) => {
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

    // Get PDF info
    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));

      // Analyze compression
      setIsAnalyzing(true);
      const res = await pdfService.analyzeCompression(selectedFile);
      setAnalysis(res);
      setQuality(res.recommendedQuality);
      setIsAnalyzing(false);
    } catch (error) {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
      );
      setIsAnalyzing(false);
    }
    setFile((prev) =>
      prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
    );
  }


  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      const result = await pdfService.compressPDF(file.file, quality, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });

      if (result.success && result.data) {
        setResult({ blob: result.data, metadata: result.metadata });
      } else {
        alert(result.error?.message || 'Compression failed');
      }
    } catch (error) {
      alert('An error occurred during compression');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const filename = file?.name.replace('.pdf', '_compressed.pdf') || 'compressed.pdf';
      pdfService.downloadFile(result.blob, filename);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setProgress(0);
    setProgressMessage('');
    clearSharedFile();
    setLoadedFromShared(false);
    setAnalysis(null);
  };

  const handleQuickAction = (toolId: Tool) => {
    // Save the compressed PDF to shared state for the next tool
    if (result?.blob) {
      const filename = file?.name.replace('.pdf', '_compressed.pdf') || 'compressed.pdf';
      saveSharedFile(result.blob, filename, 'compress-pdf');
    }
    // Navigate to the selected tool
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  // Quality presets
  const qualityPresets: Array<{
    id: CompressionQuality;
    icon: string;
    reduction: string;
    description: string;
  }> = [
      {
        id: 'low',
        icon: '🗜️',
        reduction: '~70%',
        description: t('compress.quality.low.description'),
      },
      {
        id: 'medium',
        icon: '⚖️',
        reduction: '~50%',
        description: t('compress.quality.medium.description'),
      },
      {
        id: 'high',
        icon: '✨',
        reduction: '~30%',
        description: t('compress.quality.high.description'),
      },
    ];

  return (
    <ToolLayout
      title={t('tools.compress-pdf.name')}
      description={t('tools.compress-pdf.description')}
      hasFiles={!!file}
      isProcessing={isProcessing}
      onUpload={(files) => handleFileSelected(files)}
      uploadContent={
        <FileUpload
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          maxSizeMB={100}
          disabled={isProcessing}
          title={t('common.selectFile')}
          description={t('upload.singleFileAllowed')}
        />
      }
      settings={
        file && !result ? (
          <div className="space-y-6 animate-slide-up">

            <SmartCompressionPanel
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              currentQuality={quality}
              onApplyRecommendation={(q) => setQuality(q)}
            />

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">⚙️</span> {t('compress.selectQuality')}
              </h3>

              <div className="space-y-3">
                {qualityPresets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setQuality(preset.id)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${quality === preset.id
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-ocean-200 dark:hover:border-ocean-800'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{preset.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${quality === preset.id ? 'text-ocean-700 dark:text-ocean-300' : 'text-gray-900 dark:text-white'
                            }`}>
                            {t(`compress.quality.${preset.id}.name`)}
                          </span>
                          <Badge variant={quality === preset.id ? 'default' : 'secondary'} className="text-xs">
                            {preset.reduction}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null
      }
      actions={
        file && !result ? (
          <Button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full text-lg py-6 shadow-lg shadow-ocean-500/20 bg-ocean-500 hover:bg-ocean-600 text-white"
            size="lg"
          >
            {isProcessing ? t('common.processing') : t('compress.compressButton')}
          </Button>
        ) : result ? (
          <div className="space-y-3">
            <Button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
              size="lg"
            >
              {t('common.download')}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              {t('compress.compressAnother')}
            </Button>
          </div>
        ) : null
      }
    >
      {file && !result && (
        <div className="space-y-6 animate-fade-in">
          {/* Auto-Loaded Banner */}
          {loadedFromShared && (
            <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-medium text-ocean-700 dark:text-ocean-300">
                    {t('compress.autoLoaded.title')}
                  </p>
                  <p className="text-sm text-ocean-600 dark:text-ocean-400">
                    {t('compress.autoLoaded.description')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-ocean-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative">
                <PDFPreview file={file.file} width={300} height={400} />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {file.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {pdfService.formatFileSize(file.size)} • {file.info?.pages} {t('common.pages')}
            </p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-8">
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-scale-in">
          <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center animate-bounce-slow">
                  <span className="text-4xl">🎉</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('compress.success.title')}
                  </h2>
                  <p className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {t('compress.success.saved')} <span className="text-green-600 font-bold">{result.metadata?.compressionRatio}%</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full max-w-md">
                  <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('compress.originalSize')}</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white line-through opacity-50">
                      {pdfService.formatFileSize(result.metadata?.originalSize || 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/5 dark:bg-green-400/5 animate-pulse"></div>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">{t('compress.success.compressedSize')}</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {pdfService.formatFileSize(result.metadata?.processedSize || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => handleQuickAction('protect-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/10 transition-all hover:-translate-y-1">
              <Shield className="h-6 w-6 text-ocean-500" />
              <span>{t('tools.protect-pdf.name')}</span>
            </Button>
            <Button onClick={() => handleQuickAction('merge-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/10 transition-all hover:-translate-y-1">
              <Minimize2 className="h-6 w-6 text-ocean-500" />
              <span>{t('tools.merge-pdf.name')}</span>
            </Button>
            <Button onClick={() => handleQuickAction('split-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/10 transition-all hover:-translate-y-1">
              <Scissors className="h-6 w-6 text-ocean-500" />
              <span>{t('tools.split-pdf.name')}</span>
            </Button>
            <Button onClick={() => handleQuickAction('watermark-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/10 transition-all hover:-translate-y-1">
              <Stamp className="h-6 w-6 text-ocean-500" />
              <span>{t('tools.watermark-pdf.name')}</span>
            </Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};
