import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, Settings, Eye, Download, Globe, Sparkles, 
  Type, Palette, Edit3, Zap, Shield, AlertTriangle, Loader,
  ZoomIn, ZoomOut, RotateCcw, Save, Upload, RefreshCw
} from 'lucide-react';

// Импорты существующих сервисов
import { detectLanguage, getOptimalPDFSettings, type LanguageInfo } from '../../services/elegantLanguageDetection';
import { getOptimizedFontSettings, sanitizeTextForPDF } from '../../services/reliableFontSolution';
import { EnhancedUnicodeFontService } from '../../services/EnhancedUnicodeFontService';

// Типы для интерактивного редактора
interface EditableCSVData {
  headers: string[];
  rows: string[][];
  metadata: {
    rowCount: number;
    columnCount: number;
    title?: string;
    language?: LanguageInfo;
  };
}

interface PDFPreviewState {
  isGenerating: boolean;
  pdfUrl: string | null;
  error: string | null;
  warnings: string[];
  lastGenerated: Date | null;
  zoom: number;
  currentPage: number;
  totalPages: number;
}

interface StyleOptions {
  theme: 'clean' | 'modern' | 'minimal' | 'professional' | 'colorful';
  fontSize: number;
  fontFamily: string;
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'a3' | 'letter' | 'legal';
  colors: {
    header: string;
    text: string;
    border: string;
    background: string;
  };
  spacing: {
    cellPadding: number;
    lineHeight: number;
    margins: number;
  };
}

interface EditorMode {
  activeTab: 'data' | 'style' | 'preview' | 'export';
  splitView: boolean;
  previewSize: 'small' | 'medium' | 'large';
}

interface Props {
  initialData: EditableCSVData;
  onDataChange?: (data: EditableCSVData) => void;
  onExport?: (blob: Blob, filename: string) => void;
  className?: string;
}

// 🎨 Предустановленные темы с расширенной палитрой
const THEMES = {
  clean: {
    name: 'Clean Professional',
    colors: { header: '#f8fafc', text: '#1e293b', border: '#e2e8f0', background: '#ffffff' },
    emoji: '✨'
  },
  modern: {
    name: 'Modern Blue',
    colors: { header: '#1e40af', text: '#ffffff', border: '#3b82f6', background: '#f9fafb' },
    emoji: '🚀'
  },
  minimal: {
    name: 'Minimal Gray',
    colors: { header: '#ffffff', text: '#374151', border: '#d1d5db', background: '#ffffff' },
    emoji: '🎯'
  },
  professional: {
    name: 'Corporate',
    colors: { header: '#065f46', text: '#ffffff', border: '#059669', background: '#f0fdf4' },
    emoji: '💼'
  },
  colorful: {
    name: 'Vibrant',
    colors: { header: '#7c3aed', text: '#ffffff', border: '#a855f7', background: '#faf5ff' },
    emoji: '🌈'
  }
} as const;

// 🌍 Расширенные языковые конфигурации
const LANGUAGE_CONFIGS = {
  'ru': { name: 'Русский', script: 'cyrillic', direction: 'ltr', emoji: '🇷🇺' },
  'lv': { name: 'Latviešu', script: 'latin-extended', direction: 'ltr', emoji: '🇱🇻' },
  'lt': { name: 'Lietuvių', script: 'latin-extended', direction: 'ltr', emoji: '🇱🇹' },
  'et': { name: 'Eesti', script: 'latin-extended', direction: 'ltr', emoji: '🇪🇪' },
  'pl': { name: 'Polski', script: 'latin-extended', direction: 'ltr', emoji: '🇵🇱' },
  'de': { name: 'Deutsch', script: 'latin', direction: 'ltr', emoji: '🇩🇪' },
  'fr': { name: 'Français', script: 'latin', direction: 'ltr', emoji: '🇫🇷' },
  'es': { name: 'Español', script: 'latin', direction: 'ltr', emoji: '🇪🇸' },
  'it': { name: 'Italiano', script: 'latin', direction: 'ltr', emoji: '🇮🇹' },
  'zh': { name: '中文', script: 'cjk', direction: 'ltr', emoji: '🇨🇳' },
  'ja': { name: '日本語', script: 'cjk', direction: 'ltr', emoji: '🇯🇵' },
  'ko': { name: '한국어', script: 'cjk', direction: 'ltr', emoji: '🇰🇷' },
  'ar': { name: 'العربية', script: 'arabic', direction: 'rtl', emoji: '🇸🇦' },
  'hi': { name: 'हिन्दी', script: 'devanagari', direction: 'ltr', emoji: '🇮🇳' },
  'en': { name: 'English', script: 'latin', direction