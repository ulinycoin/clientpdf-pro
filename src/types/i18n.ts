// src/types/i18n.ts
export type SupportedLanguage = 'en' | 'de' | 'fr' | 'es' | 'ru';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

// Структура переводов с полной типизацией
export interface Translations {
  // Общие элементы
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
    clear: string;
    preview: string;
    back: string;
    next: string;
    previous: string;
    continue: string;
    finish: string;
    file: string;
    files: string;
    size: string;
    name: string;
    type: string;
    format: string;
    quality: string;
    pages: string;
    page: string;
    processing: string;
    processed: string;
    ready: string;
    complete: string;
    remove: string;
    clearAll: string;
    or: string;
    home: string;
    free: string;
  };

  // Заголовок сайта
  header: {
    title: string;
    subtitle: string;
    navigation: {
      privacy: string;
      faq: string;
      github: string;
    };
    badges: {
      tools: string;
      private: string;
      activeTools: string;
      privateProcessing: string;
    };
    mobileMenu: {
      toggle: string;
      privacyPolicy: string;
      githubRepository: string;
    };
  };

  // Главная страница
  home: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      descriptionSecondary: string;
      features: {
        privacy: {
          title: string;
          subtitle: string;
        };
        speed: {
          title: string;
          subtitle: string;
        };
        free: {
          title: string;
          subtitle: string;
        };
      };
      trustIndicators: {
        noRegistration: string;
        worksOffline: string;
        openSource: string;
      };
    };
    upload: {
      title: string;
      description: string;
      dragDrop: string;
      selectFiles: string;
      maxSize: string;
      supportedFormats: string;
      ready: string;
      pdfDocument: string;
    };
    tools: {
      title: string;
      subtitle: string;
      whyChoose: {
        title: string;
        description: string;
        stats: {
          tools: string;
          toolsDesc: string;
          privacy: string;
          privacyDesc: string;
          dataCollection: string;
          dataCollectionDesc: string;
          usageLimits: string;
          usageLimitsDesc: string;
        };
        features: {
          noRegistration: string;
          fastProcessing: string;
          secureProcessing: string;
          worksOffline: string;
        };
      };
      trustMessage: string;
    };
  };

  // Инструменты
  tools: {
    merge: {
      title: string;
      description: string;
    };
    split: {
      title: string;
      description: string;
    };
    compress: {
      title: string;
      description: string;
    };
    addText: {
      title: string;
      description: string;
    };
    watermark: {
      title: string;
      description: string;
    };
    rotate: {
      title: string;
      description: string;
    };
    extractPages: {
      title: string;
      description: string;
    };
    extractText: {
      title: string;
      description: string;
    };
    pdfToImage: {
      title: string;
      description: string;
    };
    imageToPdf: {
      title: string;
      description: string;
    };
    wordToPdf: {
      title: string;
      description: string;
    };
    ocr: {
      title: string;
      description: string;
    };
    excelToPdf: {
      title: string;
      description: string;
      pageDescription: string;
      howToTitle: string;
      uploadTitle: string;
      uploadDescription: string;
      configureTitle: string;
      configureDescription: string;
      downloadTitle: string;
      downloadDescription: string;
      featuresTitle: string;
      privacyTitle: string;
      privacyDescription: string;
      fastTitle: string;
      fastDescription: string;
      multiFormatTitle: string;
      multiFormatDescription: string;
      freeTitle: string;
      freeDescription: string;
      chooseExcelFile: string;
      dragDropSubtitle: string;
      supportedFormats: string;
      multipleSheets: string;
      complexFormulas: string;
      internationalText: string;
      localProcessing: string;
      conversionCompleted: string;
      pdfReady: string;
      multipleFiles: string;
      fileInformation: string;
      file: string;
      size: string;
      sheets: string;
      languages: string;
      multiLanguageNote: string;
      chooseDifferentFile: string;
      conversionSettings: string;
      selectSheets: string;
      selectAll: string;
      deselectAll: string;
      rowsColumns: string;
      pageOrientation: string;
      portrait: string;
      landscape: string;
      pageSize: string;
      fontSize: string;
      outputFormat: string;
      singlePdf: string;
      separatePdfs: string;
      includeSheetNames: string;
      convertToPdf: string;
      converting: string;
      faqTitle: string;
    };
  };

  // Ошибки и сообщения
  errors: {
    fileNotSupported: string;
    fileTooLarge: string;
    processingFailed: string;
    noFilesSelected: string;
    invalidFormat: string;
    networkError: string;
    unknownError: string;
  };

  // Подвал
  footer: {
    description: string;
    links: {
      privacy: string;
      faq: string;
      github: string;
    };
    copyright: string;
  };

  // Компоненты
  components: {
    relatedTools: {
      title: string;
      subtitle: string;
      viewAllTools: string;
      toolNames: {
        merge: string;
        split: string;
        compress: string;
        addText: string;
        watermark: string;
        rotate: string;
        extractPages: string;
        extractText: string;
        pdfToImage: string;
      };
      toolDescriptions: {
        merge: string;
        split: string;
        compress: string;
        addText: string;
        watermark: string;
        rotate: string;
        extractPages: string;
        extractText: string;
        pdfToImage: string;
      };
      actions: {
        merge: {
          split: string;
          compress: string;
          extractPages: string;
        };
        split: {
          merge: string;
          rotate: string;
          extractPages: string;
        };
        compress: {
          merge: string;
          split: string;
          watermark: string;
        };
        addText: {
          watermark: string;
          rotate: string;
          extractText: string;
        };
        watermark: {
          addText: string;
          compress: string;
          rotate: string;
        };
        rotate: {
          addText: string;
          watermark: string;
          split: string;
        };
        extractPages: {
          merge: string;
          rotate: string;
          pdfToImage: string;
        };
        extractText: {
          addText: string;
          extractPages: string;
          pdfToImage: string;
        };
        pdfToImage: {
          extractPages: string;
          extractText: string;
          rotate: string;
        };
        "excel-to-pdf": {
          "word-to-pdf": string;
          "images-to-pdf": string;
          merge: string;
        };
      };
    };
    fileUploadZone: {
      dropActive: string;
      chooseFiles: string;
      dragAndDrop: string;
      maxFileSize: string;
      selectFiles: string;
      trustFeatures: {
        private: string;
        fast: string;
        free: string;
      };
      trustMessage: string;
      alerts: {
        unsupportedFiles: string;
        fileLimit: string;
      };
      accessibility: {
        uploadArea: string;
        selectFiles: string;
      };
    };
  };

  // Страницы
  pages: {
    privacy: {
      title: string;
      subtitle: string;
    };
    faq: {
      title: string;
      subtitle: string;
    };
    notFound: {
      title: string;
      description: string;
      backHome: string;
    };
    tools: {
      merge: {
        pageTitle: string;
        pageDescription: string;
        uploadTitle: string;
        buttons: {
          remove: string;
          startMerging: string;
        };
        features: {
          title: string;
          private: {
            title: string;
            description: string;
          };
          fast: {
            title: string;
            description: string;
          };
          free: {
            title: string;
            description: string;
          };
        };
        howTo: {
          title: string;
          steps: {
            upload: {
              title: string;
              description: string;
            };
            arrange: {
              title: string;
              description: string;
            };
            download: {
              title: string;
              description: string;
            };
          };
        };
      };
      compress: {
        pageTitle: string;
        pageDescription: string;
        uploadTitle: string;
        uploadSubtitle: string;
        buttons: {
          uploadDifferent: string;
        };
        features: {
          title: string;
          items: {
            qualitySettings: string;
            imageOptimization: string;
            removeMetadata: string;
            webOptimization: string;
          };
        };
        privacy: {
          title: string;
          items: {
            clientSide: string;
            noUploads: string;
            localProcessing: string;
            instantProcessing: string;
          };
        };
        benefits: {
          title: string;
          smart: {
            title: string;
            description: string;
          };
          control: {
            title: string;
            description: string;
          };
          private: {
            title: string;
            description: string;
          };
        };
        howTo: {
          title: string;
          steps: {
            upload: {
              title: string;
              description: string;
            };
            settings: {
              title: string;
              description: string;
            };
            compress: {
              title: string;
              description: string;
            };
            download: {
              title: string;
              description: string;
            };
          };
        };
        technical: {
          title: string;
          compressed: {
            title: string;
            images: string;
            fonts: string;
            streams: string;
            metadata: string;
          };
          quality: {
            title: string;
            high: string;
            good: string;
            acceptable: string;
            low: string;
          };
        };
      };
      split: {
        pageTitle: string;
        pageDescription: string;
        uploadTitle: string;
        buttons: {
          startSplitting: string;
        };
        features: {
          title: string;
          pageRanges: {
            title: string;
            description: string;
          };
          batchProcessing: {
            title: string;
            description: string;
          };
          previewMode: {
            title: string;
            description: string;
          };
        };
      };
      imageToPdf: {
        seo: {
          title: string;
          description: string;
        };
        breadcrumbs: {
          home: string;
          imageToPdf: string;
        };
        pageTitle: string;
        pageDescription: string;
        features: {
          title: string;
          private: {
            title: string;
            description: string;
          };
          formats: {
            title: string;
            description: string;
          };
          customizable: {
            title: string;
            description: string;
          };
          fast: {
            title: string;
            description: string;
          };
          free: {
            title: string;
            description: string;
          };
          crossPlatform: {
            title: string;
            description: string;
          };
        };
        howTo: {
          title: string;
          steps: {
            upload: {
              title: string;
              description: string;
            };
            customize: {
              title: string;
              description: string;
            };
            download: {
              title: string;
              description: string;
            };
          };
        };
      };
      wordToPdf: {
        seo: {
          title: string;
          description: string;
          keywords: string;
          structuredData: {
            name: string;
            description: string;
            permissions: string;
          };
        };
        breadcrumbs: {
          home: string;
          wordToPdf: string;
        };
        pageTitle: string;
        pageDescription: string;
        howTo: {
          title: string;
          steps: {
            choose: {
              title: string;
              description: string;
            };
            convert: {
              title: string;
              description: string;
            };
            download: {
              title: string;
              description: string;
            };
          };
        };
        features: {
          title: string;
          privacy: {
            title: string;
            description: string;
          };
          fast: {
            title: string;
            description: string;
          };
          compatible: {
            title: string;
            description: string;
          };
          quality: {
            title: string;
            description: string;
          };
        };
      };
      ocr: {
        seo: {
          title: string;
          description: string;
          keywords: string;
        };
        breadcrumbs: {
          home: string;
          ocr: string;
        };
        pageTitle: string;
        pageDescription: string;
        features: {
          private: {
            title: string;
            description: string;
          };
          russian: {
            title: string;
            description: string;
          };
          fast: {
            title: string;
            description: string;
          };
        };
        languages: {
          title: string;
          items: {
            russian: string;
            english: string;
            german: string;
            french: string;
            spanish: string;
            italian: string;
            polish: string;
            ukrainian: string;
            dutch: string;
            portuguese: string;
          };
        };
      };
      extractPages: {
        pageTitle: string;
        pageDescription: string;
        uploadTitle: string;
        uploadSubtitle: string;
        buttons: {
          uploadDifferent: string;
        };
        features: {
          title: string;
          items: {
            individual: string;
            custom: string;
            preview: string;
            quality: string;
          };
        };
        privacy: {
          title: string;
          items: {
            clientSide: string;
            noUploads: string;
            localProcessing: string;
            instantProcessing: string;
          };
        };
        benefits: {
          title: string;
          fast: {
            title: string;
            description: string;
          };
          precise: {
            title: string;
            description: string;
          };
          private: {
            title: string;
            description: string;
          };
        };
        howTo: {
          title: string;
          steps: {
            upload: {
              title: string;
              description: string;
            };
            select: {
              title: string;
              description: string;
            };
            extract: {
              title: string;
              description: string;
            };
            download: {
              title: string;
              description: string;
            };
          };
        };
      };
      extractText: {
        pageTitle: string;
        pageDescription: string;
        steps: {
          upload: string;
          choose: string;
          download: string;
        };
      };
      addText: {
        pageTitle: string;
        pageDescription: string;
        steps: {
          upload: string;
          click: string;
          save: string;
        };
      };
      rotate: {
        pageTitle: string;
        pageDescription: string;
        uploadTitle: string;
        uploadSubtitle: string;
        buttons: {
          uploadDifferent: string;
        };
        features: {
          title: string;
          items: {
            angles: string;
            selection: string;
            preview: string;
            quality: string;
          };
        };
        privacy: {
          title: string;
          items: {
            clientSide: string;
            noUploads: string;
            localProcessing: string;
            instantProcessing: string;
          };
        };
        benefits: {
          title: string;
          instant: {
            title: string;
            description: string;
          };
          precise: {
            title: string;
            description: string;
          };
          private: {
            title: string;
            description: string;
          };
        };
        howTo: {
          title: string;
          steps: {
            upload: {
              title: string;
              description: string;
            };
            select: {
              title: string;
              description: string;
            };
            angle: {
              title: string;
              description: string;
            };
            download: {
              title: string;
              description: string;
            };
          };
        };
      };
      watermark: {
        pageTitle: string;
        pageDescription: string;
        steps: {
          upload: string;
          configure: string;
          download: string;
        };
      };
      pdfToImage: {
        pageTitle: string;
        pageDescription: string;
        steps: {
          upload: string;
          format: string;
          download: string;
        };
      };
    };
  };
}

// Константы языков
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
  },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// Тип для интерполяции параметров в переводах
export type TranslationParams = Record<string, string | number>;
