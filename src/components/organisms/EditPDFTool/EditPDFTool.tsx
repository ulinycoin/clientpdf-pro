import React, { useState, useEffect, createContext, useContext } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { useEditPDF } from './hooks/useEditPDF';
import PagesTab from './tabs/PagesTab';
import AnnotateTab from './tabs/AnnotateTab';
import DesignTab from './tabs/DesignTab';
import ToolsTab from './tabs/ToolsTab';
import { Download, X, Undo2, Redo2 } from 'lucide-react';

interface EditPDFToolProps {
  file: File;
  onClose: () => void;
}

type TabType = 'pages' | 'annotate' | 'design' | 'tools';

// Create context for sharing hook across tabs
const EditPDFContext = createContext<ReturnType<typeof useEditPDF> | null>(null);

export const useEditPDFContext = () => {
  const context = useContext(EditPDFContext);
  if (!context) {
    throw new Error('useEditPDFContext must be used within EditPDFTool');
  }
  return context;
};

const EditPDFTool: React.FC<EditPDFToolProps> = ({ file, onClose }) => {
  const { t } = useI18n();
  const [currentTab, setCurrentTab] = useState<TabType>('pages');

  const editPDFHook = useEditPDF();

  useEffect(() => {
    editPDFHook.loadFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]); // Only re-run when file changes, not when hook changes

  const handleSave = async () => {
    try {
      const blob = await editPDFHook.processAndSave();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_edited.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save PDF:', error);
    }
  };

  const tabs = [
    { id: 'pages' as const, label: t('tools.edit.tabs.pages'), icon: '📑' },
    { id: 'annotate' as const, label: t('tools.edit.tabs.annotate'), icon: '✏️' },
    { id: 'design' as const, label: t('tools.edit.tabs.design'), icon: '🎨' },
    { id: 'tools' as const, label: t('tools.edit.tabs.tools'), icon: '⚙️' },
  ];

  if (!editPDFHook.state.pdfDoc) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <EditPDFContext.Provider value={editPDFHook}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-seafoam-500 to-ocean-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold text-lg">
            {t('tools.edit.title')} - {file.name}
          </h2>
          <span className="text-white/80 text-sm">
            {editPDFHook.state.pages.length} {t('tools.edit.pages.count')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                px-6 py-3 font-medium transition-all relative
                ${currentTab === tab.id
                  ? 'text-ocean-600 dark:text-ocean-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {currentTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ocean-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 min-h-[500px]">
        {currentTab === 'pages' && <PagesTab />}
        {currentTab === 'annotate' && <AnnotateTab />}
        {currentTab === 'design' && <DesignTab />}
        {currentTab === 'tools' && <ToolsTab />}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2">
          <button
            onClick={editPDFHook.undo}
            disabled={!editPDFHook.canUndo}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            aria-label={t('common.undo')}
          >
            <Undo2 className="w-4 h-4" />
            {t('common.undo')}
          </button>
          <button
            onClick={editPDFHook.redo}
            disabled={!editPDFHook.canRedo}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            aria-label={t('common.redo')}
          >
            <Redo2 className="w-4 h-4" />
            {t('common.redo')}
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={editPDFHook.state.isProcessing}
          className="px-6 py-2 bg-gradient-to-r from-seafoam-500 to-ocean-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
        >
          {editPDFHook.state.isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {t('common.processing')}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t('common.saveDownload')}
            </>
          )}
        </button>
      </div>
    </div>
    </EditPDFContext.Provider>
  );
};

export default EditPDFTool;
