import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet, Settings, Eye, RefreshCw, Loader, AlertCircle,
  Languages, Zap, Shield, Edit3, Palette, Download, Save,
  Trash2, Plus, Type, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline
} from 'lucide-react';

interface EditState {
  isEditing: boolean;
  selectedCell: { row: number; col: number } | null;
  editValue: string;
  history: any[];
  historyIndex: number;
}

interface StyleState {
  selectedRange: { startRow: number; endRow: number; startCol: number; endCol: number } | null;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    textAlign?: 'left' | 'center' | 'right';
    borderStyle?: 'none' | 'thin' | 'medium' | 'thick';
    borderColor?: string;
  };
  cellStyles: { [key: string]: any };
}

interface Props {
  csvData: string[][];
  headers: string[];
  parseResult: any;
  unicodeDetection: any;
  onDataChange?: (data: string[][]) => void;
  onOptionsChange?: (options: any) => void;
}

const LivePreviewEditor: React.FC<Props> = ({
  csvData: initialCsvData = [],
  headers: initialHeaders = [],
  parseResult,
  unicodeDetection,
  onDataChange,
  onOptionsChange
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'style' | 'settings' | 'preview'>('edit');
  const [csvData, setCsvData] = useState(initialCsvData || []);
  const [headers, setHeaders] = useState(initialHeaders || []);
  
  const [editState, setEditState] = useState<EditState>({
    isEditing: false,
    selectedCell: null,
    editValue: '',
    history: [initialCsvData || []],
    historyIndex: 0
  });

  const [styleState, setStyleState] = useState<StyleState>({
    selectedRange: null,
    styles: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      borderStyle: 'thin',
      borderColor: '#cccccc'
    },
    cellStyles: {}
  });

  const [options, setOptions] = useState({
    orientation: 'landscape' as 'landscape' | 'portrait',
    pageSize: 'a4' as 'a4' | 'a3' | 'letter' | 'legal',
    fontSize: 10,
    fontFamily: 'auto' as 'auto' | 'helvetica' | 'times' | 'courier',
    useRobustGenerator: false,
    enableErrorRecovery: true
  });

  const [previewState, setPreviewState] = useState({
    isGenerating: false,
    pdfUrl: null as string | null,
    error: null as string | null,
    warnings: [] as string[],
    generatorUsed: null as string | null
  });

  const [fontCompatibility] = useState({ tested: false, robust: false });

  // Guard clauses for empty data
  if (!headers || headers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No data to edit</p>
          <p className="text-gray-500 text-sm">Upload a CSV file to start editing</p>
        </div>
      </div>
    );
  }

  // Edit functions
  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    const cellValue = rowIndex === -1 ? headers[colIndex] : csvData[rowIndex]?.[colIndex] || '';
    setEditState(prev => ({
      ...prev,
      selectedCell: { row: rowIndex, col: colIndex },
      editValue: cellValue,
      isEditing: true
    }));
  }, [csvData, headers]);

  const handleCellEdit = useCallback((newValue: string) => {
    if (!editState.selectedCell) return;
    const { row, col } = editState.selectedCell;
    
    if (row === -1) {
      const newHeaders = [...headers];
      newHeaders[col] = newValue;
      setHeaders(newHeaders);
    } else {
      const newData = [...csvData];
      if (!newData[row]) newData[row] = [];
      newData[row][col] = newValue;
      setCsvData(newData);
      setEditState(prev => ({
        ...prev,
        history: [...prev.history.slice(0, prev.historyIndex + 1), newData],
        historyIndex: prev.historyIndex + 1
      }));
      onDataChange?.(newData);
    }

    setEditState(prev => ({ ...prev, isEditing: false, selectedCell: null, editValue: '' }));
  }, [editState.selectedCell, headers, csvData, onDataChange]);

  const undoEdit = useCallback(() => {
    if (editState.historyIndex > 0) {
      const newIndex = editState.historyIndex - 1;
      const previousData = editState.history[newIndex];
      setCsvData(previousData);
      setEditState(prev => ({ ...prev, historyIndex: newIndex }));
      onDataChange?.(previousData);
    }
  }, [editState.historyIndex, editState.history, onDataChange]);

  const redoEdit = useCallback(() => {
    if (editState.historyIndex < editState.history.length - 1) {
      const newIndex = editState.historyIndex + 1;
      const nextData = editState.history[newIndex];
      setCsvData(nextData);
      setEditState(prev => ({ ...prev, historyIndex: newIndex }));
      onDataChange?.(nextData);
    }
  }, [editState.historyIndex, editState.history, onDataChange]);

  const addRow = useCallback(() => {
    const newRow = new Array(headers.length || 1).fill('');
    const newData = [...csvData, newRow];
    setCsvData(newData);
    onDataChange?.(newData);
  }, [csvData, headers]);

  const deleteRow = useCallback((rowIndex: number) => {
    const newData = csvData.filter((_, index) => index !== rowIndex);
    setCsvData(newData);
    onDataChange?.(newData);
  }, [csvData, onDataChange]);

  const addColumn = useCallback(() => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newData = csvData.map(row => [...(row || []), '']);
    setHeaders(newHeaders);
    setCsvData(newData);
    onDataChange?.(newData);
  }, [headers, csvData, onDataChange]);

  const deleteColumn = useCallback((colIndex: number) => {
    const newHeaders = headers.filter((_, index) => index !== colIndex);
    const newData = csvData.map(row => (row || []).filter((_, index) => index !== colIndex));
    setHeaders(newHeaders);
    setCsvData(newData);
    onDataChange?.(newData);
  }, [headers, csvData, onDataChange]);

  // Style functions
  const handleCellStyleChange = useCallback((styleProp: string, value: any) => {
    if (!styleState.selectedRange) return;
    const { startRow, endRow, startCol, endCol } = styleState.selectedRange;
    const newCellStyles = { ...styleState.cellStyles };

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellKey = `${row}-${col}`;
        if (!newCellStyles[cellKey]) newCellStyles[cellKey] = {};
        newCellStyles[cellKey][styleProp] = value;
      }
    }

    setStyleState(prev => ({
      ...prev,
      cellStyles: newCellStyles,
      styles: { ...prev.styles, [styleProp]: value }
    }));
  }, [styleState.selectedRange, styleState.cellStyles]);

  const selectRange = useCallback((startRow: number, endRow: number, startCol: number, endCol: number) => {
    setStyleState(prev => ({ ...prev, selectedRange: { startRow, endRow, startCol, endCol } }));
  }, []);

  const generatePreview = useCallback(async () => {
    setPreviewState(prev => ({ ...prev, isGenerating: true, error: null }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockPdfUrl = 'data:application/pdf;base64,mock-pdf-data';
      setPreviewState(prev => ({
        ...prev,
        isGenerating: false,
        pdfUrl: mockPdfUrl,
        generatorUsed: 'enhanced'
      }));
    } catch (error) {
      setPreviewState(prev => ({
        ...prev,
        isGenerating: false,
        error: 'Failed to generate preview',
        warnings: ['Check your data format', 'Try different settings']
      }));
    }
  }, [csvData, headers, options, styleState.cellStyles]);

  const getCellStyle = useCallback((rowIndex: number, colIndex: number) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    const cellStyle = styleState.cellStyles[cellKey] || {};
    
    return {
      backgroundColor: cellStyle.backgroundColor || '#ffffff',
      color: cellStyle.textColor || '#000000',
      fontSize: `${cellStyle.fontSize || 12}px`,
      fontWeight: cellStyle.fontWeight || 'normal',
      fontStyle: cellStyle.fontStyle || 'normal',
      textDecoration: cellStyle.textDecoration || 'none',
      textAlign: cellStyle.textAlign || 'left',
      border: `1px ${cellStyle.borderStyle || 'solid'} ${cellStyle.borderColor || '#e5e7eb'}`
    };
  }, [styleState.cellStyles]);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { id: 'edit', label: 'Edit Data', icon: Edit3 },
          { id: 'style', label: 'Style', icon: Palette },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'preview', label: 'Preview', icon: Eye }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' && (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Edit3 className="w-5 h-5 mr-2" />
                      Data Editor
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button onClick={undoEdit} disabled={editState.historyIndex <= 0} 
                        className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50">
                        ↶ Undo
                      </button>
                      <button onClick={redoEdit} disabled={editState.historyIndex >= editState.history.length - 1}
                        className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50">
                        ↷ Redo
                      </button>
                      <button onClick={addRow} className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-1" />Add Row
                      </button>
                      <button onClick={addColumn} className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-1" />Add Column
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 h-[calc(100%-5rem)] overflow-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="w-12 bg-gray-100 border border-gray-300 p-2 text-xs">#</th>
                        {headers.map((header, index) => (
                          <th key={index} className="bg-gray-100 border border-gray-300 p-2 text-left relative group">
                            <div className="cursor-pointer" onClick={() => handleCellClick(-1, index)}>
                              {editState.isEditing && editState.selectedCell?.row === -1 && editState.selectedCell?.col === index ? (
                                <input type="text" value={editState.editValue}
                                  onChange={(e) => setEditState(prev => ({ ...prev, editValue: e.target.value }))}
                                  onBlur={() => handleCellEdit(editState.editValue)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCellEdit(editState.editValue);
                                    if (e.key === 'Escape') setEditState(prev => ({ ...prev, isEditing: false }));
                                  }}
                                  className="w-full bg-white border rounded px-1" autoFocus />
                              ) : (
                                <span className="text-sm font-medium">{header}</span>
                              )}
                            </div>
                            <button onClick={() => deleteColumn(index)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="group">
                          <td className="bg-gray-100 border border-gray-300 p-2 text-xs text-center relative">
                            {rowIndex + 1}
                            <button onClick={() => deleteRow(rowIndex)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                          {headers.map((_, colIndex) => (
                            <td key={colIndex} className="border border-gray-300 p-2 cursor-pointer hover:bg-gray-50"
                              style={getCellStyle(rowIndex, colIndex)} onClick={() => handleCellClick(rowIndex, colIndex)}>
                              {editState.isEditing && editState.selectedCell?.row === rowIndex && editState.selectedCell?.col === colIndex ? (
                                <input type="text" value={editState.editValue}
                                  onChange={(e) => setEditState(prev => ({ ...prev, editValue: e.target.value }))}
                                  onBlur={() => handleCellEdit(editState.editValue)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCellEdit(editState.editValue);
                                    if (e.key === 'Escape') setEditState(prev => ({ ...prev, isEditing: false }));
                                  }}
                                  className="w-full bg-white border rounded px-1" autoFocus />
                              ) : (
                                <span className="text-sm">{(row || [])[colIndex] || ''}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'style' && (
            <motion.div key="style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Palette className="w-5 h-5 mr-2" />Style Editor
                  </h3>
                </div>
                <div className="flex h-[calc(100%-5rem)]">
                  <div className="w-80 border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Colors</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                            <input type="color" value={styleState.styles.backgroundColor}
                              onChange={(e) => handleCellStyleChange('backgroundColor', e.target.value)}
                              className="w-full h-8 border border-gray-300 rounded cursor-pointer" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text</label>
                            <input type="color" value={styleState.styles.textColor}
                              onChange={(e) => handleCellStyleChange('textColor', e.target.value)}
                              className="w-full h-8 border border-gray-300 rounded cursor-pointer" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Typography</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                            <input type="range" min="8" max="24" value={styleState.styles.fontSize}
                              onChange={(e) => handleCellStyleChange('fontSize', parseInt(e.target.value))}
                              className="w-full" />
                            <span className="text-xs text-gray-500">{styleState.styles.fontSize}px</span>
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleCellStyleChange('fontWeight', styleState.styles.fontWeight === 'bold' ? 'normal' : 'bold')}
                              className={`flex items-center px-3 py-1 text-sm rounded border ${styleState.styles.fontWeight === 'bold' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                              <Bold className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleCellStyleChange('fontStyle', styleState.styles.fontStyle === 'italic' ? 'normal' : 'italic')}
                              className={`flex items-center px-3 py-1 text-sm rounded border ${styleState.styles.fontStyle === 'italic' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                              <Italic className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleCellStyleChange('textDecoration', styleState.styles.textDecoration === 'underline' ? 'none' : 'underline')}
                              className={`flex items-center px-3 py-1 text-sm rounded border ${styleState.styles.textDecoration === 'underline' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                              <Underline className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Text Alignment</h4>
                        <div className="flex space-x-2">
                          {[{ value: 'left', icon: AlignLeft }, { value: 'center', icon: AlignCenter }, { value: 'right', icon: AlignRight }].map(({ value, icon: Icon }) => (
                            <button key={value} onClick={() => handleCellStyleChange('textAlign', value)}
                              className={`flex items-center px-3 py-1 text-sm rounded border ${styleState.styles.textAlign === value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Quick Styles</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => { handleCellStyleChange('backgroundColor', '#f3f4f6'); handleCellStyleChange('fontWeight', 'bold'); }}
                            className="px-3 py-2 text-xs bg-gray-100 text-gray-800 rounded border hover:bg-gray-200">
                            Header Style
                          </button>
                          <button onClick={() => { handleCellStyleChange('backgroundColor', '#fef3c7'); handleCellStyleChange('textColor', '#92400e'); }}
                            className="px-3 py-2 text-xs bg-yellow-100 text-yellow-800 rounded border hover:bg-yellow-200">
                            Highlight
                          </button>
                          <button onClick={() => { handleCellStyleChange('backgroundColor', '#dcfce7'); handleCellStyleChange('textColor', '#166534'); }}
                            className="px-3 py-2 text-xs bg-green-100 text-green-800 rounded border hover:bg-green-200">
                            Success
                          </button>
                          <button onClick={() => { handleCellStyleChange('backgroundColor', '#fecaca'); handleCellStyleChange('textColor', '#991b1b'); }}
                            className="px-3 py-2 text-xs bg-red-100 text-red-800 rounded border hover:bg-red-200">
                            Alert
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    <div className="border border-gray-300 rounded">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            {headers.map((header, index) => (
                              <th key={index} className="border border-gray-300 p-2 text-left cursor-pointer hover:bg-gray-100"
                                style={getCellStyle(-1, index)} onClick={() => selectRange(-1, -1, index, index)}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 10).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {headers.map((_, colIndex) => (
                                <td key={colIndex} className="border border-gray-300 p-2 cursor-pointer hover:bg-gray-100"
                                  style={getCellStyle(rowIndex, colIndex)} onClick={() => selectRange(rowIndex, rowIndex, colIndex, colIndex)}>
                                  {(row || [])[colIndex] || ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvData.length > 10 && (
                        <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                          ... and {csvData.length - 10} more rows
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />PDF Export Settings
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Orientation</label>
                      <select value={options.orientation} onChange={(e) => { const newOptions = { ...options, orientation: e.target.value as any }; setOptions(newOptions); onOptionsChange?.(newOptions); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="landscape">Landscape (Recommended)</option>
                        <option value="portrait">Portrait</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
                      <select value={options.pageSize} onChange={(e) => { const newOptions = { ...options, pageSize: e.target.value as any }; setOptions(newOptions); onOptionsChange?.(newOptions); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="a4">A4</option>
                        <option value="a3">A3</option>
                        <option value="letter">Letter</option>
                        <option value="legal">Legal (Best for tables)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 flex space-x-4">
                    <button onClick={generatePreview} disabled={previewState.isGenerating}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                      {previewState.isGenerating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                      Generate Preview
                    </button>
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Eye className="w-5 h-5 mr-2" />PDF Preview
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button onClick={generatePreview} disabled={previewState.isGenerating}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        {previewState.isGenerating ? <Loader className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                        Refresh
                      </button>
                      {previewState.pdfUrl && (
						<button onClick={() => {
						                         const link = document.createElement('a');
						                         link.href = previewState.pdfUrl!;
						                         link.download = 'styled-report.pdf';
						                         link.click();
						                       }} className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
						                         <Download className="w-4 h-4 mr-1" />Download
						                       </button>
						                     )}
						                   </div>
						                 </div>
						               </div>
						               <div className="p-4 h-[calc(100%-5rem)]">
						                 {previewState.error ? (
						                   <div className="flex items-center justify-center h-full bg-red-50 border border-red-200 rounded-lg">
						                     <div className="text-center max-w-md">
						                       <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
						                       <p className="text-red-800 font-medium mb-2">{previewState.error}</p>
                       
						                       {previewState.warnings.length > 0 && (
						                         <div className="mb-4">
						                           <p className="text-sm text-red-700 mb-2 font-medium">Suggestions:</p>
						                           <ul className="text-sm text-red-600 space-y-1">
						                             {previewState.warnings.map((warning, index) => (
						                               <li key={index} className="flex items-start justify-center">
						                                 <span className="text-red-400 mr-2">•</span>
						                                 {warning}
						                               </li>
						                             ))}
						                           </ul>
						                         </div>
						                       )}
                       
						                       <button onClick={generatePreview}
						                         className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
						                         Try Again
						                       </button>
						                     </div>
						                   </div>
						                 ) : previewState.isGenerating ? (
						                   <div className="flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg">
						                     <div className="text-center">
						                       <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
						                       <p className="text-gray-700 font-medium mb-2">Generating Preview...</p>
						                       <p className="text-gray-600 text-sm">
						                         Processing with enhanced styling and {previewState.generatorUsed || 'auto'} generator
						                       </p>
						                     </div>
						                   </div>
						                 ) : previewState.pdfUrl ? (
						                   <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 h-full">
						                     <iframe src={previewState.pdfUrl} className="w-full h-full" title="PDF Preview"
						                       onError={() => {
						                         setPreviewState(prev => ({
						                           ...prev,
						                           error: 'PDF preview failed to load',
						                           warnings: ['Try refreshing the preview', 'Check browser PDF support']
						                         }));
						                       }} />
						                   </div>
						                 ) : (
						                   <div className="flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg">
						                     <div className="text-center">
						                       <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-4" />
						                       <p className="text-gray-600 mb-4">No preview available</p>
						                       <button onClick={generatePreview}
						                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
						                         Generate Preview
						                       </button>
						                     </div>
						                   </div>
						                 )}
						               </div>
						             </div>
						           </motion.div>
						         )}
						       </AnimatePresence>
						     </div>

						     {/* Status Bar */}
						     <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
						       <div className="flex items-center justify-between text-xs text-gray-600">
						         <div className="flex items-center space-x-4">
						           <span>
						             {parseResult?.reportTitle || 'Enhanced CSV to PDF Editor'}
						           </span>
						           {unicodeDetection && (
						             <span className="flex items-center">
						               <Languages className="w-3 h-3 mr-1" />
						               {unicodeDetection.hasCyrillic ? 'Cyrillic Detected' : 
						                unicodeDetection.hasExtendedLatin ? 'Extended Latin' : 
						                'Standard Text'}
						             </span>
						           )}
						           {previewState.generatorUsed && (
						             <span className="flex items-center">
						               <Zap className="w-3 h-3 mr-1" />
						               {previewState.generatorUsed} generator
						             </span>
						           )}
						           <span className="flex items-center">
						             <Edit3 className="w-3 h-3 mr-1" />
						             {csvData.length} rows × {headers.length} columns
						           </span>
						         </div>
						         <div className="flex items-center space-x-4">
						           {previewState.isGenerating && (
						             <span className="flex items-center text-blue-600">
						               <Loader className="w-3 h-3 mr-1 animate-spin" />
						               Generating...
						             </span>
						           )}
						           <span>
						             Font: {options.fontFamily === 'auto' ? 'Auto-selected' : options.fontFamily}
						           </span>
						           <span>
						             {options.orientation} • {options.pageSize.toUpperCase()}
						           </span>
						           {fontCompatibility.tested && (
						             <span className={`flex items-center ${
						               fontCompatibility.robust ? 'text-green-600' : 'text-yellow-600'
						             }`}>
						               <Shield className="w-3 h-3 mr-1" />
						               {fontCompatibility.robust ? 'Robust' : 'Fallback'}
						             </span>
						           )}
						         </div>
						       </div>
						     </div>
						   </div>
						 );
						};

						export default LivePreviewEditor;