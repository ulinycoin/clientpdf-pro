import React, { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

interface TextOccurrence {
  id: string;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
}

type SearchMode = 'manual' | 'visual';

export const EditTextPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [loadedFromShared, setLoadedFromShared] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  // Search and replace settings
  const [searchMode, setSearchMode] = useState<SearchMode>('manual');
  const [searchText, setSearchText] = useState('');
  const [replacementText, setReplacementText] = useState('');
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [occurrences, setOccurrences] = useState<TextOccurrence[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(12);

  // Auto-load file from shared state
  useEffect(() => {
    if (sharedFile && !file && !result) {
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

      pdfService.getPDFInfo(sharedFileObj).then((info) => {
        setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      }).catch(() => {
        setFile((prev) =>
          prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
        );
      });

      clearSharedFile();
    }
  }, [sharedFile, file, result, clearSharedFile]);

  // Auto-save result to sharedFile when processing is complete
  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
      setSharedFile(result, fileName, 'edit-text-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

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
    setOccurrences([]);
    setSearchText('');
    setReplacementText('');

    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
    } catch (error) {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
      );
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setOccurrences([]);
    setSearchText('');
    setReplacementText('');
  };

  const handleSearchText = async () => {
    if (!file || !searchText.trim()) return;

    setIsSearching(true);
    try {
      const foundOccurrences = await pdfService.findTextInPDF(
        file.file,
        searchText,
        selectedPage
      );

      const mappedOccurrences: TextOccurrence[] = foundOccurrences.map((occ, index) => ({
        id: `${occ.pageNumber}-${index}`,
        pageNumber: occ.pageNumber,
        text: occ.text,
        x: occ.x,
        y: occ.y,
        width: occ.width,
        height: occ.height,
        selected: true, // By default, select all occurrences
      }));

      setOccurrences(mappedOccurrences);
    } catch (error) {
      console.error('Error searching text:', error);
      alert(t('editText.searchError'));
    } finally {
      setIsSearching(false);
    }
  };

  const toggleOccurrence = (id: string) => {
    setOccurrences((prev) =>
      prev.map((occ) => (occ.id === id ? { ...occ, selected: !occ.selected } : occ))
    );
  };

  const toggleAllOccurrences = () => {
    const allSelected = occurrences.every((occ) => occ.selected);
    setOccurrences((prev) => prev.map((occ) => ({ ...occ, selected: !allSelected })));
  };

  const handleReplaceText = async () => {
    if (!file || occurrences.length === 0 || !replacementText.trim()) return;

    const selectedOccurrences = occurrences.filter((occ) => occ.selected);
    if (selectedOccurrences.length === 0) {
      alert(t('editText.noOccurrencesSelected'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      const replaceResult = await pdfService.replaceTextInPDF(
        file.file,
        selectedOccurrences,
        replacementText,
        {
          backgroundColor,
          textColor,
          fontSize,
          dpi: 150,
        },
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (replaceResult.success && replaceResult.data) {
        setResult(replaceResult.data);
        // Clear occurrences after successful replacement
        setOccurrences([]);
        setSearchText('');
        setReplacementText('');
      } else {
        throw new Error(replaceResult.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error replacing text:', error);
      alert(t('editText.replaceError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUseInTool = (targetTool: Tool) => {
    if (!result) return;
    const fileName = file?.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
    setSharedFile(result, fileName, 'edit-text-pdf');
    window.location.hash = HASH_TOOL_MAP[targetTool];
  };

  const maxPages = file?.info?.pages || 0;
  const hasFile = !!file;
  const hasResult = !!result;
  const canSearch = hasFile && searchText.trim().length > 0 && !isSearching;
  const canReplace = occurrences.filter((occ) => occ.selected).length > 0 && replacementText.trim().length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.edit-text-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.edit-text-pdf.description')}
        </p>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {t('editText.rasterizationWarning')}
          </p>
        </div>
      </div>

      {/* File Upload */}
      {!hasFile && !hasResult && (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept=".pdf"
          maxFiles={1}
          title={t('common.uploadFile')}
          description={t('common.uploadDescription')}
        />
      )}

      {/* Main Editing Interface */}
      {hasFile && !hasResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {maxPages} {t('common.pages')}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t('common.remove')}
                </button>
              </div>
            </div>

            {/* Page Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('editText.selectPage')}
              </h3>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  {t('common.page')}:
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxPages}
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  / {maxPages}
                </span>
              </div>
            </div>

            {/* Search Text */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('editText.searchText')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('editText.textToFind')}
                  </label>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={t('editText.enterTextToFind')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleSearchText}
                  disabled={!canSearch}
                  className="w-full px-6 py-3 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? t('common.searching') : t('editText.findText')}
                </button>
              </div>
            </div>

            {/* Occurrences List */}
            {occurrences.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('editText.occurrencesFound', { count: occurrences.length })}
                  </h3>
                  <button
                    onClick={toggleAllOccurrences}
                    className="text-sm text-ocean-500 hover:text-ocean-600"
                  >
                    {occurrences.every((occ) => occ.selected)
                      ? t('editText.deselectAll')
                      : t('editText.selectAll')}
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {occurrences.map((occ) => (
                    <div
                      key={occ.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={occ.selected}
                        onChange={() => toggleOccurrence(occ.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          "{occ.text}"
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('common.page')} {occ.pageNumber} • x: {Math.round(occ.x)}, y: {Math.round(occ.y)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Replacement Settings */}
            {occurrences.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('editText.replacementSettings')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('editText.newText')}
                    </label>
                    <input
                      type="text"
                      value={replacementText}
                      onChange={(e) => setReplacementText(e.target.value)}
                      placeholder={t('editText.enterNewText')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editText.backgroundColor')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editText.textColor')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('editText.fontSize')}: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={72}
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={handleReplaceText}
                    disabled={!canReplace || isProcessing}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('editText.replaceText')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('common.preview')}
            </h3>
            <div className="flex flex-col items-center">
              <PDFPreview
                file={file.file}
                pageNumber={selectedPage}
                width={600}
                height={800}
              />
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.processing')}
          </h3>
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}

      {/* Result */}
      {hasResult && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('common.success')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('editText.successMessage')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors"
                >
                  {t('common.download')}
                </button>
                <button
                  onClick={handleRemoveFile}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t('common.processAnother')}
                </button>
              </div>

              {/* Use in other tools */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('common.useInOtherTools')}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(['merge-pdf', 'compress-pdf', 'protect-pdf', 'watermark-pdf'] as Tool[]).map(
                    (tool) => (
                      <button
                        key={tool}
                        onClick={() => handleUseInTool(tool)}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t(`tools.${tool}.name`)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
