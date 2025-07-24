// Type definitions for mammoth.js library
declare module 'mammoth' {
  interface ConvertToHtmlOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
    styleMap?: string[];
    includeDefaultStyleMap?: boolean;
    includeEmbeddedStyleMap?: boolean;
    transformDocument?: (element: any) => any;
    ignoreEmptyParagraphs?: boolean;
  }

  interface ConvertToMarkdownOptions extends ConvertToHtmlOptions {
    // Additional options specific to markdown conversion
  }

  interface ExtractRawTextOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }

  interface ConversionResult {
    value: string;
    messages: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
    }>;
  }

  interface EmbeddedStyleMap {
    [key: string]: string;
  }

  export function convertToHtml(options: ConvertToHtmlOptions): Promise<ConversionResult>;
  export function convertToMarkdown(options: ConvertToMarkdownOptions): Promise<ConversionResult>;
  export function extractRawText(options: ExtractRawTextOptions): Promise<ConversionResult>;
  export function embedStyleMap(docx: ArrayBuffer): Promise<EmbeddedStyleMap>;
}
