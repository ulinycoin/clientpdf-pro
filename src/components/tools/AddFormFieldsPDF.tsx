import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { Canvas } from './AddFormFieldsPDF/Canvas';
import { Toolbar } from './AddFormFieldsPDF/Toolbar';
import { FieldPanel } from './AddFormFieldsPDF/FieldPanel';
import { addFormFieldsToPDF } from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import type { FormField } from '@/types/formFields';

export const AddFormFieldsPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, message: '' });

  // Form fields state
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);

  // Auto-load shared file
  useEffect(() => {
    if (sharedFile && !file) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFilesSelected([sharedFileObj]);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // Auto-save result to sharedFile when processing is complete
  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_with_form.pdf') || 'with_form.pdf';
      setSharedFile(result, fileName, 'add-form-fields-pdf');
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
      status: 'completed',
    };

    setFile(uploadedFile);
    setResult(null);
    setResultSaved(false);
    setFormFields([]);
    setSelectedFieldId(null);
  };

  // Get selected field
  const selectedField = formFields.find(field => field.id === selectedFieldId) || null;

  // Add new field
  const handleAddField = useCallback((type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: `${type}_field_${formFields.length + 1}`,
      x: 100,
      y: 100,
      width: type === 'checkbox' || type === 'radio' ? 20 : 200,
      height: type === 'multiline' ? 80 : 20,
      page: currentPage,
      ...(type === 'dropdown' && { options: ['Option 1', 'Option 2', 'Option 3'] }),
      ...(type === 'radio' && { group: `radio_group_${formFields.filter(f => f.type === 'radio').length + 1}`, value: 'option1' }),
    } as FormField;

    setFormFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
  }, [currentPage, formFields.length]);

  // Update field
  const handleUpdateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFormFields(prev => prev.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  }, []);

  // Delete field
  const handleDeleteField = useCallback((fieldId: string) => {
    setFormFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  }, [selectedFieldId]);

  // Move field
  const handleMoveField = useCallback((fieldId: string, x: number, y: number) => {
    handleUpdateField(fieldId, { x, y });
  }, [handleUpdateField]);

  // Resize field
  const handleResizeField = useCallback((fieldId: string, width: number, height: number) => {
    handleUpdateField(fieldId, { width, height });
  }, [handleUpdateField]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!file?.file || formFields.length === 0) {
      alert('Please add at least one form field before saving');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await addFormFieldsToPDF(file.file, {
        fields: formFields,
        onProgress: (percent, message) => {
          setProgress({ percent, message });
        },
      });

      if (result.success && result.data) {
        setResult(result.data);
      } else {
        alert('Error: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  }, [file, formFields]);

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.name.replace('.pdf', '_with_form.pdf') || 'document_with_form.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setFormFields([]);
    setSelectedFieldId(null);
  };

  const handleQuickAction = (toolId: Tool) => {
    if (result) {
      setSharedFile(result, file?.name.replace('.pdf', '_with_form.pdf') || 'document_with_form.pdf', 'add-form-fields-pdf');
    }
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  // If no file, show upload zone
  if (!file) {
    return (
      <div className="card p-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {t('tools.add-form-fields-pdf.name')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('tools.add-form-fields-pdf.description')}
        </p>

        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
        />
      </div>
    );
  }

  // If result, show success and download
  if (result) {
    return (
      <div className="card p-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {t('tools.add-form-fields-pdf.name')}
        </h2>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              ✓ {t('common.success')}
            </h3>
            <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <p>Form fields added: {formFields.length}</p>
              <p>Original size: {(file.size / 1024).toFixed(2)} KB</p>
              <p>New size: {(result.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="flex-1 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg font-semibold transition-colors"
            >
              {t('common.download')}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
            >
              {t('common.processAnother')}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.whatsNext')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Continue working with your PDF using these tools:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  Reduce file size
                </p>
              </div>
            </button>

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

            <button
              onClick={() => handleQuickAction('flatten-pdf')}
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
            >
              <span className="text-3xl">📋</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                  {t('tools.flatten-pdf.name')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Flatten form
                </p>
              </div>
            </button>

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
                  Extract pages
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main editor interface
  return (
    <div className="card flex flex-col" style={{ height: 'calc(100vh - 120px)', minHeight: '800px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('tools.add-form-fields-pdf.name')}
        </h2>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
          <div className="text-xs font-medium text-gray-900 dark:text-white">
            {formFields.length} field{formFields.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
        <Toolbar
          currentPage={currentPage}
          totalPages={totalPages}
          scale={scale}
          onPageChange={setCurrentPage}
          onScaleChange={setScale}
          onSave={handleSave}
          onAddField={handleAddField}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Field panel */}
        <div className="flex-shrink-0">
          <FieldPanel
            selectedField={selectedField}
            onFieldUpdate={handleUpdateField}
            onFieldDelete={handleDeleteField}
          />
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Canvas
              pdfFile={file?.file || null}
              currentPage={currentPage}
              formFields={formFields}
              selectedFieldId={selectedFieldId}
              scale={scale}
              onFieldSelect={setSelectedFieldId}
              onFieldMove={handleMoveField}
              onFieldResize={handleResizeField}
              onPageChange={setCurrentPage}
              onTotalPagesChange={setTotalPages}
            />
          </div>

          {/* Status bar */}
          <div className="p-2 border-t bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 flex justify-between flex-shrink-0">
            <div>
              Fields: {formFields.length}
              {selectedField && ` | Selected: ${selectedField.name} (${selectedField.type})`}
            </div>
            <div>
              Zoom: {Math.round(scale * 100)}% | Page {currentPage + 1} of {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-6"></div>
            <p className="text-gray-900 dark:text-white font-bold text-lg mb-2">{progress.message}</p>
            <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-ocean-500 h-2 rounded-full transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{Math.round(progress.percent)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};
