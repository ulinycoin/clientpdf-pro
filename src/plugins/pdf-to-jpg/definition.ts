import type { IToolDefinition } from '../../core/types/contracts';

export const pdfToJpgDefinition: IToolDefinition = {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert each page of a PDF document into a high-quality JPG image.',
    entitlements: ['pdf.to_image'],
    limits: {
        featureTier: 'basic',
        maxFileSize: { free: 50 * 1024 * 1024, pro: 500 * 1024 * 1024 },
    },
    uiLoader: () => import('./ui'),
    logicLoader: () => import('./logic'),
};
