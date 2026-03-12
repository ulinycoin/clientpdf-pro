import type { IToolDefinition } from '../../core/types/contracts';

export const deletePagesPdfDefinition: IToolDefinition = {
    id: 'delete-pages-pdf',
    name: 'Delete Pages',
    description: 'Remove specific pages from your PDF document.',
    entitlements: ['pdf.delete_pages'],
    limits: {
        featureTier: 'basic',
        maxFileSize: { free: 50 * 1024 * 1024, pro: 500 * 1024 * 1024 },
    },
    uiLoader: () => import('./ui'),
    logicLoader: () => import('./logic'),
};
