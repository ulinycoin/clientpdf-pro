import type { IToolDefinition } from '../../core/types/contracts';

export const mergePdfDefinition: IToolDefinition = {
  id: 'merge-pdf',
  name: 'Merge PDF',
  description: 'Combine several PDF files into one document.',
  entitlements: ['pdf.merge'],
  limits: {
    featureTier: 'basic',
    maxFileSize: { free: 25 * 1024 * 1024, pro: 200 * 1024 * 1024 },
    maxPagesPerFile: { free: 200, pro: 2000 },
  },
  uiLoader: () => import('./ui'),
  logicLoader: () => import('./logic'),
};
