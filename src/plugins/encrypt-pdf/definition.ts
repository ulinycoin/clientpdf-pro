import type { IToolDefinition } from '../../core/types/contracts';

export const encryptPdfDefinition: IToolDefinition = {
  id: 'encrypt-pdf',
  name: 'Encrypt PDF',
  description: 'Protect PDF files with password-based encryption.',
  entitlements: ['pdf.protect.encrypt'],
  limits: {
    featureTier: 'basic',
    maxFileSize: { free: 25 * 1024 * 1024, pro: 200 * 1024 * 1024 },
    maxPagesPerFile: { free: 300, pro: 3000 },
  },
  uiLoader: () => import('./ui'),
  logicLoader: () => import('./logic'),
};
