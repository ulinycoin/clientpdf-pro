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
    <div className="fixed left-0 top-16 right-0 h-16 border-b border-white/20 dark:border-white/10 z-40 overflow-hidden shadow-sm">
      <div className="card-glass"></div>
      <div className="h-full w-full flex items-center justify-center gap-2 px-4 overflow-x-auto relative z-10">
        {GROUPS.map((group) => {
          const isActive = selectedGroup === group.id;

          return (
            <Button
              key={group.id}
              variant="ghost"
              onClick={() => onGroupSelect(group.id)}
              className={`group flex items-center gap-3 px-5 py-2 h-12 transition-all duration-300 whitespace-nowrap relative overflow-hidden rounded-lg mx-0.5 ${isActive
                ? 'text-gray-900 dark:text-white font-semibold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {/* Hover/Active Glass layers */}
              <div className={`card-glass opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''} group-hover:[filter:url(#liquid-refraction)]`}></div>
              <div className={`card-glow opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-50' : ''}`}></div>

              <span className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>
                <group.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="text-sm relative z-10 transition-colors duration-200">{t(group.labelKey)}</span>

              {/* Bottom Active Indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-t-full bg-accent-blue z-20 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
