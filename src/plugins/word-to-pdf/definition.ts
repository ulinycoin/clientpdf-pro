import type { IToolDefinition } from '../../core/types/contracts';

export const wordToPdfDefinition: IToolDefinition = {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Microsoft Word documents (.docx) to PDF format.',
    entitlements: ['office.convert'],
    limits: {
        featureTier: 'basic',
        maxFileSize: { free: 10 * 1024 * 1024, pro: 100 * 1024 * 1024 },
    },
    uiLoader: () => import('./ui'),
    logicLoader: () => import('./logic'),
};
