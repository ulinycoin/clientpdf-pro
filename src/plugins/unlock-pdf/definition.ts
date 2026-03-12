import type { IToolDefinition } from '../../core/types/contracts';

export const unlockPdfDefinition: IToolDefinition = {
  id: 'unlock-pdf',
  name: 'Unlock PDF',
  description: 'Remove password protection from PDF files.',
  entitlements: ['pdf.protect.unlock'],
  limits: {
    featureTier: 'basic',
    maxFileSize: { free: 25 * 1024 * 1024, pro: 200 * 1024 * 1024 },
    maxPagesPerFile: { free: 300, pro: 3000 },
  },
  uiLoader: () => import('./ui'),
  logicLoader: () => import('./logic'),
};
