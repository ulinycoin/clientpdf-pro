export const APP_BASE_PATH = '/app';
export const APP_DEV_ORIGIN = 'http://127.0.0.1:3000';
export const APP_STUDIO_ROUTE = '/studio';
export const APP_STUDIO_EDIT_ROUTE = '/studio/edit';
export const APP_STUDIO_CONVERT_ROUTE = '/studio/convert';

const LEGACY_TARGET_ROUTE_MAP: Record<string, string> = {
  studio: APP_STUDIO_ROUTE,
  edit: APP_STUDIO_EDIT_ROUTE,
  'edit-pdf': APP_STUDIO_EDIT_ROUTE,
  'edit-text': APP_STUDIO_EDIT_ROUTE,
  'edit-text-pdf': APP_STUDIO_EDIT_ROUTE,
  'add-text': APP_STUDIO_EDIT_ROUTE,
  'add-text-pdf': APP_STUDIO_EDIT_ROUTE,
  sign: APP_STUDIO_EDIT_ROUTE,
  'sign-pdf': APP_STUDIO_EDIT_ROUTE,
  watermark: APP_STUDIO_EDIT_ROUTE,
  'watermark-pdf': APP_STUDIO_EDIT_ROUTE,
  protect: APP_STUDIO_EDIT_ROUTE,
  'protect-pdf': APP_STUDIO_EDIT_ROUTE,
  'add-form-fields': APP_STUDIO_EDIT_ROUTE,
  'add-form-fields-pdf': APP_STUDIO_EDIT_ROUTE,
  flatten: APP_STUDIO_EDIT_ROUTE,
  'flatten-pdf': APP_STUDIO_EDIT_ROUTE,
  merge: '/merge-pdf',
  'merge-pdf': '/merge-pdf',
  split: APP_STUDIO_ROUTE,
  'split-pdf': APP_STUDIO_ROUTE,
  pages: APP_STUDIO_ROUTE,
  'organize-pdf': APP_STUDIO_ROUTE,
  rotate: APP_STUDIO_ROUTE,
  'rotate-pdf': APP_STUDIO_ROUTE,
  'delete-pages': APP_STUDIO_ROUTE,
  'delete-pages-pdf': APP_STUDIO_ROUTE,
  'extract-pages': APP_STUDIO_ROUTE,
  'extract-pages-pdf': APP_STUDIO_ROUTE,
  compress: '/compress-pdf',
  'compress-pdf': '/compress-pdf',
  ocr: '/ocr-pdf',
  'ocr-pdf': '/ocr-pdf',
  tables: APP_STUDIO_CONVERT_ROUTE,
  'tables-pdf': APP_STUDIO_CONVERT_ROUTE,
  'pdf-to-word': APP_STUDIO_CONVERT_ROUTE,
  'word-to-pdf': '/word-to-pdf',
  'excel-to-pdf': '/excel-to-pdf',
  'images-to-pdf': APP_STUDIO_CONVERT_ROUTE,
  'pdf-to-images': '/pdf-to-jpg',
  'pdf-to-jpg': '/pdf-to-jpg',
  'extract-images': '/extract-images',
  'extract-images-pdf': '/extract-images',
  'unlock-pdf': '/unlock-pdf',
  'encrypt-pdf': '/encrypt-pdf',
};

export function resolveAppRoute(target?: string): string {
  if (!target) {
    return APP_STUDIO_ROUTE;
  }

  return LEGACY_TARGET_ROUTE_MAP[target] ?? `/${target}`;
}

export function buildAppPath(target?: string): string {
  return `${APP_BASE_PATH}${resolveAppRoute(target)}`;
}

export function getAppOriginUrl(target?: string): string {
  return `${APP_DEV_ORIGIN}${buildAppPath(target)}`;
}
