import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle
} from 'lucide-react';

import { CsvParseResult } from '../../../services/converters/CsvToPdfConverter';
import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';

interface DataTableEditorProps {
  parseResult: CsvParseResult;
  onChange: (data: CsvParseResult) => void;
  isProcessing?: boolean;
}

interface EditState {
  editingCell: { row: number; column: string } | null;
  editValue: string;
  searchTerm: string;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  selectedRows: Set<number>;
}

export const DataTableEditor: React.FC<DataTableEditorProps> = ({
  parseResult,
  onChange,
  isProcessing = false
}) => {
  const [editState, setEditState] = useState<EditState>({
    editingCell: null,
    editValue: '',
    searchTerm: '',
    sortColumn: null,
    sortDirection: 'asc',
    selectedRows: new Set()
  });

  // 🔍 FILTERED AND SORTED DATA
  const processedData = useMemo(() => {
    let filtered = parseResult.data;

    // Apply search filter
    if (editState.searchTerm) {
      const term = editState.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(term)
        )
      );
    }

    // Apply sorting
    if (editState.sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = String(a[editState.sortColumn!] || '');
        const bVal = String(b[editState.sortColumn!] || '');
        
        const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
        return editState.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [parseResult.data, editState.searchTerm, editState.sortColumn, editState.sortDirection]);

  // 📝 EDIT HANDLERS
  const startEdit = useCallback((row: number, column: string, currentValue: any) => {
    setEditState(prev => ({
      ...prev,
      editingCell: { row, column },
      editValue: String(currentValue || '')
    }));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditState(prev => ({
      ...prev,
      editingCell: null,
      editValue: ''
    }));
  }, []);

  const saveEdit = useCallback(() => {
    if (!editState.editingCell) return;

    const { row, column } = editState.editingCell;
    const newData = [...parseResult.data];
    newData[row] = {
      ...newData[row],
      [column]: editState.editValue
    };

    onChange({
      ...parseResult,
      data: newData
    });

    setEditState(prev => ({
      ...prev,
      editingCell: null,
      editValue: ''
    }));
  }, [editState.editingCell, editState.editValue, parseResult, onChange]);

  // 🔍 SEARCH HANDLER
  const handleSearch = useCallback((term: string) => {
    setEditState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  // 📊 SORT HANDLER
  const handleSort = useCallback((column: string) => {
    setEditState(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: prev.sortColumn === column && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // 🎨 TABLE CELL RENDERER
  const renderCell = useCallback((rowData: any, rowIndex: number, column: string, value: any) => {
    const isEditing = editState.editingCell?.row === rowIndex && editState.editingCell?.column === column;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={editState.editValue}
            onChange={(e) => setEditState(prev => ({ ...prev, editValue: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <Button
            size="sm"
            onClick={saveEdit}
            className="p-1"
          >
            <Save className="w-3 h-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={cancelEdit}
            className="p-1"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
        onClick={() => startEdit(rowIndex, column, value)}
        title="Click to edit"
      >
        <span className="text-sm">
          {String(value || '').substring(0, 50)}
          {String(value || '').length > 50 && '...'}
        </span>
        <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 inline" />
      </div>
    );
  }, [editState.editingCell, editState.editValue, startEdit, saveEdit, cancelEdit]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      
      {/* 🔍 TOOLBAR */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-700">Data Editor</h3>
            <Badge variant="secondary" className="text-xs">
              {processedData.length} rows
            </Badge>
          </div>
          
          {editState.searchTerm && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSearch('')}
            >
              Clear Filter
            </Button>
          )}
        </div>
        
        {/* 🔍 SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search data..."
            value={editState.searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 📊 DATA TABLE */}
      <div className="flex-1 overflow-auto">
        {processedData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">
                {editState.searchTerm ? 'No matching data found' : 'No data available'}
              </h4>
              <p className="text-gray-500">
                {editState.searchTerm ? 'Try adjusting your search terms' : 'Upload a CSV file to start editing'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {parseResult.headers.map((header) => (
                    <th
                      key={header}
                      className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort(header)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{header}</span>
                        <ArrowUpDown className="w-3 h-3" />
                        {editState.sortColumn === header && (
                          <span className="text-blue-500">
                            {editState.sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedData.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex * 0.01 }}
                    className="border-b border-gray-100 hover:bg-gray-50 group transition-colors"
                  >
                    {parseResult.headers.map((header) => (
                      <td
                        key={header}
                        className="px-4 py-3 whitespace-nowrap"
                      >
                        {renderCell(row, rowIndex, header, row[header])}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📊 STATUS BAR */}
      <div className="border-t border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Total: {parseResult.rowCount} rows</span>
            {editState.searchTerm && (
              <span>Filtered: {processedData.length} rows</span>
            )}
            <span>{parseResult.columnCount} columns</span>
          </div>
          <div className="text-xs">
            💡 Click any cell to edit • Click headers to sort
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTableEditor;