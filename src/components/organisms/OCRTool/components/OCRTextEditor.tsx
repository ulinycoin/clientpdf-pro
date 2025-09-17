import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Undo, Redo, FileText, Eye } from 'lucide-react';
import Button from '../../../atoms/Button';
import { useTranslation } from '../../../../hooks/useI18n';

interface OCRTextEditorProps {
  initialText: string;
  originalFileName: string;
  confidence: number;
  processingTime: number;
  wordsCount: number;
  onSave: (editedText: string) => void;
  onDownload: (editedText: string, format: 'txt' | 'pdf' | 'docx' | 'rtf') => void;
  onClose: () => void;
  onApplyChanges?: (editedText: string) => void; // New prop for applying changes
  onScrollToResults?: () => void; // New prop for scrolling to results
  className?: string;
}

interface EditHistory {
  text: string;
  timestamp: number;
}

const OCRTextEditor: React.FC<OCRTextEditorProps> = ({
  initialText,
  originalFileName,
  confidence,
  processingTime,
  wordsCount,
  onSave,
  onDownload,
  onClose,
  onApplyChanges,
  onScrollToResults,
  className = ''
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Editor state
  const [editedText, setEditedText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode by default
  const [isSaved, setIsSaved] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Edit history for undo/redo
  const [history, setHistory] = useState<EditHistory[]>([{ text: initialText, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Statistics
  const currentStats = {
    characters: editedText.length,
    words: editedText.trim().split(/\s+/).filter(word => word.length > 0).length,
    lines: editedText.split('\n').length,
    changes: editedText !== initialText
  };

  // Check if text has been modified
  const textHasChanged = editedText !== initialText;
  
  // Update hasUnsavedChanges when text changes
  useEffect(() => {
    const hasChanges = editedText !== initialText;
    setHasUnsavedChanges(hasChanges);
  }, [editedText, initialText]);

  // Handle text change with auto-save
  const handleTextChange = (newText: string) => {
    setEditedText(newText);
    setIsSaved(false);

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Add to history if significant change
    if (Math.abs(newText.length - history[historyIndex].text.length) > 10 || 
        Date.now() - history[historyIndex].timestamp > 5000) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ text: newText, timestamp: Date.now() });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    // Auto-save after 2 seconds of inactivity (only if there are actual changes)
    const hasChanges = newText !== initialText;
    if (hasChanges) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(false);
      }, 2000);
    }
  };

  // Handle save (simplified - only for auto-save)
  const handleSave = () => {
    onSave(editedText);
    setIsSaved(true);
    setHasUnsavedChanges(false);
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditedText(history[newIndex].text);
      setIsSaved(false);
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditedText(history[newIndex].text);
      setIsSaved(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [editedText, isEditing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            if (!e.shiftKey) {
              e.preventDefault();
              handleUndo();
            } else {
              e.preventDefault();
              handleRedo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
        }
      }
    };

    if (isEditing) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditing, historyIndex]);

  return (
    <div className={`h-full flex flex-col bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {t('tools.ocr.editor.title') || 'Text Editor'}
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                <span className="animate-pulse">●</span>
                {t('tools.ocr.editor.unsavedChanges') || 'Unsaved changes'}
              </span>
            )}
            {textHasChanged && isSaved && (
              <span className="text-green-600 text-sm font-medium">
                ✓ {t('tools.ocr.editor.changesSaved') || 'Saved'}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200"
              title={t('common.close') || 'Close'}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📊 {t('tools.ocr.editor.stats.confidence') || 'Confidence'}: {confidence.toFixed(1)}%</span>
            <span>⏱️ {((processingTime || 0) / 1000).toFixed(1)}s</span>
            <span>📝 {currentStats.words} {t('tools.ocr.editor.stats.words') || 'words'}</span>
            <span>📄 {currentStats.lines} {t('tools.ocr.editor.stats.lines') || 'lines'}</span>
            {currentStats.changes && (
              <span className="text-orange-600 font-medium">
                ✏️ {t('tools.ocr.editor.stats.modified') || 'Modified'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              size="sm"
              className="text-xs"
            >
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? t('tools.ocr.editor.viewMode') || 'View' : t('tools.ocr.editor.editMode') || 'Edit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Text Content */}
        <div className="w-full flex flex-col">
          <div className="flex-1 overflow-auto p-4">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editedText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={t('tools.ocr.editor.placeholder') || 'Start editing your extracted text...'}
                className="w-full h-full min-h-[400px] p-4 border border-gray-300 rounded-lg font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '400px', height: 'auto' }}
              />
            ) : (
              <div className="w-full h-full p-4 bg-gray-50 rounded-lg">
                <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                  {editedText || t('tools.ocr.editor.noText') || 'No text content'}
                </pre>
              </div>
            )}
          </div>

          {/* Editor Toolbar */}
          {isEditing && (
            <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    variant="outline"
                    size="sm"
                    title={t('tools.ocr.editor.undo') || 'Undo (Ctrl+Z)'}
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    variant="outline"
                    size="sm"
                    title={t('tools.ocr.editor.redo') || 'Redo (Ctrl+Y)'}
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {currentStats.characters} {t('tools.ocr.editor.stats.characters') || 'characters'}
                  </span>
                  {onApplyChanges && textHasChanged && (
                    <Button
                      onClick={() => {
                        onApplyChanges(editedText);
                        // Scroll to results after applying changes
                        setTimeout(() => {
                          if (onScrollToResults) {
                            onScrollToResults();
                          }
                        }, 100); // Small delay to ensure state updates
                      }}
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Применить изменения
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRTextEditor;