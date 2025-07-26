import React, { memo, useState, useCallback } from 'react';
import { usePDFWorker } from '../../hooks/usePDFWorker';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

interface EnhancedPDFProcessorProps {
  className?: string;
}

const EnhancedPDFProcessor: React.FC<EnhancedPDFProcessorProps> = memo(({
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [operationType, setOperationType] = useState<'merge' | 'compress'>('merge');
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);

  const {
    isProcessing,
    progress,
    progressMessage,
    error,
    mergePDFs,
    compressPDF,
    cancelOperation
  } = usePDFWorker();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    setSelectedFiles(pdfFiles);
    setProcessedFile(null);

    if (pdfFiles.length !== files.length) {
      alert('Пожалуйста, выберите только PDF файлы');
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      let result: Blob;

      if (operationType === 'merge') {
        if (selectedFiles.length < 2) {
          alert('Для слияния необходимо выбрать минимум 2 файла');
          return;
        }
        result = await mergePDFs(selectedFiles);
      } else {
        if (selectedFiles.length !== 1) {
          alert('Для сжатия выберите один файл');
          return;
        }
        result = await compressPDF(selectedFiles[0], 0.8);
      }

      setProcessedFile(result);
    } catch (error) {
      console.error('Processing error:', error);
    }
  }, [selectedFiles, operationType, mergePDFs, compressPDF]);

  const handleDownload = useCallback(() => {
    if (!processedFile) return;

    const url = URL.createObjectURL(processedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${operationType}-result.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [processedFile, operationType]);

  const resetState = useCallback(() => {
    setSelectedFiles([]);
    setProcessedFile(null);
    if (isProcessing) {
      cancelOperation();
    }
  }, [isProcessing, cancelOperation]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <div className={`max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🚀 Enhanced PDF Processor
        </h2>
        <p className="text-gray-600">
          Демонстрация Web Worker для обработки PDF файлов
        </p>
      </div>

      {/* Выбор операции */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Выберите операцию:
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="operation"
              value="merge"
              checked={operationType === 'merge'}
              onChange={(e) => setOperationType(e.target.value as 'merge' | 'compress')}
              className="mr-2"
              disabled={isProcessing}
            />
            <span className="text-gray-700">Объединить PDF</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="operation"
              value="compress"
              checked={operationType === 'compress'}
              onChange={(e) => setOperationType(e.target.value as 'merge' | 'compress')}
              className="mr-2"
              disabled={isProcessing}
            />
            <span className="text-gray-700">Сжать PDF</span>
          </label>
        </div>
      </div>

      {/* Выбор файлов */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Выберите PDF файлы:
        </label>
        <input
          type="file"
          accept="application/pdf"
          multiple={operationType === 'merge'}
          onChange={handleFileChange}
          disabled={isProcessing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />

        {selectedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Прогресс */}
      {isProcessing && (
        <div className="mb-6">
          <ProgressBar
            progress={progress}
            label={progressMessage || 'Обработка...'}
            animated={true}
            color="blue"
            showPercentage={true}
          />
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Результат */}
      {processedFile && !isProcessing && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm mb-2">
            ✅ Файл успешно обработан! Размер: {formatFileSize(processedFile.size)}
          </p>
          <Button
            onClick={handleDownload}
            variant="primary"
            size="sm"
            className="w-full"
          >
            📥 Скачать результат
          </Button>
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex gap-3">
        <Button
          onClick={handleProcess}
          disabled={selectedFiles.length === 0 || isProcessing}
          loading={isProcessing}
          variant="primary"
          className="flex-1"
        >
          {operationType === 'merge' ? '🔗 Объединить' : '🗜️ Сжать'}
        </Button>

        {isProcessing && (
          <Button
            onClick={cancelOperation}
            variant="danger"
            size="md"
          >
            ❌ Отменить
          </Button>
        )}

        <Button
          onClick={resetState}
          variant="outline"
          disabled={isProcessing}
        >
          🔄 Сброс
        </Button>
      </div>

      {/* Информация о возможностях */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          🌟 Особенности Enhanced PDF Processor:
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Web Worker для неблокирующей обработки</li>
          <li>• Реальный прогресс выполнения операций</li>
          <li>• Оптимизированная типизация TypeScript</li>
          <li>• React.memo для оптимизации рендеринга</li>
          <li>• Улучшенная обработка ошибок</li>
          <li>• Возможность отмены операций</li>
        </ul>
      </div>
    </div>
  );
});

EnhancedPDFProcessor.displayName = 'EnhancedPDFProcessor';

export default EnhancedPDFProcessor;
