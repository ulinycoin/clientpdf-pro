export const edit = {
  // Basic properties for tools grid
  title: 'Edit PDF',
  description: 'Universal PDF editor with pages, annotations, and design tools',

  // Page metadata (SEO)
  pageTitle: 'Edit PDF - Universal PDF Editor - LocalPDF',
  pageDescription: 'Edit PDF documents with powerful tools: organize pages, add annotations, apply watermarks, and more. 100% private and free.',

  // Upload zone
  uploadTitle: 'Edit PDF',
  uploadSubtitle: 'Upload your PDF to start editing',
  supportedFormats: 'PDF files up to 100MB',

  // Features
  features: {
    title: 'What you can do',
    pages: 'Organize pages - rotate, delete, reorder, and extract',
    annotate: 'Add annotations - text, shapes, stamps, and drawings',
    design: 'Apply design - watermarks, page numbers, and backgrounds',
    tools: 'Document tools - metadata editing and optimization',
  },

  // Tabs
  tabs: {
    pages: 'Pages',
    annotate: 'Annotate',
    design: 'Design',
    tools: 'Tools',
  },

  // Common
  pages: {
    count: 'pages',
    selected: 'selected',
    noPages: 'No pages to display',

    toolbar: {
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      deleteSelected: 'Delete Selected',
      rotateSelected: 'Rotate Selected',
      addBlankPage: 'Add Blank Page',
      insertFromPDF: 'Insert from PDF',
    },

    thumbnail: {
      page: 'Page {number}',
      rotate: 'Rotate',
      delete: 'Delete',
      duplicate: 'Duplicate',
      selected: 'Selected',
    },

    dialogs: {
      deleteConfirm: 'Delete {count} page(s)?',
      insertPDF: 'Select PDF to insert',
      blankPageFormat: 'Select page format',
    },
  },

  annotate: {
    toolbar: {
      text: 'Text',
      line: 'Line',
      arrow: 'Arrow',
      rectangle: 'Rectangle',
      circle: 'Circle',
      highlight: 'Highlight',
      stamp: 'Stamp',
      freeDraw: 'Free Draw',
    },

    properties: {
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      color: 'Color',
      strokeWidth: 'Stroke Width',
      opacity: 'Opacity',
      position: 'Position',
    },

    stamps: {
      approved: 'APPROVED',
      confidential: 'CONFIDENTIAL',
      draft: 'DRAFT',
      reviewed: 'REVIEWED',
      rejected: 'REJECTED',
    },
  },

  design: {
    watermark: {
      title: 'Watermark',
      enabled: 'Add watermark',
      text: 'Watermark text',
      opacity: 'Opacity',
      angle: 'Angle',
      color: 'Color',
    },

    pageNumbers: {
      title: 'Page Numbers',
      enabled: 'Show page numbers',
      format: 'Format',
      position: 'Position',
      startNumber: 'Start from',
    },

    background: {
      title: 'Background',
      none: 'None',
      color: 'Solid Color',
      gradient: 'Gradient',
      image: 'Image',
    },

    preview: {
      info: 'Changes will be applied when you save the document',
      noDocument: 'Load a document to preview',
      selectedPage: 'Selected page',
      firstPage: 'First page',
    },
  },

  tools: {
    documentInfo: 'Document Information',
    metadata: 'Metadata',
    pages: 'Pages',
    fileSize: 'File Size',
    fileName: 'File Name',
    title: 'Title',
    author: 'Author',
    subject: 'Subject',
    keywords: 'Keywords',
  },

  // AI Assistant
  ai: {
    analyzing: 'Analyzing document...',
    suggestions: '{count} suggestions',
    applyAll: 'Apply All',

    pages: {
      blankPages: {
        title: '{count} blank pages detected',
        description: 'Pages: {pages}',
        reasoning: 'Blank pages increase file size unnecessarily',
        action: 'Remove Blank Pages',
      },

      rotatedPages: {
        title: '{count} pages need rotation',
        description: 'Pages appear sideways',
        action: 'Auto-Rotate',
      },
    },

    design: {
      watermark: {
        title: 'Add watermark recommended',
        reasoning: 'Document contains sensitive information',
      },

      pageNumbers: {
        title: 'Add page numbers',
        reasoning: 'Document has {pages} pages - numbering improves navigation',
      },
    },
  },
};
