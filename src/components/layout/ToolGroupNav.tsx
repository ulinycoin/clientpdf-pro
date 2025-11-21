import React from 'react';
import type { ToolGroup } from '@/types';
import { Button } from '@/components/ui/button';

interface ToolGroupNavProps {
  selectedGroup: ToolGroup;
  onGroupSelect: (group: ToolGroup) => void;
}

// Group definitions with icons (labels will come from i18n)
const GROUPS: Array<{ id: ToolGroup; icon: string }> = [
  { id: 'all', icon: '📚' },
  { id: 'organize', icon: '📋' },
  { id: 'edit', icon: '✏️' },
  { id: 'security', icon: '🔒' },
  { id: 'convert', icon: '🔄' },
];

export const ToolGroupNav: React.FC<ToolGroupNavProps> = ({
  selectedGroup,
  onGroupSelect,
}) => {
  // Group labels mapping
  const groupLabels: Record<ToolGroup, string> = {
    'all': 'All Tools',
    'organize': 'Organize',
    'edit': 'Edit',
    'security': 'Security',
    'convert': 'Convert',
  };

  return (
    <div className="fixed left-0 top-16 right-0 h-14 bg-white dark:bg-privacy-900 border-b border-gray-200 dark:border-privacy-700 z-40">
      <div className="h-full w-full flex items-center justify-center gap-3 px-4 overflow-x-auto">
        {GROUPS.map((group) => {
          const isActive = selectedGroup === group.id;

          return (
            <Button
              key={group.id}
              variant="ghost"
              onClick={() => onGroupSelect(group.id)}
              className={`flex items-center gap-2 px-6 py-2.5 h-10 rounded-lg transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400 font-semibold shadow-sm border border-ocean-200 dark:border-ocean-700'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-privacy-800 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
              }`}
            >
              <span className="text-lg">{group.icon}</span>
              <span className="text-sm font-medium">{groupLabels[group.id]}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
