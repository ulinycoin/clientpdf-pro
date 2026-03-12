import type { IToolDefinition } from '../../core/types/contracts';

export const excelToPdfDefinition: IToolDefinition = {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Microsoft Excel spreadsheets (.xlsx) to PDF format.',
    entitlements: ['office.convert'],
    limits: {
        featureTier: 'basic',
        maxFileSize: { free: 10 * 1024 * 1024, pro: 100 * 1024 * 1024 },
    },
    uiLoader: () => import('./ui'),
    logicLoader: () => import('./logic'),
};
