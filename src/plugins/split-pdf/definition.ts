import type { IToolDefinition } from '../../core/types/contracts';

export const splitPdfDefinition: IToolDefinition = {
  id: 'split-pdf',
  name: 'Split PDF',
  description: 'Split a PDF into multiple output documents.',
  entitlements: ['pdf.split'],
  limits: {
    featureTier: 'basic',
    maxFileSize: { free: 25 * 1024 * 1024, pro: 200 * 1024 * 1024 },
    maxPagesPerFile: { free: 200, pro: 2000 },
    monthlyQuota: { free: 20, pro: 500 },
  },
  uiLoader: () => import('./ui'),
  logicLoader: () => import('./logic'),
};
