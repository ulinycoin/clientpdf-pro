import React, { useState, useEffect, useMemo } from 'react';
import { PDFProcessingResult } from '../../types';
import { RotateService } from '../../services/rotateService';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';

interface ModernRotateToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult) => void;
  onClose: () => void;
  className?: string;
}

const ModernRotateTool: React.FC<ModernRotateToolProps> = React.memo(({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const { shouldAnimate } = useMotionPreferences();
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [pageSelection, setPageSelection] = useState<'all' | 'specific'>('all');
  const [specificPages, setSpecificPages] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<{
    totalPages: number;
    pageOrientations: ('portrait' | 'landscape')[];
  } | null>(null);

  const selectedFile = files[0]; // Rotate works with single file

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} МБ`;
  };

  const clearError = () => setError(null);

  useEffect(() => {
    const loadPageInfo = async () => {
      if (selectedFile) {
        try {
          const info = await RotateService.getPageInfo(selectedFile);
          setPageInfo(info);
        } catch (err) {
          console.error('Failed to load page info:', err);
          setPageInfo(null);
        }
      }
    };
    
    loadPageInfo();
  }, [selectedFile]);

  const getRotationInfo = (degrees: number) => {
    switch (degrees) {
      case 90:
        return { icon: '↻', label: 'По часовой', description: '90° вправо' };
      case 180:
        return { icon: '⟲', label: 'Переворот', description: '180° полный' };
      case 270:
        return { icon: '↺', label: 'Против часовой', description: '270° влево' };
      default:
        return { icon: '↻', label: 'По часовой', description: '90° вправо' };
    }
  };

  const handleRotate = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      let options: any = { rotation };

      if (pageSelection === 'specific') {
        // Parse specific pages from string
        const pageNumbers = specificPages
          .split(',')
          .map(p => {
            const num = parseInt(p.trim());
            return isNaN(num) ? -1 : num - 1; // Convert to 0-based
          })
          .filter(p => p >= 0);
        
        if (pageNumbers.length === 0) {
          setError('Введите корректные номера страниц');
          setIsProcessing(false);
          return;
        }

        options.pages = pageNumbers;
      }

      setProgress(50);

      const result = await RotateService.rotatePDF(selectedFile, options);
      
      setProgress(100);
      
      if (!result.success) {
        setError(result.error?.message || 'Ошибка поворота PDF');
        return;
      }

      setTimeout(() => {
        onComplete(result);
      }, 500);

    } catch (error) {
      console.error('Rotate error:', error);
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsProcessing(false);
    }
  };

  const canRotate = useMemo(() => {
    return selectedFile && !isProcessing;
  }, [selectedFile, isProcessing]);

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
            Выберите PDF файл для поворота страниц
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
              🔄
            </div>
            <div>
              <h2 className="text-2xl font-black text-black dark:text-white">
                Поворот PDF страниц
              </h2>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {selectedFile.name} • {formatSize(selectedFile.size)}
                {pageInfo && ` • ${pageInfo.totalPages} страниц`}
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
        <div className="flex flex-wrap justify-center gap-4">
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
              Точный поворот
            </span>
          </div>
        </div>
      </div>

      {/* Rotation Angle Selection */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-seafoam-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            🎯
          </div>
          <div>
            <h3 className="text-xl font-black text-black dark:text-white">
              Угол поворота
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
              Выберите направление и угол поворота страниц
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([90, 180, 270] as const).map((degrees, index) => {
            const rotationInfo = getRotationInfo(degrees);
            const isSelected = rotation === degrees;
            
            return (
              <button
                key={degrees}
                onClick={() => setRotation(degrees)}
                disabled={isProcessing}
                className={`
                  p-6 rounded-2xl border-2 transition-all duration-200 text-center group
                  ${isSelected
                    ? 'border-seafoam-500 bg-seafoam-50/50 dark:bg-seafoam-900/20 ring-2 ring-seafoam-500 shadow-lg'
                    : 'border-white/30 dark:border-gray-600/30 bg-white/60 dark:bg-gray-800/60 hover:border-seafoam-400 hover:bg-seafoam-50/30 dark:hover:bg-seafoam-900/10 hover:shadow-md hover:scale-[1.02]'
                  }
                  ${isProcessing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                  ${shouldAnimate ? 'smooth-reveal' : ''}
                `}
                style={{ animationDelay: shouldAnimate ? `${index * 100}ms` : undefined }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-200
                    ${isSelected
                      ? 'bg-gradient-to-br from-seafoam-500 to-ocean-500 text-white scale-110'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 group-hover:scale-105'
                    }
                  `}>
                    {rotationInfo.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg ${
                      isSelected ? 'text-seafoam-700 dark:text-seafoam-300' : 'text-black dark:text-white'
                    }`}>
                      {rotationInfo.label}
                    </h4>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {rotationInfo.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Selection */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-privacy-500 to-privacy-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            📄
          </div>
          <div>
            <h3 className="text-xl font-black text-black dark:text-white">
              Выбор страниц
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
              Укажите какие страницы нужно повернуть
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              value: 'all',
              label: 'Все страницы',
              description: pageInfo ? `Повернуть все ${pageInfo.totalPages} страниц` : 'Повернуть все страницы документа',
              icon: '📚'
            },
            {
              value: 'specific',
              label: 'Конкретные страницы',
              description: 'Указать номера страниц для поворота',
              icon: '🎯'
            }
          ].map((option, index) => (
            <label 
              key={option.value}
              className={`
                flex items-start gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl cursor-pointer transition-all duration-200
                ${pageSelection === option.value ? 'ring-2 ring-seafoam-500 bg-seafoam-50/50 dark:bg-seafoam-900/20' : 'hover:shadow-md hover:scale-[1.01]'}
                ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
                ${shouldAnimate ? 'smooth-reveal' : ''}
              `}
              style={{ animationDelay: shouldAnimate ? `${index * 100}ms` : undefined }}
            >
              <input
                type="radio"
                name="pageSelection"
                value={option.value}
                checked={pageSelection === option.value}
                onChange={(e) => setPageSelection(e.target.value as 'all' | 'specific')}
                disabled={isProcessing}
                className="sr-only"
              />
              <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                {option.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-black dark:text-white mb-1">{option.label}</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{option.description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Specific Pages Input */}
        {pageSelection === 'specific' && (
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-600/20">
            <label className="block text-sm font-bold text-black dark:text-white mb-2">
              Номера страниц
            </label>
            <input
              type="text"
              placeholder="Например: 1, 3, 5, 7"
              value={specificPages}
              onChange={(e) => setSpecificPages(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-seafoam-500 focus:border-seafoam-500 transition-all"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              Введите номера страниц через запятую
            </p>
          </div>
        )}
      </div>

      {/* Page Overview */}
      {pageInfo && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              👁️
            </div>
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">
                Обзор страниц
              </h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                Текущая ориентация каждой страницы
              </p>
            </div>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-20 gap-2 mb-4">
            {pageInfo.pageOrientations.map((orientation, index) => (
              <div
                key={index}
                className={`
                  aspect-[3/4] text-xs flex items-center justify-center rounded-lg font-bold shadow-sm transition-all duration-200 hover:scale-110
                  ${orientation === 'portrait'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-800'
                  }
                `}
                title={`Страница ${index + 1} - ${orientation === 'portrait' ? 'Книжная' : 'Альбомная'}`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-5 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Книжная ориентация
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 rounded"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Альбомная ориентация
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Section */}
      {isProcessing && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg animate-spin">
              🔄
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">
              Поворот в процессе
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {progress < 50 ? 'Анализ PDF файла...' : 'Поворот страниц...'}
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

      {/* Info Box */}
      <div className={`bg-seafoam-50/90 dark:bg-seafoam-900/20 backdrop-blur-lg border border-seafoam-200/50 dark:border-seafoam-800/50 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-seafoam-500 rounded-xl flex items-center justify-center text-white text-xl">
            💡
          </div>
          <div>
            <h4 className="font-bold text-seafoam-800 dark:text-seafoam-200 mb-2">
              Совет по использованию
            </h4>
            <p className="text-seafoam-700 dark:text-seafoam-300 font-medium text-sm leading-relaxed">
              Используйте обзор страниц выше, чтобы понять какие страницы имеют неправильную ориентацию. 
              Синие страницы - книжная ориентация, зеленые - альбомная. Поворот на 90° меняет ориентацию с книжной на альбомную.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRotate}
            disabled={!canRotate}
            className={`
              btn-privacy-modern text-lg px-8 py-4 flex-1 sm:flex-none min-w-[200px]
              ${shouldAnimate ? 'ripple-effect btn-press' : ''}
              ${isProcessing ? 'animate-pulse' : ''}
            `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Поворот...
              </div>
            ) : (
              `Повернуть на ${rotation}°`
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

ModernRotateTool.displayName = 'ModernRotateTool';

export default ModernRotateTool;