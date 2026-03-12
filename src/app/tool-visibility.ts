const HIDDEN_STANDALONE_TOOL_IDS = new Set([
  'rotate-pdf',
  'split-pdf',
  'delete-pages-pdf',
]);

export function isStandaloneToolHidden(toolId: string): boolean {
  return HIDDEN_STANDALONE_TOOL_IDS.has(toolId);
}

