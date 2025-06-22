// Types for jsPDF autoTable plugin
export interface AutoTableOptions {
  head?: any[][];
  body?: any[][];
  startY?: number;
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  styles?: {
    fontSize?: number;
    cellPadding?: number;
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  };
  headStyles?: {
    fillColor?: number[] | string;
    textColor?: number[] | string;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
  };
  bodyStyles?: {
    fillColor?: number[] | string;
    textColor?: number[] | string;
  };
  alternateRowStyles?: {
    fillColor?: number[] | string;
  };
  tableLineColor?: number[] | string;
  tableLineWidth?: number;
  showHead?: boolean;
  showFoot?: boolean;
  didDrawPage?: (data: any) => void;
}

// Extend jsPDF module
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

export {};
