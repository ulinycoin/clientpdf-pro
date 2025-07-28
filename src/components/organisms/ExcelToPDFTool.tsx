import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import FileUploadZone from '../molecules/FileUploadZone';
import ProgressBar from '../atoms/ProgressBar';
import Button from '../atoms/Button';
import TestDataGenerator from '../molecules/TestDataGenerator';
import FontDiagnostics from '../molecules/FontDiagnostics';
import DebugControls from '../molecules/DebugControls';
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
    parseFile,
    convertToPDF,
    downloadPDF,
    downloadAllPDFs,
    reset
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

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      await parseFile(files[0]);
    }
  };

  const handleGeneratedFile = async (file: File) => {
    await parseFile(file);
  };

  const handleConvert = async () => {
    await convertToPDF(options);
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

  if (result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Conversion Completed Successfully!
          </h3>

          <div className="space-y-4">
            {result.pdfFiles && result.pdfFiles.length > 1 ? (
              <div>
                <Button onClick={downloadAllPDFs} className="mr-4">
                  Download All PDFs ({result.pdfFiles.length} files)
                </Button>
                <div className="mt-4 space-y-2">
                  {result.pdfFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        onClick={() => downloadPDF(file)}
                        size="sm"
                        variant="secondary"
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : result.pdfFiles && result.pdfFiles[0] ? (
              <Button onClick={() => downloadPDF(result.pdfFiles![0])}>
                Download PDF
              </Button>
            ) : null}

            <div className="text-sm text-gray-600 mt-4">
              {result.metadata && (
                <div>
                  File size: {Math.round(result.metadata.fileSize / 1024)} KB
                </div>
              )}
            </div>
          </div>

          <Button onClick={reset} variant="secondary" className="mt-6">
            Convert Another File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Excel to PDF Converter
        </h1>
        <p className="text-lg text-gray-600">
          Convert Excel files (.xlsx, .xls) to PDF format with support for multiple sheets and international text
        </p>
      </div>

      {!workbook ? (
        <>
          <TestDataGenerator onFileGenerated={handleGeneratedFile} />

          <FontDiagnostics />

          <DebugControls />

          <div className="bg-white rounded-lg shadow-lg p-6">
            <FileUploadZone
              onFilesSelected={handleFileSelect}
              accept=".xlsx,.xls"
              acceptedTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
              maxSize={100 * 1024 * 1024}
              multiple={false}
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>

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
        </div>
      )}

      {progress && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
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
  );
};

export default ExcelToPDFTool;
