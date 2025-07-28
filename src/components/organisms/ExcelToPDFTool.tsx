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
        <h3 className="text-lg font-semibold mb-4">Select Sheets</h3>
        <div className="flex gap-2 mb-4">
          <Button
            onClick={selectAllSheets}
            variant="secondary"
            size="sm"
          >
            Select All
          </Button>
          <Button
            onClick={deselectAllSheets}
            variant="secondary"
            size="sm"
          >
            Deselect All
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
                  {sheet.metadata?.totalRows || 0} rows × {sheet.metadata?.totalColumns || 0} columns
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Page Orientation</label>
          <select
            value={options.orientation}
            onChange={(e) => onOptionsChange({ ...options, orientation: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Page Size</label>
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
          <label className="block text-sm font-medium mb-2">Font Size</label>
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
          <label className="block text-sm font-medium mb-2">Output Format</label>
          <select
            value={options.outputFormat}
            onChange={(e) => onOptionsChange({ ...options, outputFormat: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="single-pdf">Single PDF file</option>
            <option value="separate-pdfs">Separate PDF files</option>
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
          <span className="text-sm font-medium">Include Sheet Names</span>
        </label>
      </div>

      <Button
        onClick={onConvert}
        disabled={isProcessing || options.selectedSheets.length === 0}
        className="w-full"
      >
        {isProcessing ? 'Converting...' : 'Convert to PDF'}
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Excel to PDF Converter
        </h1>
        <p className="text-lg text-gray-600">
          Convert Excel files (.xlsx, .xls) to PDF format with support for multiple sheets and international text
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Upload and Settings */}
        <div className="space-y-6">
          {!workbook ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <FileUploadZone
                onFilesSelected={handleFileSelect}
                accept=".xlsx,.xls"
                acceptedTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
                maxSize={100 * 1024 * 1024}
                multiple={false}
              />
            </div>
          ) : (
            <>
              {/* Success Message */}
              {result?.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-2">✅</div>
                    <div>
                      <h3 className="text-green-800 font-medium">Conversion Completed!</h3>
                      <p className="text-green-700 text-sm">
                        {result.pdfFiles?.length === 1
                          ? 'PDF is ready for download'
                          : `${result.pdfFiles?.length} PDF files generated`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* File Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">File Information</h2>
                <div className="space-y-2 text-sm">
                  <div><strong>File:</strong> {workbook.metadata.fileName}</div>
                  <div><strong>Size:</strong> {Math.round(workbook.metadata.fileSize / 1024)} KB</div>
                  <div><strong>Sheets:</strong> {workbook.metadata.totalSheets}</div>
                  <div><strong>Languages:</strong> {workbook.metadata.detectedLanguages.join(', ') || 'English'}</div>
                </div>

                {workbook.metadata.detectedLanguages.length > 1 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      Multiple languages detected. Appropriate fonts will be loaded automatically.
                    </div>
                  </div>
                )}

                <button
                  onClick={reset}
                  className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Choose Different File
                </button>
              </div>

              {/* Conversion Settings */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Conversion Settings</h2>
                <ConversionSettings
                  workbook={workbook}
                  options={options}
                  onOptionsChange={setOptions}
                  onConvert={handleConvert}
                  isProcessing={isProcessing}
                />
              </div>
            </>
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
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[600px]">
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
      </div>
    </div>
  );
};

export default ExcelToPDFTool;
