import React from 'react';
import type { Tool, ToolGroup } from '@/types';
import { TOOL_GROUPS } from '@/types';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import {
  Files,
  Scissors,
  Minimize2,
  Shield,
  ScanText,
  Stamp,
  Type,
  PenTool,
  FileInput,
  RotateCw,
  Trash2,
  FileStack,
  Images,
  Image as ImageIcon,
  FileText,
  FileOutput,
  Feather,
  Layers,
  FileOutput as ExtractIcon,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedGroup: ToolGroup;
}

// Tool definitions with icons
const TOOLS: Array<{ id: Tool; icon: React.ElementType; tier: number }> = [
  // Tier 1: Core tools
  { id: 'organize-pdf', icon: Files, tier: 1 },
  { id: 'merge-pdf', icon: Files, tier: 1 },
  { id: 'split-pdf', icon: Scissors, tier: 1 },
  { id: 'compress-pdf', icon: Minimize2, tier: 1 },
  { id: 'protect-pdf', icon: Shield, tier: 1 },
  { id: 'ocr-pdf', icon: ScanText, tier: 1 },

  // Tier 2: Edit tools
  { id: 'watermark-pdf', icon: Stamp, tier: 2 },
  { id: 'add-text-pdf', icon: Type, tier: 2 },
  { id: 'edit-text-pdf', icon: PenTool, tier: 2 },
  { id: 'add-form-fields-pdf', icon: FileInput, tier: 2 },
  { id: 'rotate-pdf', icon: RotateCw, tier: 2 },
  { id: 'delete-pages-pdf', icon: Trash2, tier: 2 },
  { id: 'extract-pages-pdf', icon: FileStack, tier: 2 },

  // Tier 3: Convert tools
  { id: 'images-to-pdf', icon: Images, tier: 3 },
  { id: 'pdf-to-images', icon: ImageIcon, tier: 3 },
  { id: 'pdf-to-word', icon: FileText, tier: 3 },
  { id: 'word-to-pdf', icon: FileOutput, tier: 3 },
  { id: 'sign-pdf', icon: Feather, tier: 3 },
  { id: 'flatten-pdf', icon: Layers, tier: 3 },
  { id: 'extract-images-pdf', icon: ExtractIcon, tier: 3 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTool,
  onToolSelect,
  collapsed,
  selectedGroup,
}) => {
  const { t } = useI18n();

  // Filter tools based on selected group
  const filteredTools = TOOLS.filter((tool) =>
    TOOL_GROUPS[selectedGroup].includes(tool.id)
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r border-gray-200/40 dark:border-privacy-700/40 transition-all duration-300 ease-in-out z-20 overflow-y-auto ${collapsed ? 'w-16' : 'w-64'} 
      backdrop-blur-xl bg-white/60 dark:bg-privacy-900/60 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-privacy-900/40 shadow-lg`}
      style={{ paddingTop: '7.5rem' }}
    >
      {/* Section title */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200/40 dark:border-privacy-700/40">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {t('sidebar.tools')}
          </h2>
        </div>
      )}

      {/* Tools list */}
      <nav className="p-2">
        <ul className="space-y-1">
          {filteredTools.map((tool) => {
            const isActive = currentTool === tool.id;
            const Icon = tool.icon;

            return (
              <li key={tool.id}>
                <Button
                  variant="ghost"
                  onClick={() => onToolSelect(tool.id)}
                  className={`group w-full justify-start gap-3 px-3 py-2.5 h-auto transition-all duration-200 border ${isActive
                    ? 'bg-ocean-50/80 dark:bg-ocean-900/40 text-ocean-600 dark:text-ocean-400 font-medium shadow-sm border-ocean-200/50 dark:border-ocean-700/50'
                    : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-ocean-50/50 dark:hover:bg-ocean-900/20 hover:text-ocean-600 dark:hover:text-ocean-400 hover:scale-[1.02]'
                    }`}
                  title={collapsed ? t(`tools.${tool.id}.name`) : undefined}
                >
                  <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-ocean-600 dark:text-ocean-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-ocean-600 dark:group-hover:text-ocean-400'}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  {!collapsed && (
                    <span className="text-sm truncate transition-colors duration-200">
                      {t(`tools.${tool.id}.name`)}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-500 shadow-[0_0_8px_rgba(69,183,209,0.6)]"></span>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>

        {/* Blog Link */}
        <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-privacy-700/50">
          {!collapsed && (
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                Resources
              </h3>
            </div>
          )}
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                asChild
                className="group w-full justify-start gap-3 px-3 py-2.5 h-auto transition-all duration-200 border border-transparent text-gray-700 dark:text-gray-300 hover:bg-ocean-50/50 dark:hover:bg-ocean-900/20 hover:text-ocean-600 dark:hover:text-ocean-400 hover:scale-[1.02]"
                title={collapsed ? 'Blog' : undefined}
              >
                <a href="/blog">
                  <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110 text-gray-500 dark:text-gray-400 group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    <BookOpen size={20} strokeWidth={2} />
                  </span>
                  {!collapsed && (
                    <span className="text-sm truncate transition-colors duration-200">
                      Blog
                    </span>
                  )}
                </a>
              </Button>
            </li>
          </ul>
        </div>
      </nav>

    </aside>
  );
};
