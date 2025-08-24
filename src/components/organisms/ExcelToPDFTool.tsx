import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import { ModernUploadZone } from '../molecules';
import ProgressBar from '../atoms/ProgressBar';
import Button from '../atoms/Button';
import ExcelPreview from '../molecules/ExcelPreview';
import { useExcelToPDF, DEFAULT_OPTIONS } from '../../hooks/useExcelToPDF';
import { ConversionOptions } from '../../types/excelToPdf.types';

interface ConversionSettingsProps {
  workbook: any;
  options: ConversionOptions;
  onOptionsChange: (options: ConversionOptions) => void;
  onConvert: () => void;
  isProcessing: boolean;
}

const ConversionSettings: React.FC<ConversionSettingsProps> = ({
  workbook,
  options,
  onOptionsChange,
  onConvert,
  isProcessing
}) => {
  const { t } = useI18n();

  const handleSheetToggle = (sheetName: string) => {
    const selectedSheets = options.selectedSheets.includes(sheetName)
      ? options.selectedSheets.filter(name => name !== sheetName)
      : [...options.selectedSheets, sheetName];

    onOptionsChange({ ...options, selectedSheets });
  };

  const selectAllSheets = () => {
    const allSheetNames = workbook.sheets.map((sheet: any) => sheet.name);
    onOptionsChange({ ...options, selectedSheets: allSheetNames });
  };

  const deselectAllSheets = () => {
    onOptionsChange({ ...options, selectedSheets: [] });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg">
            📊
          </div>
          <h3 className="text-lg font-black text-black dark:text-white">{t('tools.excelToPdf.selectSheets')}</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={selectAllSheets}
            className="px-4 py-2 bg-gradient-to-br from-seafoam-500 to-ocean-500 hover:from-seafoam-600 hover:to-ocean-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {t('tools.excelToPdf.selectAll')}
          </button>
          <button
            onClick={deselectAllSheets}
            className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all duration-300 shadow-lg"
          >
            {t('tools.excelToPdf.deselectAll')}
          </button>
        </div>

        <div className="grid gap-3 max-h-40 overflow-y-auto">
          {workbook.sheets.map((sheet: any) => (
            <label
              key={sheet.name}
              className="flex items-center space-x-3 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-xl hover:bg-gradient-to-r hover:from-seafoam-50 hover:to-ocean-50 dark:hover:from-seafoam-900/20 dark:hover:to-ocean-900/20 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <input
                type="checkbox"
                checked={options.selectedSheets.includes(sheet.name)}
                onChange={() => handleSheetToggle(sheet.name)}
                className="w-5 h-5 text-seafoam-600 rounded-lg focus:ring-2 focus:ring-seafoam-500/50 focus:ring-offset-2"
              />
              <div className="flex-1">
                <div className="font-black text-black dark:text-white">{sheet.name}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('tools.excelToPdf.rowsColumns', {
                    rows: sheet.metadata?.totalRows || 0,
                    columns: sheet.metadata?.totalColumns || 0
                  })}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
            ⚙️
          </div>
          <h3 className="text-lg font-black text-black dark:text-white">Настройки конвертации</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3">{t('tools.excelToPdf.pageOrientation')}</label>
            <select
              value={options.orientation}
              onChange={(e) => onOptionsChange({ ...options, orientation: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
            >
              <option value="portrait">{t('tools.excelToPdf.portrait')}</option>
              <option value="landscape">{t('tools.excelToPdf.landscape')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3">{t('tools.excelToPdf.pageSize')}</label>
            <select
              value={options.pageSize}
              onChange={(e) => onOptionsChange({ ...options, pageSize: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3">{t('tools.excelToPdf.fontSize')}</label>
            <input
              type="number"
              min="6"
              max="20"
              value={options.fontSize}
              onChange={(e) => onOptionsChange({ ...options, fontSize: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3">{t('tools.excelToPdf.outputFormat')}</label>
            <select
              value={options.outputFormat}
              onChange={(e) => onOptionsChange({ ...options, outputFormat: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
            >
              <option value="single-pdf">{t('tools.excelToPdf.singlePdf')}</option>
              <option value="separate-pdfs">{t('tools.excelToPdf.separatePdfs')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeSheetNames}
            onChange={(e) => onOptionsChange({ ...options, includeSheetNames: e.target.checked })}
            className="w-5 h-5 text-seafoam-600 rounded-lg focus:ring-2 focus:ring-seafoam-500/50 focus:ring-offset-2"
          />
          <span className="text-sm font-black text-black dark:text-white">{t('tools.excelToPdf.includeSheetNames')}</span>
        </label>
      </div>

      <button
        onClick={onConvert}
        disabled={isProcessing || options.selectedSheets.length === 0}
        className="w-full btn-privacy-modern bg-gradient-to-br from-seafoam-500 to-ocean-500 hover:from-seafoam-600 hover:to-ocean-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 disabled:opacity-50"
      >
        {isProcessing ? t('tools.excelToPdf.converting') : t('tools.excelToPdf.convertToPdf')}
      </button>
    </div>
  );
};

export const ExcelToPDFTool: React.FC = () => {
  const { t } = useI18n();
  const {
    workbook,
    isProcessing,
    progress,
    error,
    result,
    showPreview,
    tableAnalysis,
    parseFile,
    convertToPDF,
    downloadPDF,
    downloadAllPDFs,
    reset,
    togglePreview,
    analyzeTable
  } = useExcelToPDF();

  const [options, setOptions] = React.useState<ConversionOptions>({
    ...DEFAULT_OPTIONS,
    selectedSheets: []
  });

  React.useEffect(() => {
    if (workbook) {
      setOptions(prev => ({
        ...prev,
        selectedSheets: workbook.sheets.map(sheet => sheet.name)
      }));
    }
  }, [workbook]);

  // Analyze table when options change
  React.useEffect(() => {
    if (workbook && options.selectedSheets.length > 0) {
      analyzeTable(options);
    }
  }, [workbook, options, analyzeTable]);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      await parseFile(files[0]);
    }
  };

  const handleConvert = async () => {
    console.log('🔥 handleConvert called with options:', options);
    console.log('📋 Current state:', {
      hasWorkbook: !!workbook,
      selectedSheets: options.selectedSheets,
      isProcessing
    });
    await convertToPDF(options);
  };

  const handleOrientationToggle = () => {
    const newOrientation = options.orientation === 'portrait' ? 'landscape' : 'portrait';
    setOptions(prev => ({ ...prev, orientation: newOrientation }));
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/60 dark:border-red-600/20 rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
              ⚠️
            </div>
            <div className="text-red-800 dark:text-red-200 font-black">
              <strong>Error:</strong> {error}
            </div>
          </div>
          <button 
            onClick={reset} 
            className="btn-privacy-modern bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {!workbook ? (
        <div className="max-w-2xl mx-auto">
          <ModernUploadZone
            onFilesSelected={handleFileSelect}
            accept=".xlsx,.xls"
            acceptedTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
            maxSize={100 * 1024 * 1024}
            multiple={false}
            disabled={false}
            title="Загрузить Excel файл"
            subtitle="Конвертируйте Excel таблицы в PDF с полным сохранением форматирования и данных"
            supportedFormats="XLSX, XLS файлы до 100МБ"
            icon="📊"
          />
          
          <div className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-black text-black dark:text-white mb-4">✨ Особенности конвертации:</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.excelToPdf.multipleSheets')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.excelToPdf.complexFormulas')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.excelToPdf.internationalText')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-seafoam-500 rounded-full"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.excelToPdf.localProcessing')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          {result?.success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/60 dark:border-green-600/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                  ✅
                </div>
                <div>
                  <h3 className="text-green-800 dark:text-green-200 font-black text-lg">{t('tools.excelToPdf.conversionCompleted')}</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    {result.pdfFiles?.length === 1
                      ? t('tools.excelToPdf.pdfReady')
                      : t('tools.excelToPdf.multipleFiles', { count: result.pdfFiles?.length })
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-6">
              <div className="mb-4 flex justify-between items-center">
                <span className="text-sm font-black text-black dark:text-white">
                  {progress.message}
                </span>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-700/80 px-3 py-1 rounded-full">
                  {Math.round(progress.progress)}%
                </span>
              </div>
              <div className="relative">
                <ProgressBar
                  progress={progress.progress}
                  className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full overflow-hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-seafoam-500 to-ocean-500 rounded-full transition-all duration-300" style={{width: `${progress.progress}%`}}></div>
              </div>
            </div>
          )}

          {/* Preview and Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Preview */}
            <div className="space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl overflow-hidden h-[600px]"> {/* Fixed height */}
                {(() => {
                  // Debug logging
                  console.log('🔍 ExcelToPDFTool Preview Data:', {
                    result: result ? { success: result.success, hasFiles: !!result.pdfFiles, filesCount: result.pdfFiles?.length } : null,
                    showPreview,
                    isProcessing,
                    workbook: !!workbook,
                    tableAnalysis
                  });

                  return (
                    <ExcelPreview
                      result={result}
                      fileName={workbook?.metadata.fileName || 'excel-document.pdf'}
                      onDownload={() => result?.pdfFiles?.[0] && downloadPDF(result.pdfFiles[0])}
                      onDownloadAll={result?.pdfFiles && result.pdfFiles.length > 1 ? downloadAllPDFs : undefined}
                      isGenerating={isProcessing}
                      onRegenerate={workbook ? handleConvert : undefined}
                      onOrientationToggle={handleOrientationToggle}
                      tableOverflowWarning={tableAnalysis ? {
                        isOverflowing: tableAnalysis.isOverflowing,
                        recommendedOrientation: tableAnalysis.recommendedOrientation,
                        recommendedPageSize: tableAnalysis.recommendedPageSize,
                        columnCount: tableAnalysis.columnCount,
                        scaleFactor: tableAnalysis.scaleFactor
                      } : undefined}
                    />
                  );
                })()}
              </div>
            </div>

            {/* Right Panel - Conversion Settings */}
            <div className="space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-6 h-[600px] flex flex-col"> {/* Fixed height with flex */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    ⚙️
                  </div>
                  <h2 className="text-xl font-black text-black dark:text-white">{t('tools.excelToPdf.conversionSettings')}</h2>
                </div>

                <div className="flex-1 overflow-y-auto"> {/* Scrollable content area */}
                  <ConversionSettings
                    workbook={workbook}
                    options={options}
                    onOptionsChange={setOptions}
                    onConvert={handleConvert}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Information - Full Width Below */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                📊
              </div>
              <h2 className="text-xl font-black text-black dark:text-white">{t('tools.excelToPdf.fileInformation')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('tools.excelToPdf.file')}</div>
                <div className="font-black text-black dark:text-white truncate" title={workbook.metadata.fileName}>{workbook.metadata.fileName}</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('tools.excelToPdf.size')}</div>
                <div className="font-black text-black dark:text-white">{Math.round(workbook.metadata.fileSize / 1024)} KB</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('tools.excelToPdf.sheets')}</div>
                <div className="font-black text-black dark:text-white">{workbook.metadata.totalSheets}</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('tools.excelToPdf.languages')}</div>
                <div className="font-black text-black dark:text-white">{workbook.metadata.detectedLanguages.join(', ') || 'English'}</div>
              </div>
            </div>

            {workbook.metadata.detectedLanguages.length > 1 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/60 dark:border-blue-600/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                    🌍
                  </div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t('tools.excelToPdf.multiLanguageNote')}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="mt-6 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-red-300/80 dark:border-red-600/20 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-lg"
            >
              {t('tools.excelToPdf.chooseDifferentFile')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelToPDFTool;
