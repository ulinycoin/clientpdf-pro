import React, { useState, useMemo } from 'react';
import { PDFProcessingResult } from '../../types';
import { SplitService } from '../../services/splitService';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';

interface ModernSplitToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult[], options?: { useZip?: boolean }) => void;
  onClose: () => void;
  className?: string;
}

type SplitMode = 'all' | 'range' | 'specific';

const ModernSplitTool: React.FC<ModernSplitToolProps> = React.memo(({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const { shouldAnimate } = useMotionPreferences();
  const [mode, setMode] = useState<SplitMode>('all');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [specificPages, setSpecificPages] = useState<string>('');
  const [useZip, setUseZip] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectedFile = files?.[0]; // Split works with single file

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} МБ`;
  };

  const clearError = () => setError(null);

  const handleSplit = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      let options: any = { mode: 'pages' };

      if (mode === 'range') {
        if (startPage > endPage) {
          setError('Начальная страница не может быть больше конечной');
          setIsProcessing(false);
          return;
        }
        options = {
          mode: 'range',
          startPage: startPage - 1, // Convert to 0-based
          endPage: endPage - 1
        };
      } else if (mode === 'specific') {
        // Parse specific pages from string
        const pageNumbers = specificPages
          .split(',')
          .map(p => parseInt(p.trim()) - 1) // Convert to 0-based
          .filter(p => !isNaN(p) && p >= 0);

        if (pageNumbers.length === 0) {
          setError('Введите корректные номера страниц');
          setIsProcessing(false);
          return;
        }

        options = {
          mode: 'pages',
          pages: pageNumbers
        };
      }

      setProgress(50);

      const results = await SplitService.splitPDF(selectedFile, options);

      setProgress(100);

      // Filter out failed results for display
      const successResults = results.filter(r => r.success);

      if (successResults.length === 0) {
        const errorMessages = results
          .filter(r => !r.success)
          .map(r => r.error?.message || 'Неизвестная ошибка')
          .join(', ');
        setError(`Ошибка разделения: ${errorMessages}`);
        return;
      }

      setTimeout(() => {
        onComplete(results, { useZip });
      }, 500);

    } catch (error) {
      console.error('Split error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка разделения PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const canSplit = useMemo(() => {
    return selectedFile && !isProcessing;
  }, [selectedFile, isProcessing]);

  const getModeDescription = () => {
    switch (mode) {
      case 'all': return 'Каждая страница станет отдельным PDF файлом';
      case 'range': return `Страницы ${startPage}-${endPage} будут извлечены в один файл`;
      case 'specific': return 'Выбранные страницы станут отдельными файлами';
      default: return '';
    }
  };

  if (!selectedFile) {
    return (
      <div className={`max-w-3xl mx-auto ${className}`}>
        <div className={`bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg p-8 text-center ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white mb-4">
            Файл не выбран
          </h2>
          <p className="text-gray-800 dark:text-gray-100 font-medium mb-6">
            Выберите PDF файл для разделения
          </p>
          <button
            onClick={onClose}
            className="btn-ocean-modern"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      {/* Header */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              ✂️
            </div>
            <div>
              <h2 className="text-2xl font-black text-black dark:text-white">
                Разделение PDF файла
              </h2>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {selectedFile.name} • {formatSize(selectedFile.size)}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 disabled:opacity-50"
            aria-label="Закрыть"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <div className={`w-2 h-2 rounded-full bg-success-500 ${shouldAnimate ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Приватная обработка
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <svg className="w-4 h-4 text-seafoam-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Высокое качество
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-seafoam-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            🎯
          </div>
          <div>
            <h3 className="text-xl font-black text-black dark:text-white">
              Режим разделения
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
              Выберите способ разделения PDF
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { 
              value: 'all', 
              label: 'Разделить на отдельные страницы', 
              desc: 'Каждая страница станет отдельным PDF файлом',
              icon: '📑'
            },
            { 
              value: 'range', 
              label: 'Извлечь диапазон страниц', 
              desc: 'Выбрать конкретный диапазон страниц',
              icon: '📐'
            },
            { 
              value: 'specific', 
              label: 'Извлечь конкретные страницы', 
              desc: 'Указать номера страниц через запятую',
              icon: '📋'
            }
          ].map((option, index) => (
            <label 
              key={option.value}
              className={`
                flex items-start gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl cursor-pointer transition-all duration-200
                ${mode === option.value ? 'ring-2 ring-seafoam-500 bg-seafoam-50/50 dark:bg-seafoam-900/20' : 'hover:shadow-md hover:scale-[1.01]'}
                ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
                ${shouldAnimate ? 'smooth-reveal' : ''}
              `}
              style={{ animationDelay: shouldAnimate ? `${index * 100}ms` : undefined }}
            >
              <input
                type="radio"
                name="splitMode"
                value={option.value}
                checked={mode === option.value}
                onChange={(e) => setMode(e.target.value as SplitMode)}
                disabled={isProcessing}
                className="sr-only"
              />
              <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                {option.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-black dark:text-white mb-1">{option.label}</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 p-4 bg-seafoam-50/50 dark:bg-seafoam-900/20 rounded-xl border border-seafoam-200/50 dark:border-seafoam-800/50">
          <p className="text-sm font-medium text-seafoam-800 dark:text-seafoam-200">
            💡 {getModeDescription()}
          </p>
        </div>
      </div>

      {/* Range Input */}
      {mode === 'range' && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-privacy-500 to-privacy-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📐
            </div>
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">
                Диапазон страниц
              </h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                Укажите начальную и конечную страницы
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-sm font-bold text-black dark:text-white mb-2">
                С страницы
              </label>
              <input
                type="number"
                min="1"
                value={startPage}
                onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-seafoam-500 focus:border-seafoam-500 transition-all"
              />
            </div>
            
            <div className="text-2xl text-gray-600 dark:text-gray-400 pt-8">→</div>
            
            <div className="flex-1">
              <label className="block text-sm font-bold text-black dark:text-white mb-2">
                По страницу
              </label>
              <input
                type="number"
                min="1"
                value={endPage}
                onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-seafoam-500 focus:border-seafoam-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Specific Pages Input */}
      {mode === 'specific' && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-privacy-500 to-privacy-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📋
            </div>
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">
                Конкретные страницы
              </h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                Укажите номера страниц через запятую
              </p>
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Например: 1, 3, 5-7, 10"
              value={specificPages}
              onChange={(e) => setSpecificPages(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-seafoam-500 focus:border-seafoam-500 transition-all"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              Используйте запятые для разделения и дефис для диапазонов (например: 1, 3, 5-7)
            </p>
          </div>
        </div>
      )}

      {/* ZIP Option */}
      {(mode === 'all' || mode === 'specific') && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={useZip}
              onChange={(e) => setUseZip(e.target.checked)}
              disabled={isProcessing}
              className="w-5 h-5 text-seafoam-600 bg-white border-gray-300 rounded focus:ring-seafoam-500 focus:ring-2"
            />
            <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-seafoam-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              📦
            </div>
            <div>
              <h4 className="font-black text-black dark:text-white">
                Упаковать в ZIP архив
              </h4>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Рекомендуется при разделении на 5+ страниц
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Progress Section */}
      {isProcessing && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
              ⚡
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">
              Разделение в процессе
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {progress < 50 ? 'Анализ PDF файла...' : 'Разделение страниц...'}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Прогресс</span>
              <span className="text-sm font-bold text-seafoam-600 dark:text-seafoam-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-seafoam-500 to-ocean-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {shouldAnimate && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Section */}
      {error && (
        <div className={`bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white text-xl">
              ⚠️
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-800 dark:text-red-200 mb-1">Ошибка обработки</h4>
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSplit}
            disabled={!canSplit}
            className={`
              btn-privacy-modern text-lg px-8 py-4 flex-1 sm:flex-none min-w-[200px]
              ${shouldAnimate ? 'ripple-effect btn-press' : ''}
              ${isProcessing ? 'animate-pulse' : ''}
            `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Обработка...
              </div>
            ) : (
              `Разделить PDF`
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="btn-ocean-modern text-lg px-8 py-4 flex-1 sm:flex-none min-w-[200px]"
          >
            {isProcessing ? 'Отменить' : 'Назад'}
          </button>
        </div>
      </div>
    </div>
  );
});

ModernSplitTool.displayName = 'ModernSplitTool';

export default ModernSplitTool;