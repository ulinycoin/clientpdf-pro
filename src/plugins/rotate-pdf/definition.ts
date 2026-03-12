import type { IToolDefinition } from '../../core/types/contracts';

export const rotatePdfDefinition: IToolDefinition = {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate all pages in your PDF document by a specific angle.',
    entitlements: ['pdf.rotate'],
    limits: {
        featureTier: 'basic',
        maxFileSize: { free: 50 * 1024 * 1024, pro: 500 * 1024 * 1024 },
    },
    uiLoader: () => import('./ui'),
    logicLoader: () => import('./logic'),
};
