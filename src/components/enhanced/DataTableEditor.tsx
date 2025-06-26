import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Save, X, Plus, Trash2, GripVertical, Eye, EyeOff,
  ArrowUp, ArrowDown, Copy, RotateCcw, Search, Filter
} from 'lucide-react';

import { CsvParseResult } from '../../services/converters/CsvToPdfConverter';
import { ColumnConfig } from '../../types/enhanced-csv-pdf.types';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

interface DataTableEditorProps {
  csvData: CsvParseResult;
  onDataChange: (data: CsvParseResult) => void;
  maxDisplayRows?: number;
  className?: string;
}

interface EditingCell {
  rowIndex: number;
  columnId: string;
  value: string;
}

interface ColumnOperation {
  type: 'reorder' | 'resize' | 'hide' | 'show';
  columnId: string;
  data?: any;
}

const DataTableEditor: React.FC<DataTableEditorProps> = ({
  csvData,
  onDataChange,
  maxDisplayRows = 50,
  className = ''
}) => {
  // State для редактирования
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnConfigs, setColumnConfigs] = useState<Record<string, ColumnConfig>>({});
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);
  
  const editInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Инициализация конфигурации колонок
  useEffect(() => {
    if (csvData.headers.length > 0 && Object.keys(columnConfigs).length === 0) {
      const initialConfigs: Record<string, ColumnConfig> = {};
      
      csvData.headers.forEach((header, index) => {
        initialConfigs[header] = {
          id: header,
          header: header,
          type: csvData.columnTypes[header] || 'text',
          width: 150,
          alignment: csvData.columnTypes[header] === 'number' ? 'right' : 'left',
          visible: true,
          format: undefined,
          color: undefined,
          fontWeight: index === 0 ? 'bold' : 'normal'
        };
      });
      
      setColumnConfigs(initialConfigs);
    }
  }, [csvData.headers, csvData.columnTypes, columnConfigs]);

  // Фокус на редактируемой ячейке
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Фильтрованные и отсортированные данные
  const processedData = useMemo(() => {
    let filtered = csvData.data;

    // Поиск
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(term)
        )
      );
    }

    // Сортировка
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = String(a[sortColumn] || '');
        const bVal = String(b[sortColumn] || '');
        
        const column = columnConfigs[sortColumn];
        if (column?.type === 'number') {
          const aNum = parseFloat(aVal) || 0;
          const bNum = parseFloat(bVal) || 0;
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    return filtered.slice(0, maxDisplayRows);
  }, [csvData.data, searchTerm, sortColumn, sortDirection, columnConfigs, maxDisplayRows]);

  // Видимые колонки
  const visibleColumns = useMemo(() => {
    return csvData.headers.filter(header => columnConfigs[header]?.visible !== false);
  }, [csvData.headers, columnConfigs]);

  // Обработчики событий
  const handleCellClick = useCallback((rowIndex: number, columnId: string, currentValue: any) => {
    setEditingCell({
      rowIndex,
      columnId,
      value: String(currentValue || '')
    });
  }, []);

  const handleCellSave = useCallback(() => {
    if (!editingCell) return;

    const newData = [...csvData.data];
    const actualRowIndex = csvData.data.findIndex(row => row === processedData[editingCell.rowIndex]);
    
    if (actualRowIndex !== -1) {
      newData[actualRowIndex] = {
        ...newData[actualRowIndex],
        [editingCell.columnId]: editingCell.value
      };

      onDataChange({
        ...csvData,
        data: newData
      });
    }

    setEditingCell(null);
  }, [editingCell, csvData, processedData, onDataChange]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  }, [handleCellSave, handleCellCancel]);

  const handleSort = useCallback((columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    // TODO: Implement drag & drop reordering
    console.log('Reorder column from', fromIndex, 'to', toIndex);
  }, []);

  const handleRowSelect = useCallback((rowIndex: number, selected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(rowIndex);
      } else {
        newSet.delete(rowIndex);
      }
      return newSet;
    });
  }, []);

  const handleDeleteRows = useCallback(() => {
    if (selectedRows.size === 0) return;

    const indicesToDelete = Array.from(selectedRows).map(index => {
      return csvData.data.findIndex(row => row === processedData[index]);
    }).filter(index => index !== -1);

    const newData = csvData.data.filter((_, index) => !indicesToDelete.includes(index));
    
    onDataChange({
      ...csvData,
      data: newData,
      rowCount: newData.length
    });

    setSelectedRows(new Set());
  }, [selectedRows, csvData, processedData, onDataChange]);

  const handleAddRow = useCallback(() => {
    const newRow: Record<string, any> = {};
    csvData.headers.forEach(header => {
      newRow[header] = '';
    });

    const newData = [...csvData.data, newRow];
    
    onDataChange({
      ...csvData,
      data: newData,
      rowCount: newData.length
    });
  }, [csvData, onDataChange]);

  // Стили для ячеек
  const getCellStyle = useCallback((header: string, isEditing: boolean): React.CSSProperties => {
    const config = columnConfigs[header];
    
    return {
      width: config?.width || 150,
      minWidth: config?.width || 150,
      textAlign: config?.alignment || 'left',
      fontWeight: config?.fontWeight || 'normal',
      color: config?.color || 'inherit',
      backgroundColor: isEditing ? '#eff6ff' : 'transparent',
      border: isEditing ? '2px solid #3b82f6' : '1px solid #e5e7eb'
    };
  }, [columnConfigs]);

  const handleColumnVisibilityToggle = useCallback((columnId: string) => {
    setColumnConfigs(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        visible: !prev[columnId]?.visible
      }
    }));
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search in table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddRow}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Row
          </Button>
          
          {selectedRows.size > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteRows}
              className="flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete ({selectedRows.size})
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Showing {processedData.length} of {csvData.rowCount} rows
          </span>
          
          {searchTerm && (
            <Badge variant="secondary">
              Filtered: {processedData.length} results
            </Badge>
          )}
        </div>
      </div>

      {/* Column Visibility Controls */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {csvData.headers.map(header => (
            <button
              key={header}
              onClick={() => handleColumnVisibilityToggle(header)}
              className={`
                flex items-center px-3 py-1 rounded-full text-sm transition-all
                ${columnConfigs[header]?.visible !== false
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {columnConfigs[header]?.visible !== false ? (
                <Eye className="w-3 h-3 mr-1" />
              ) : (
                <EyeOff className="w-3 h-3 mr-1" />
              )}
              {header}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div 
        ref={tableRef}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-12 p-3 text-left border-b border-gray-200">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(processedData.map((_, index) => index)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    checked={selectedRows.size === processedData.length && processedData.length > 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                
                {visibleColumns.map((header) => {
                  const config = columnConfigs[header];
                  const isSorted = sortColumn === header;
                  
                  return (
                    <th
                      key={header}
                      className="p-3 text-left border-b border-gray-200 bg-gray-50 sticky top-0"
                      style={{ width: config?.width || 150, minWidth: config?.width || 150 }}
                    >
                      <div className="flex items-center justify-between group">
                        <button
                          onClick={() => handleSort(header)}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          <span className="truncate">{header}</span>
                          {isSorted && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : (
                                <ArrowDown className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </button>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        </div>
                      </div>
                      
                      {config?.type && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {config.type}
                        </Badge>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              <AnimatePresence>
                {processedData.map((row, rowIndex) => {
                  const isSelected = selectedRows.has(rowIndex);
                  
                  return (
                    <motion.tr
                      key={rowIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`
                        hover:bg-blue-50 transition-colors
                        ${isSelected ? 'bg-blue-100' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      `}
                    >
                      <td className="p-3 border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(rowIndex, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      {visibleColumns.map((header) => {
                        const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnId === header;
                        const cellValue = row[header];
                        
                        return (
                          <td
                            key={`${rowIndex}-${header}`}
                            className="p-3 border-b border-gray-200 relative"
                            style={getCellStyle(header, isEditing)}
                          >
                            {isEditing ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editingCell.value}
                                  onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                                  onKeyDown={handleKeyDown}
                                  className="w-full px-2 py-1 border-none outline-none bg-transparent"
                                />
                                <Button
                                  variant="success"
                                  size="xs"
                                  onClick={handleCellSave}
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  onClick={handleCellCancel}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                onClick={() => handleCellClick(rowIndex, header, cellValue)}
                                className="cursor-pointer group relative"
                              >
                                <span className="block truncate">
                                  {String(cellValue || '')}
                                </span>
                                <Edit3 className="absolute top-1 right-1 w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Total rows: {csvData.rowCount.toLocaleString()}</span>
            <span>Visible columns: {visibleColumns.length}/{csvData.headers.length}</span>
            {selectedRows.size > 0 && (
              <span>Selected: {selectedRows.size} rows</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {editingCell && (
              <Badge variant="warning" className="flex items-center">
                <Edit3 className="w-3 h-3 mr-1" />
                Editing cell
              </Badge>
            )}
            
            {sortColumn && (
              <Badge variant="secondary">
                Sorted by {sortColumn} ({sortDirection})
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTableEditor;
