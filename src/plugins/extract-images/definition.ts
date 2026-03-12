import type { IToolDefinition } from '../../core/types/contracts';

export const extractImagesDefinition: IToolDefinition = {
  id: 'extract-images',
  name: 'Extract Images',
  description: 'Extract embedded images from PDF pages into standalone image files.',
  entitlements: ['pdf.to_image'],
  limits: {
    featureTier: 'basic',
    maxFileSize: { free: 50 * 1024 * 1024, pro: 500 * 1024 * 1024 },
    maxPagesPerFile: { free: 100, pro: 1000 },
  },
  uiLoader: () => import('./ui'),
  logicLoader: () => import('./logic'),
};
