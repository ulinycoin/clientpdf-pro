import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import FileUploadZone from '../molecules/FileUploadZone';
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
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('tools.excelToPdf.selectSheets')}</h3>
        <div className="flex gap-2 mb-4">
          <Button
            onClick={selectAllSheets}
            variant="secondary"
            size="sm"
          >
            {t('tools.excelToPdf.selectAll')}
          </Button>
          <Button
            onClick={deselectAllSheets}
            variant="secondary"
            size="sm"
          >
            {t('tools.excelToPdf.deselectAll')}
          </Button>
        </div>

        <div className="grid gap-2 max-h-40 overflow-y-auto">
          {workbook.sheets.map((sheet: any) => (
            <label
              key={sheet.name}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={options.selectedSheets.includes(sheet.name)}
                onChange={() => handleSheetToggle(sheet.name)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{sheet.name}</div>
                <div className="text-sm text-gray-500">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('tools.excelToPdf.pageOrientation')}</label>
          <select
            value={options.orientation}
            onChange={(e) => onOptionsChange({ ...options, orientation: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="portrait">{t('tools.excelToPdf.portrait')}</option>
            <option value="landscape">{t('tools.excelToPdf.landscape')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('tools.excelToPdf.pageSize')}</label>
          <select
            value={options.pageSize}
            onChange={(e) => onOptionsChange({ ...options, pageSize: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('tools.excelToPdf.fontSize')}</label>
          <input
            type="number"
            min="6"
            max="20"
            value={options.fontSize}
            onChange={(e) => onOptionsChange({ ...options, fontSize: parseInt(e.target.value) })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('tools.excelToPdf.outputFormat')}</label>
          <select
            value={options.outputFormat}
            onChange={(e) => onOptionsChange({ ...options, outputFormat: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="single-pdf">{t('tools.excelToPdf.singlePdf')}</option>
            <option value="separate-pdfs">{t('tools.excelToPdf.separatePdfs')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={options.includeSheetNames}
            onChange={(e) => onOptionsChange({ ...options, includeSheetNames: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm font-medium">{t('tools.excelToPdf.includeSheetNames')}</span>
        </label>
      </div>

      <Button
        onClick={onConvert}
        disabled={isProcessing || options.selectedSheets.length === 0}
        className="w-full"
      >
        {isProcessing ? t('tools.excelToPdf.converting') : t('tools.excelToPdf.convertToPdf')}
      </Button>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
          <Button onClick={reset} className="mt-4" variant="secondary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {!workbook ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <FileUploadZone
              onFilesSelected={handleFileSelect}
              accept=".xlsx,.xls"
              acceptedTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
              maxSize={100 * 1024 * 1024}
              multiple={false}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t('tools.excelToPdf.chooseExcelFile')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('tools.excelToPdf.dragDropSubtitle')}
                </p>

                <div className="mt-6 text-sm text-gray-400">
                  <p>{t('tools.excelToPdf.supportedFormats')}</p>
                </div>

                <div className="mt-4 text-xs text-gray-400 space-y-1">
                  <p>✓ {t('tools.excelToPdf.multipleSheets')}</p>
                  <p>✓ {t('tools.excelToPdf.complexFormulas')}</p>
                  <p>✓ {t('tools.excelToPdf.internationalText')}</p>
                  <p>✓ {t('tools.excelToPdf.localProcessing')}</p>
                </div>
              </div>
            </FileUploadZone>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          {result?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-green-600 mr-2">✅</div>
                <div>
                  <h3 className="text-green-800 font-medium">{t('tools.excelToPdf.conversionCompleted')}</h3>
                  <p className="text-green-700 text-sm">
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-2 flex justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {progress.message}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress.progress)}%
                </span>
              </div>
              <ProgressBar
                progress={progress.progress}
                className="h-2 bg-gray-200 rounded-full"
              />
            </div>
          )}

          {/* Preview and Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px]"> {/* Fixed height */}
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
              <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col"> {/* Fixed height with flex */}
                <h2 className="text-xl font-semibold mb-4">{t('tools.excelToPdf.conversionSettings')}</h2>

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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('tools.excelToPdf.fileInformation')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div><strong>{t('tools.excelToPdf.file')}:</strong> {workbook.metadata.fileName}</div>
              <div><strong>{t('tools.excelToPdf.size')}:</strong> {Math.round(workbook.metadata.fileSize / 1024)} KB</div>
              <div><strong>{t('tools.excelToPdf.sheets')}:</strong> {workbook.metadata.totalSheets}</div>
              <div><strong>{t('tools.excelToPdf.languages')}:</strong> {workbook.metadata.detectedLanguages.join(', ') || 'English'}</div>
            </div>

            {workbook.metadata.detectedLanguages.length > 1 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  {t('tools.excelToPdf.multiLanguageNote')}
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
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
