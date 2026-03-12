import type { IToolDefinition } from '../../core/types/contracts';

export const pdfEditorDefinition: IToolDefinition = {
  id: 'pdf-editor',
  name: 'PDF Editor',
  description: 'Edit visible text directly in the PDF preview and export an updated file.',
  entitlements: ['pdf.edit'],
  limits: {
    featureTier: 'pro',
    maxFileSize: { free: 50 * 1024 * 1024, pro: 500 * 1024 * 1024 },
    maxPagesPerFile: { free: 300, pro: 3000 },
  },
  uiLoader: () => import('./ui'),
  logicLoader: () => import('./logic'),
};
