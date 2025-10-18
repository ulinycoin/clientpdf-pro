import React from 'react';
import type { Tool } from '@/types';
import { useI18n } from '@/hooks/useI18n';

interface SidebarProps {
  currentTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Tool definitions with icons
const TOOLS: Array<{ id: Tool; icon: string; tier: number }> = [
  // Tier 1: Core tools
  { id: 'merge-pdf', icon: '📑', tier: 1 },
  { id: 'split-pdf', icon: '✂️', tier: 1 },
  { id: 'compress-pdf', icon: '🗜️', tier: 1 },
  { id: 'protect-pdf', icon: '🔒', tier: 1 },
  { id: 'ocr-pdf', icon: '🔍', tier: 1 },

  // Tier 2: Edit tools
  { id: 'add-text-pdf', icon: '📝', tier: 2 },
  { id: 'watermark-pdf', icon: '💧', tier: 2 },
  { id: 'rotate-pdf', icon: '🔄', tier: 2 },
  { id: 'delete-pages-pdf', icon: '🗑️', tier: 2 },
  { id: 'extract-pages-pdf', icon: '📄', tier: 2 },
  { id: 'unlock-pdf', icon: '🔓', tier: 2 },

  // Tier 3: Convert tools
  { id: 'images-to-pdf', icon: '🖼️', tier: 3 },
  { id: 'pdf-to-images', icon: '📷', tier: 3 },
  { id: 'pdf-to-word', icon: '📋', tier: 3 },
  { id: 'word-to-pdf', icon: '📄', tier: 3 },
  { id: 'sign-pdf', icon: '✍️', tier: 3 },
  { id: 'flatten-pdf', icon: '📏', tier: 3 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTool,
  onToolSelect,
  collapsed,
  onToggleCollapse,
}) => {
  const { t } = useI18n();

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-privacy-900 border-r border-gray-200 dark:border-privacy-700 transition-all duration-300 ease-in-out z-30 overflow-y-auto ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-ocean-500 text-white flex items-center justify-center hover:bg-ocean-600 transition-colors shadow-md"
        aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
      >
        <span className="text-xs">{collapsed ? '→' : '←'}</span>
      </button>

      {/* Section title */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-privacy-700">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {t('sidebar.tools')}
          </h2>
        </div>
      )}

      {/* Tools list */}
      <nav className="p-2">
        <ul className="space-y-1">
          {TOOLS.map((tool) => {
            const isActive = currentTool === tool.id;

            return (
              <li key={tool.id}>
                <button
                  onClick={() => onToolSelect(tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-ocean-50 dark:bg-ocean-900/20 text-ocean-600 dark:text-ocean-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-privacy-800'
                  }`}
                  title={collapsed ? t(`tools.${tool.id}.name`) : undefined}
                >
                  <span className="text-xl flex-shrink-0">{tool.icon}</span>
                  {!collapsed && (
                    <span className="text-sm truncate">
                      {t(`tools.${tool.id}.name`)}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-500"></span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-privacy-700 bg-white dark:bg-privacy-900">
          <a
            href="https://localpdf.online"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-ocean-500 dark:hover:text-ocean-400 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>{t('sidebar.backToMain')}</span>
          </a>
        </div>
      )}
    </aside>
  );
};
