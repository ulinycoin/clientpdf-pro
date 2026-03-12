import type { ToolMenuItem } from './build-tool-menu';

export type StudioToolCategory = 'edit' | 'convert';

const EDIT_TOOL_IDS = new Set<string>([
  'merge-pdf',
  'split-pdf',
  'rotate-pdf',
  'delete-pages-pdf',
  'compress-pdf',
  'unlock-pdf',
  'encrypt-pdf',
  'protect-pdf',
  'pdf-editor',
]);

const CONVERT_TOOL_IDS = new Set<string>([
  'word-to-pdf',
  'excel-to-pdf',
  'pdf-to-jpg',
  'ocr-pdf',
  'extract-images',
]);

export function getStudioToolCategory(toolId: string): StudioToolCategory | null {
  if (EDIT_TOOL_IDS.has(toolId)) {
    return 'edit';
  }
  if (CONVERT_TOOL_IDS.has(toolId)) {
    return 'convert';
  }
  return null;
}

export function groupToolsByStudioCategory(menu: ToolMenuItem[]): Record<StudioToolCategory, ToolMenuItem[]> {
  const grouped: Record<StudioToolCategory, ToolMenuItem[]> = {
    edit: [],
    convert: [],
  };

  for (const item of menu) {
    const category = getStudioToolCategory(item.toolId);
    if (!category) {
      continue;
    }
    grouped[category].push(item);
  }

  return grouped;
}
