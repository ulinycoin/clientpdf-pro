import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAddText } from '../../hooks/useAddText';
import { AddTextToolProps, TextElement } from '../../types/addText.types';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const AddTextTool: React.FC<AddTextToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const {
    isProcessing, progress, error, result,
    textElements, selectedElementId, editingState,
    canUndo, canRedo, canvasInteraction,
    currentPage, totalPages, pageScale, pageDimensions,
    addTextElement, updateTextElement, deleteTextElement, selectElement, duplicateElement,
    startEditing, finishEditing, cancelEditing, undo, redo,
    startDragging, updateDragging, stopDragging,
    goToPage, setPageScale, setPageDimensions, setTotalPages,
    processFile, resetState
  } = useAddText();

  // Local state
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPageRenderer, setCurrentPageRenderer] = useState<any>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [toolMode, setToolMode] = useState<'select' | 'add'>('add');
  const [editingText, setEditingText] = useState('');

  // Refs - CRITICAL FIX
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const renderTaskRef = useRef<any>(null);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Tools</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Add Text Tool - MINIMAL VERSION</h2>
      </div>
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          ⚠️ This is a minimal version. Canvas fixes are being applied...
        </p>
      </div>
    </div>
  );
};

export default AddTextTool;