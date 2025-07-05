export interface LocaleData {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    close: string;
    save: string;
    download: string;
    upload: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    previous: string;
    continue: string;
    finish: string;
    reset: string;
    clear: string;
    select: string;
    selectAll: string;
    file: string;
    files: string;
    page: string;
    pages: string;
    size: string;
    quality: string;
    format: string;
    options: string;
    settings: string;
    help: string;
    about: string;
    privacy: string;
    terms: string;
  };
  navigation: {
    home: string;
    tools: string;
    faq: string;
    contact: string;
  };
  header: {
    title: string;
    subtitle: string;
    tagline: string;
  };
  footer: {
    description: string;
    copyright: string;
    privacyFirst: string;
    noUploads: string;
    freeForever: string;
  };
  tools: {
    merge: ToolLocale;
    split: ToolLocale;
    compress: ToolLocale;
    addText: ToolLocale;
    watermark: ToolLocale;
    rotate: ToolLocale;
    extractPages: ToolLocale;
    extractText: ToolLocale;
    pdfToImage: ToolLocale;
  };
  fileUpload: {
    dragDrop: string;
    clickToSelect: string;
    supportedFormats: string;
    maxSize: string;
    selectFiles: string;
    noFileSelected: string;
    fileSelected: string;
    filesSelected: string;
    invalidFormat: string;
    fileTooLarge: string;
    uploadError: string;
  };
  errors: {
    fileNotFound: string;
    invalidFile: string;
    fileTooLarge: string;
    processingError: string;
    networkError: string;
    unknownError: string;
    pageNotFound: string;
    serviceUnavailable: string;
  };
  seo: {
    meta: {
      title: string;
      description: string;
      keywords: string;
    };
  };
}

export interface ToolLocale {
  title: string;
  description: string;
  action: string;
  processing: string;
  success: string;
  error: string;
  [key: string]: any; // Additional tool-specific properties
}

export type SupportedLanguage = 'en' | 'ru';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺'
  }
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
