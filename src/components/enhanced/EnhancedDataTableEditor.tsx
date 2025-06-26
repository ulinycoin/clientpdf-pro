/**
 * EnhancedDataTableEditor.tsx
 * Продвинутый редактор таблицы данных с поддержкой inline editing и drag & drop
 * Интегрируется с FontLanguageSelector для правильного отображения Unicode текста
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Move,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  MoreHorizontal,
  Check,
  AlertCircle,
  Type
} from 'lucide-react';

import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { EnhancedUnicodeFontService } from '../../services/EnhancedUnicodeFontService';

export interface TableCell {
  value: any;
  originalValue: any;
  isEditing: boolean;
  isModified: boolean;
  validationError?: string;
}

export interface TableColumn {
  key: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  visible: boolean;
  width?: number;
  sortable: boolean;
  editable: boolean;
}

export interface TableRow {
  id: string;
  cells: Record<string, TableCell>;
  isNew: boolean;
  isDeleted: boolean;
}

interface EnhancedDataTableEditorProps {
  headers: string[];
  data: Record<string, any>[];
  columnTypes: Record<string, string>;
  selectedLanguage?: string;
  selectedFont?: string;
  onDataChange: (data: Record<string, any>[]) => void;
  onHeaderChange: (headers: string[]) => void;
  className?: string;
}

interface FilterState {
  column: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
  value: string;
}

interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export const EnhancedDataTableEditor: React.FC<EnhancedDataTableEditorProps> = ({
  headers,
  data,
  columnTypes,
  selectedLanguage = 'auto',
  selectedFont = 'helvetica',
  onDataChange,
  onHeaderChange,
  className = ''
}) => {
  // State management
  const [tableRows, setTableRows] = useState<TableRow[]>(() => 
    data.map((row, index) => ({
      id: `row-${index}`,
      cells: headers.reduce((acc, header) => ({
        ...acc,
        [header]: {
          value: row[header],
          originalValue: row[header],
          isEditing: false,
          isModified: false
        }
      }), {}),
      isNew: false,
      isDeleted: false
    }))
  );

  const [columns, setColumns] = useState<TableColumn[]>(() =>
    headers.map(header => ({
      key: header,
      name: header,
      type: (columnTypes[header] as any) || 'text',
      visible: true,
      sortable: true,
      editable: true
    }))
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState[]>([]);
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showColumnManager, setShowColumnManager] = useState(false);

  // 🔧 Unicode text cleaning for display
  const cleanTextForDisplay = useCallback((text: string): string => {
    if (!text) return '';
    
    // Use the enhanced font service to clean text properly
    return selectedLanguage === 'ru' || selectedFont === 'DejaVu' 
      ? EnhancedUnicodeFontService.smartCleanText(text, true) // Preserve Cyrillic
      : EnhancedUnicodeFontService.smartCleanText(text, false); // Clean for standard fonts
  }, [selectedLanguage, selectedFont]);

  // 🔧 Cell editing handlers
  const startCellEdit = useCallback((rowId: string, columnKey: string) => {
    setTableRows(prev => prev.map(row => 
      row.id === rowId ? {
        ...row,
        cells: {
          ...row.cells,
          [columnKey]: {
            ...row.cells[columnKey],
            isEditing: true
          }
        }
      } : row
    ));
  }, []);

  const saveCellEdit = useCallback((rowId: string, columnKey: string, newValue: any) => {
    setTableRows(prev => prev.map(row => 
      row.id === rowId ? {
        ...row,
        cells: {
          ...row.cells,
          [columnKey]: {
            ...row.cells[columnKey],
            value: newValue,
            isEditing: false,
            isModified: newValue !== row.cells[columnKey].originalValue,
            validationError: validateCellValue(newValue, columns.find(c => c.key === columnKey)?.type || 'text')
          }
        }
      } : row
    ));

    // Update parent component
    updateParentData();
  }, [columns]);

  const cancelCellEdit = useCallback((rowId: string, columnKey: string) => {
    setTableRows(prev => prev.map(row => 
      row.id === rowId ? {
        ...row,
        cells: {
          ...row.cells,
          [columnKey]: {
            ...row.cells[columnKey],
            value: row.cells[columnKey].originalValue,
            isEditing: false
          }
        }
      } : row
    ));
  }, []);

  // 🔧 Validation
  const validateCellValue = (value: any, type: string): string | undefined => {
    if (!value || value.toString().trim() === '') return undefined;

    const strValue = value.toString();

    switch (type) {
      case 'number':
        if (isNaN(Number(strValue.replace(/[,\s]/g, '')))) {
          return 'Must be a valid number';
        }
        break;
      case 'date':
        if (isNaN(Date.parse(strValue))) {
          return 'Must be a valid date';
        }
        break;
      case 'boolean':
        const validBooleans = ['true', 'false', 'yes', 'no', '1', '0', 'on', 'off'];
        if (!validBooleans.includes(strValue.toLowerCase())) {
          return 'Must be true/false, yes/no, 1/0, or on/off';
        }
        break;
    }

    return undefined;
  };

  // 🔧 Data synchronization with parent
  const updateParentData = useCallback(() => {
    const newData = tableRows
      .filter(row => !row.isDeleted)
      .map(row => {
        const rowData: Record<string, any> = {};
        Object.entries(row.cells).forEach(([key, cell]) => {
          rowData[key] = cell.value;
        });
        return rowData;
      });
    
    onDataChange(newData);
  }, [tableRows, onDataChange]);

  // 🔧 Row operations
  const addNewRow = useCallback(() => {
    const newRow: TableRow = {
      id: `new-row-${Date.now()}`,
      cells: columns.reduce((acc, column) => ({
        ...acc,
        [column.key]: {
          value: '',
          originalValue: '',
          isEditing: false,
          isModified: false
        }
      }), {}),
      isNew: true,
      isDeleted: false
    };

    setTableRows(prev => [...prev, newRow]);
  }, [columns]);

  const deleteRows = useCallback((rowIds: string[]) => {
    setTableRows(prev => prev.map(row => 
      rowIds.includes(row.id) ? { ...row, isDeleted: true } : row
    ));
    setSelectedRows(new Set());
    updateParentData();
  }, [updateParentData]);

  // 🔧 Column operations
  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const updateColumnName = useCallback((oldKey: string, newName: string) => {
    const cleanedName = EnhancedUnicodeFontService.smartCleanText(newName);
    
    setColumns(prev => prev.map(col => 
      col.key === oldKey ? { ...col, name: cleanedName } : col
    ));

    // Update headers in parent
    const newHeaders = headers.map(h => h === oldKey ? cleanedName : h);
    onHeaderChange(newHeaders);
  }, [headers, onHeaderChange]);

  // 🔧 Filtering and sorting
  const filteredAndSortedRows = useMemo(() => {
    let processedRows = tableRows.filter(row => !row.isDeleted);

    // Apply search
    if (searchTerm) {
      processedRows = processedRows.filter(row =>
        Object.values(row.cells).some(cell =>
          cell.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      processedRows = processedRows.filter(row => {
        const cellValue = row.cells[filter.column]?.value?.toString().toLowerCase() || '';
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case 'contains': return cellValue.includes(filterValue);
          case 'equals': return cellValue === filterValue;
          case 'startsWith': return cellValue.startsWith(filterValue);
          case 'endsWith': return cellValue.endsWith(filterValue);
          case 'gt': return parseFloat(cellValue) > parseFloat(filterValue);
          case 'lt': return parseFloat(cellValue) < parseFloat(filterValue);
          default: return true;
        }
      });
    });

    // Apply sorting
    if (sortState) {
      processedRows.sort((a, b) => {
        const aValue = a.cells[sortState.column]?.value || '';
        const bValue = b.cells[sortState.column]?.value || '';
        
        const comparison = aValue.toString().localeCompare(bValue.toString(), undefined, { numeric: true });
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }

    return processedRows;
  }, [tableRows, searchTerm, filters, sortState]);

  // 🎨 Cell renderer with Unicode support
  const renderCell = (row: TableRow, column: TableColumn) => {
    const cell = row.cells[column.key];
    if (!cell) return null;

    const cellValue = cleanTextForDisplay(cell.value?.toString() || '');
    const hasError = !!cell.validationError;
    const isModified = cell.isModified;

    if (cell.isEditing) {
      return (
        <div className="flex items-center space-x-1">
          <input
            type={column.type === 'number' ? 'number' : 'text'}
            defaultValue={cell.value}
            className={`flex-1 px-2 py-1 text-xs border rounded ${
              hasError ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
            }`}
            autoFocus
            onBlur={(e) => saveCellEdit(row.id, column.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveCellEdit(row.id, column.key, (e.target as HTMLInputElement).value);
              } else if (e.key === 'Escape') {
                cancelCellEdit(row.id, column.key);
              }
            }}
          />
          <button
            onClick={() => saveCellEdit(row.id, column.key, cell.value)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={() => cancelCellEdit(row.id, column.key)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div
        className={`group relative p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
          isModified ? 'bg-blue-50 border-l-2 border-blue-400' : ''
        } ${hasError ? 'bg-red-50 border-l-2 border-red-400' : ''}`}
        onClick={() => column.editable && startCellEdit(row.id, column.key)}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm ${hasError ? 'text-red-700' : 'text-gray-900'}`}>
            {cellValue || <span className="text-gray-400 italic">empty</span>}
          </span>
          {column.editable && (
            <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        
        {hasError && (
          <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {cell.validationError}
          </div>
        )}
        
        {isModified && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full transform translate-x-1 -translate-y-1" />
        )}
      </div>
    );
  };

  const visibleColumns = columns.filter(col => col.visible);
  const modifiedRowsCount = tableRows.filter(row => 
    Object.values(row.cells).some(cell => cell.isModified)
  ).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900">Data Table Editor</h3>
            <Badge variant={modifiedRowsCount > 0 ? 'warning' : 'default'}>
              {modifiedRowsCount} modified
            </Badge>
            <Badge variant="info">
              <Type className="w-3 h-3 mr-1" />
              {selectedFont} • {selectedLanguage}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowColumnManager(!showColumnManager)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Columns
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={addNewRow}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
            {selectedRows.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteRows(Array.from(selectedRows))}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedRows.size})
              </Button>
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {/* Add filter logic */}}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Column visibility manager */}
        {showColumnManager && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <h4 className="font-medium text-gray-900 mb-2">Column Visibility</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {columns.map(column => (
                <label key={column.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => toggleColumnVisibility(column.key)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    {cleanTextForDisplay(column.name)}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredAndSortedRows.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(filteredAndSortedRows.map(row => row.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                {visibleColumns.map(column => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (column.sortable) {
                        setSortState(prev => ({
                          column: column.key,
                          direction: prev?.column === column.key && prev.direction === 'asc' ? 'desc' : 'asc'
                        }));
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{cleanTextForDisplay(column.name)}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <SortAsc className={`w-3 h-3 ${
                            sortState?.column === column.key && sortState.direction === 'asc'
                              ? 'text-blue-600' : 'text-gray-300'
                          }`} />
                          <SortDesc className={`w-3 h-3 -mt-1 ${
                            sortState?.column === column.key && sortState.direction === 'desc'
                              ? 'text-blue-600' : 'text-gray-300'
                          }`} />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedRows.map(row => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${
                    row.isNew ? 'bg-green-50' : ''
                  } ${selectedRows.has(row.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedRows);
                        if (e.target.checked) {
                          newSelected.add(row.id);
                        } else {
                          newSelected.delete(row.id);
                        }
                        setSelectedRows(newSelected);
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  {visibleColumns.map(column => (
                    <td key={column.key} className="border-b border-gray-100">
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedRows.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No data to display</p>
            {searchTerm && (
              <p className="text-sm">Try adjusting your search term</p>
            )}
          </div>
        )}
      </Card>

      {/* Footer stats */}
      <div className="flex justify-between items-center text-sm text-gray-600 px-4">
        <div>
          Showing {filteredAndSortedRows.length} of {tableRows.filter(r => !r.isDeleted).length} rows
        </div>
        <div className="flex items-center space-x-4">
          {modifiedRowsCount > 0 && (
            <span className="text-blue-600">
              {modifiedRowsCount} unsaved changes
            </span>
          )}
          <span>
            {visibleColumns.length} of {columns.length} columns visible
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDataTableEditor;