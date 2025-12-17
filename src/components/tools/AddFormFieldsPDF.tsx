import React, { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { Canvas } from './AddFormFieldsPDF/Canvas';
import { Toolbar } from './AddFormFieldsPDF/Toolbar';
import { FieldPanel } from './AddFormFieldsPDF/FieldPanel';
import { addFormFieldsToPDF } from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { FormField } from '@/types/formFields';
import { CheckCircle2, Copy } from 'lucide-react';

export const AddFormFieldsPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setProgress] = useState({ percent: 0, message: '' });

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
  }, [currentPage, formFields.length]); // formFields.length is a primitive, so it's safe. formFields itself would cause re-renders.

  // Update field
  const handleUpdateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFormFields(prev => prev.map(field =>
      field.id === fieldId ? { ...field, ...updates } as FormField : field
    ));
  }, []);

  // Delete field
  const handleDeleteField = useCallback((fieldId: string) => {
    setFormFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  }, [selectedFieldId]);

  // Handle Duplication (Clone selected field)
  const handleDuplicateField = useCallback(() => {
    if (!selectedFieldId) return;
    const fieldToClone = formFields.find(f => f.id === selectedFieldId);
    if (!fieldToClone) return;

    const newField: FormField = {
      ...fieldToClone,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${fieldToClone.name}_copy`,
      x: fieldToClone.x + 20, // Offset slightly
      y: fieldToClone.y + 20,
    };

    setFormFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
  }, [selectedFieldId, formFields]);

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
      alert(t('addFormFields.alertNoFields'));
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
      alert(t('common.error') + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  }, [file, formFields, t, setProgress]);

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



  const renderContent = () => {
    if (!file) return null;

    if (result) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('common.success')}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p>{t('addFormFields.addedCount', { count: formFields.length })}</p>
                <p>{t('addFormFields.newSize', { size: (result.size / 1024).toFixed(2) })}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              {t('common.download')}
            </Button>
            <Button variant="outline" onClick={handleReset} size="lg">
              {t('common.processAnother')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full space-y-4">
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
            hideSave={true} // Hide save here as it's in actions
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-xl relative border border-gray-200 dark:border-gray-700">
          <div className="absolute inset-0 overflow-auto flex items-center justify-center p-4">
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
        </div>

        {/* Status Bar */}
        <div className="text-xs text-center text-gray-500">
          {t('addFormFields.fields', { count: formFields.length })}
          {selectedField && ` | ${selectedField.name} (${selectedField.type})`}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    if (!selectedField) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p>{t('addFormFields.selectFieldToEdit')}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => handleAddField('text')}>
            + Add New Field
          </Button>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <FieldPanel
          selectedField={selectedField}
          onFieldUpdate={handleUpdateField}
          onFieldDelete={handleDeleteField}
        />
        <Button variant="outline" className="w-full" onClick={handleDuplicateField}>
          <Copy className="w-4 h-4 mr-2" /> Duplicate Field
        </Button>
      </div>
    );
  };

  const renderActions = () => {
    return (
      <Button
        onClick={handleSave}
        disabled={isProcessing || !file || formFields.length === 0}
        className="w-full py-6 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
      >
        {isProcessing ? t('common.processing') : t('common.save')}
      </Button>
    );
  };

  return (
    <ToolLayout
      title={t('tools.add-form-fields-pdf.name')}
      description={t('tools.add-form-fields-pdf.description')}
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
