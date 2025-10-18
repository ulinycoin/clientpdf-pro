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
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-ocean-50 dark:bg-ocean-900/20 text-ocean-600 dark:text-ocean-400 font-medium shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-ocean-50 dark:hover:bg-ocean-900/10 hover:text-ocean-600 dark:hover:text-ocean-400 hover:shadow-sm hover:scale-[1.02]'
                  }`}
                  title={collapsed ? t(`tools.${tool.id}.name`) : undefined}
                >
                  <span className="text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {tool.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-sm truncate transition-colors duration-200">
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

    </aside>
  );
};
