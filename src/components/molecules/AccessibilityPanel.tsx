import React, { useState } from 'react';
import { useAccessibilityPreferences } from '../../hooks/useAccessibilityPreferences';
import GlassModal from '../atoms/GlassModal';

export interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const { preferences, updatePreference, resetToDefaults, applySystemPreferences } = useAccessibilityPreferences();
  const [activeTab, setActiveTab] = useState<'motion' | 'visual' | 'navigation'>('motion');

  const tabs = [
    { id: 'motion', label: 'Анимации', icon: '🎭' },
    { id: 'visual', label: 'Визуальные', icon: '👁️' },
    { id: 'navigation', label: 'Навигация', icon: '⌨️' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Маленький', example: 'Аа' },
    { value: 'medium', label: 'Средний', example: 'Аа' },
    { value: 'large', label: 'Большой', example: 'Аа' },
    { value: 'extra-large', label: 'Очень большой', example: 'Аа' }
  ] as const;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Настройки доступности"
      variant="privacy"
      size="lg"
      className={className}
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={applySystemPreferences}
            className="btn-ocean-modern text-sm py-2"
          >
            🔄 Использовать системные настройки
          </button>
          <button
            onClick={resetToDefaults}
            className="btn-privacy-modern text-sm py-2"
          >
            ↺ Сбросить к значениям по умолчанию
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-privacy-100 dark:bg-privacy-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-privacy-700 text-privacy-900 dark:text-privacy-100 shadow-sm'
                  : 'text-privacy-600 dark:text-privacy-400 hover:text-privacy-800 dark:hover:text-privacy-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {/* Motion Tab */}
          {activeTab === 'motion' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-privacy-800 dark:text-privacy-200 mb-1">
                      Уменьшить анимации
                    </h3>
                    <p className="text-sm text-privacy-600 dark:text-privacy-400">
                      Отключает анимации и переходы для снижения нагрузки и предотвращения дискомфорта
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.reducedMotion}
                      onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-privacy-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-privacy-300 dark:peer-focus:ring-privacy-800 rounded-full peer dark:bg-privacy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-privacy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-privacy-600 peer-checked:bg-privacy-600"></div>
                  </label>
                </div>

                {/* Animation Preview */}
                <div className="p-4 bg-privacy-50 dark:bg-privacy-900 rounded-lg">
                  <div className="text-xs text-privacy-500 mb-2">Превью анимации:</div>
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 bg-seafoam-400 rounded-full ${preferences.reducedMotion ? '' : 'animate-pulse'}`} />
                    <div className={`w-6 h-6 bg-ocean-400 rounded ${preferences.reducedMotion ? '' : 'animate-bounce'}`} />
                    <div className={`w-4 h-4 bg-privacy-accent rounded-full ${preferences.reducedMotion ? '' : 'gentle-float'}`} />
                  </div>
                </div>

                <div className="text-sm text-privacy-600 dark:text-privacy-400">
                  {preferences.reducedMotion 
                    ? '✅ Анимации отключены для комфортного просмотра'
                    : 'ℹ️ Анимации включены для полного интерактивного опыта'
                  }
                </div>
              </div>
            </div>
          )}

          {/* Visual Tab */}
          {activeTab === 'visual' && (
            <div className="space-y-6">
              {/* High Contrast */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-privacy-800 dark:text-privacy-200 mb-1">
                    Высокая контрастность
                  </h3>
                  <p className="text-sm text-privacy-600 dark:text-privacy-400">
                    Увеличивает контраст цветов для лучшей видимости текста и элементов
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.highContrast}
                    onChange={(e) => updatePreference('highContrast', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-privacy-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-privacy-300 dark:peer-focus:ring-privacy-800 rounded-full peer dark:bg-privacy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-privacy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-privacy-600 peer-checked:bg-privacy-600"></div>
                </label>
              </div>

              {/* Font Size */}
              <div>
                <h3 className="font-medium text-privacy-800 dark:text-privacy-200 mb-3">
                  Размер шрифта
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updatePreference('fontSize', option.value)}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-200 text-left
                        ${preferences.fontSize === option.value
                          ? 'border-privacy-accent bg-privacy-50 dark:bg-privacy-800'
                          : 'border-privacy-200 dark:border-privacy-700 hover:border-privacy-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-privacy-800 dark:text-privacy-200">
                            {option.label}
                          </div>
                          <div className="text-xs text-privacy-600 dark:text-privacy-400">
                            {option.value === 'small' && '14px'}
                            {option.value === 'medium' && '16px'}
                            {option.value === 'large' && '18px'}
                            {option.value === 'extra-large' && '20px'}
                          </div>
                        </div>
                        <div 
                          className="text-privacy-600 dark:text-privacy-400"
                          style={{ 
                            fontSize: option.value === 'small' ? '14px' : 
                                     option.value === 'medium' ? '16px' :
                                     option.value === 'large' ? '18px' : '20px'
                          }}
                        >
                          {option.example}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Screen Reader */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-privacy-800 dark:text-privacy-200 mb-1">
                    Оптимизация для скринридеров
                  </h3>
                  <p className="text-sm text-privacy-600 dark:text-privacy-400">
                    Улучшает совместимость с программами чтения с экрана
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.screenReaderOptimized}
                    onChange={(e) => updatePreference('screenReaderOptimized', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-privacy-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-privacy-300 dark:peer-focus:ring-privacy-800 rounded-full peer dark:bg-privacy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-privacy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-privacy-600 peer-checked:bg-privacy-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <div className="space-y-6">
              {/* Enhanced Focus */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-privacy-800 dark:text-privacy-200 mb-1">
                    Улучшенная видимость фокуса
                  </h3>
                  <p className="text-sm text-privacy-600 dark:text-privacy-400">
                    Делает границы фокуса более заметными при навигации с клавиатуры
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.focusVisible}
                    onChange={(e) => updatePreference('focusVisible', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-privacy-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-privacy-300 dark:peer-focus:ring-privacy-800 rounded-full peer dark:bg-privacy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-privacy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-privacy-600 peer-checked:bg-privacy-600"></div>
                </label>
              </div>

              {/* Keyboard Navigation */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-privacy-800 dark:text-privacy-200 mb-1">
                    Расширенная навигация с клавиатуры
                  </h3>
                  <p className="text-sm text-privacy-600 dark:text-privacy-400">
                    Включает дополнительные клавиатурные сочетания и улучшенную навигацию
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.keyboardNavigation}
                    onChange={(e) => updatePreference('keyboardNavigation', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-privacy-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-privacy-300 dark:peer-focus:ring-privacy-800 rounded-full peer dark:bg-privacy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-privacy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-privacy-600 peer-checked:bg-privacy-600"></div>
                </label>
              </div>

              {/* Keyboard Shortcuts Reference */}
              <div className="p-4 bg-privacy-50 dark:bg-privacy-900 rounded-lg">
                <h4 className="font-medium text-privacy-800 dark:text-privacy-200 mb-3">
                  Горячие клавиши
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-privacy-600 dark:text-privacy-400">Закрыть модал:</span>
                    <kbd className="px-2 py-1 bg-privacy-200 dark:bg-privacy-700 rounded text-xs">Esc</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-privacy-600 dark:text-privacy-400">Навигация:</span>
                    <kbd className="px-2 py-1 bg-privacy-200 dark:bg-privacy-700 rounded text-xs">Tab</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-privacy-600 dark:text-privacy-400">Активировать:</span>
                    <kbd className="px-2 py-1 bg-privacy-200 dark:bg-privacy-700 rounded text-xs">Enter</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-privacy-600 dark:text-privacy-400">Выбор:</span>
                    <kbd className="px-2 py-1 bg-privacy-200 dark:bg-privacy-700 rounded text-xs">Space</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-privacy-200 dark:border-privacy-700">
          <div className="text-xs text-privacy-500 text-center">
            Настройки сохраняются автоматически и применяются ко всем страницам LocalPDF
          </div>
        </div>
      </div>
    </GlassModal>
  );
};

export default AccessibilityPanel;