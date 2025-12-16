import React from 'react';
import type { ToolGroup } from '@/types';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';

import { LayoutGrid, Files, PenTool, Shield, ArrowLeftRight } from 'lucide-react';

interface ToolGroupNavProps {
  selectedGroup: ToolGroup;
  onGroupSelect: (group: ToolGroup) => void;
}

// Group definitions with icons
const GROUPS: Array<{ id: ToolGroup; icon: React.ElementType; labelKey: string }> = [
  { id: 'all', icon: LayoutGrid, labelKey: 'toolGroups.all' },
  { id: 'organize', icon: Files, labelKey: 'toolGroups.organize' },
  { id: 'edit', icon: PenTool, labelKey: 'toolGroups.edit' },
  { id: 'security', icon: Shield, labelKey: 'toolGroups.security' },
  { id: 'convert', icon: ArrowLeftRight, labelKey: 'toolGroups.convert' },
];

export const ToolGroupNav: React.FC<ToolGroupNavProps> = ({
  selectedGroup,
  onGroupSelect,
}) => {
  const { t } = useI18n();

  return (
    <div className="fixed left-0 top-16 right-0 h-16 backdrop-blur-3xl bg-[#fbfbfd]/60 dark:bg-[#1c1c1e]/60 border-b border-white/20 dark:border-white/10 z-40 shadow-sm transition-all duration-300">
      <div className="h-full w-full flex items-center justify-center gap-3 px-4 overflow-x-auto">
        {GROUPS.map((group) => {
          const isActive = selectedGroup === group.id;

          return (
            <Button
              key={group.id}
              variant="ghost"
              onClick={() => onGroupSelect(group.id)}
              className={`flex items-center gap-2.5 px-5 py-2 h-10 rounded-full transition-all duration-300 whitespace-nowrap ${isActive
                ? 'bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white font-medium shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <group.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-sm">{t(group.labelKey)}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
