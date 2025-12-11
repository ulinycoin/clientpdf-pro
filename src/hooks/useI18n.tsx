// This file now re-exports the context-based i18n hook
// All logic has been moved to I18nContext.tsx for centralized state management
export { useI18nContext as useI18n } from '@/contexts/I18nContext';
export type { I18nReturn } from '@/contexts/I18nContext';
