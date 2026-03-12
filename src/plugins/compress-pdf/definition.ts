import type { IToolDefinition } from '../../core/types/contracts';

export const compressPdfDefinition: IToolDefinition = {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce the file size of your PDF documents while optimizing for quality.',
    entitlements: ['pdf.compress'],
    limits: {
        featureTier: 'basic',
        maxFileSize: { free: 50 * 1024 * 1024, pro: 500 * 1024 * 1024 },
    },
    uiLoader: () => import('./ui'),
    logicLoader: () => import('./logic'),
    layout: 'split',
    premiumVisuals: true,
};
