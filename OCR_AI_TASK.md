# 📋 Детальное техническое задание для Claude Code: Продвинутый AI OCR

## 🎯 Цель
Создать продвинутую AI-powered OCR систему для LocalPDF, которая выделяется на рынке благодаря интеллектуальному анализу документов, мульти-языковой поддержке и умным рекомендациям по обработке.

---

## 📦 Задачи по файлам

### 1. **Расширить `src/services/ocrService.ts`**

#### Добавить новые функции:

**1.1. Предварительная обработка изображений**
```typescript
interface ImagePreprocessingOptions {
  denoise: boolean;           // Шумоподавление
  deskew: boolean;            // Исправление наклона
  contrast: boolean;          // Улучшение контраста
  binarization: boolean;      // Бинаризация (черно-белое)
  removeBackground: boolean;  // Удаление фона
}

async preprocessImage(
  imageData: ImageData, 
  options: ImagePreprocessingOptions
): Promise<ImageData>
```

**1.2. Анализ качества изображения**
```typescript
interface ImageQualityAnalysis {
  resolution: number;        // DPI
  clarity: number;          // 0-100, четкость
  contrast: number;         // 0-100, контрастность
  skewAngle: number;        // Градусы наклона
  isScanned: boolean;       // Скан или фото
  hasNoise: boolean;        // Наличие шума
  recommendPreprocessing: boolean;
  suggestedOptions: ImagePreprocessingOptions;
}

async analyzeImageQuality(file: File): Promise<ImageQualityAnalysis>
```

**1.3. Мульти-языковое определение**
```typescript
interface LanguageDetectionResult {
  primary: string;           // Основной язык (ISO code)
  secondary?: string[];      // Дополнительные языки
  confidence: number;        // 0-100
  script: string;           // 'latin', 'cyrillic', 'chinese', etc.
  mixedLanguages: boolean;  // Документ на нескольких языках
  recommendedTesseractLangs: string; // 'eng+rus+deu'
}

async detectDocumentLanguages(file: File): Promise<LanguageDetectionResult>
```

**1.4. Структурный анализ документа**
```typescript
interface DocumentStructure {
  hasColumns: boolean;       // Колонки
  hasTables: boolean;        // Таблицы
  hasImages: boolean;        // Изображения
  hasHandwriting: boolean;   // Рукописный текст
  layout: 'single' | 'double' | 'complex';
  textDensity: number;       // 0-100, плотность текста
  averageFontSize: number;   // Средний размер шрифта
}

async analyzeDocumentStructure(file: File): Promise<DocumentStructure>
```

**1.5. Улучшенный OCR с опциями**
```typescript
interface AdvancedOCROptions {
  languages: string[];           // ['eng', 'rus', 'deu']
  mode: 'fast' | 'balanced' | 'accurate';
  preserveLayout: boolean;       // Сохранять форматирование
  outputFormat: 'text' | 'markdown' | 'json' | 'hocr';
  preprocessImage: boolean;
  preprocessOptions?: ImagePreprocessingOptions;
  pageSegmentationMode?: number; // Tesseract PSM
}

async performAdvancedOCR(
  file: File,
  options: AdvancedOCROptions,
  onProgress?: (progress: number) => void
): Promise<OCRResult>

interface OCRResult {
  text: string;
  confidence: number;
  wordCount: number;
  processingTime: number;
  languages: string[];
  structure?: DocumentStructure;
  warnings: string[];
}
```

---

### 2. **Обновить `src/services/smartPDFService.ts`**

#### Добавить метод `analyzePDFForOCR`:

```typescript
interface OCRRecommendations {
  confidence: number;
  recommendedStrategy: string;
  strategies: OCRStrategy[];
  predictions: OCRPredictions;
  warnings: AIWarning[];
  imageQuality: ImageQualityAnalysis;
  languageDetection: LanguageDetectionResult;
  documentStructure: DocumentStructure;
}

interface OCRStrategy {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  settings: AdvancedOCROptions;
  expectedAccuracy: number;    // 0-100
  expectedTime: number;        // секунды
  pros: string[];
  cons: string[];
}

interface OCRPredictions {
  processingTime: number;      // секунды
  accuracy: number;            // 0-100
  wordCount: number;
  requiresPreprocessing: boolean;
  outputSize: string;          // "~50KB"
}

async analyzePDFForOCR(file: File): Promise<OCRRecommendations>
```

**Логика генерации стратегий:**

1. **Fast Mode** (5-15 сек)
   - Базовые настройки Tesseract
   - Без предобработки
   - Один язык
   - Для простых документов с хорошим качеством

2. **Balanced Mode** (20-40 сек)
   - Средние настройки точности
   - Легкая предобработка (contrast + denoise)
   - До 2 языков
   - Универсальный режим

3. **High Accuracy Mode** (60-120 сек)
   - Максимальная точность Tesseract
   - Полная предобработка всех параметров
   - До 3 языков
   - Сохранение layout
   - Для сложных/некачественных документов

4. **Multi-Language Mode** (40-80 сек)
   - Определенные языки из анализа
   - Средняя предобработка
   - Специально для multilingual документов

**Условия выбора recommendedStrategy:**
- `imageQuality.clarity < 50` → High Accuracy
- `languageDetection.mixedLanguages` → Multi-Language
- `imageQuality.clarity > 80 && !documentStructure.hasColumns` → Fast
- По умолчанию → Balanced

---

### 3. **Создать `src/components/molecules/SmartOCRRecommendations.tsx`**

#### Структура компонента:

```typescript
interface SmartOCRRecommendationsProps {
  file: File;
  onApplyStrategy?: (strategy: OCRStrategy) => void;
  isProcessing?: boolean;
  className?: string;
}

const SmartOCRRecommendations: React.FC<Props> = ({...}) => {
  const [recommendations, setRecommendations] = useState<OCRRecommendations | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const { t } = useI18n();

  // Анализ при загрузке файла
  useEffect(() => {
    runAnalysis();
  }, [file]);

  // Компоненты UI
  return (
    <div className="smart-ocr-recommendations glass-card">
      {/* Header with confidence */}
      <AIConfidenceBadge confidence={recommendations.confidence} />

      {/* Image Quality Analysis */}
      <ImageQualityCard quality={recommendations.imageQuality} />

      {/* Language Detection */}
      <LanguageDetectionCard detection={recommendations.languageDetection} />

      {/* Document Structure */}
      <DocumentStructureCard structure={recommendations.documentStructure} />

      {/* Quick Predictions */}
      <PredictionsGrid predictions={recommendations.predictions} />

      {/* OCR Strategies */}
      {recommendations.strategies.map(strategy => (
        <StrategyCard
          key={strategy.id}
          strategy={strategy}
          isRecommended={strategy.id === recommendations.recommendedStrategy}
          isExpanded={expandedStrategy === strategy.id}
          onToggle={() => setExpandedStrategy(strategy.id)}
          onApply={() => onApplyStrategy?.(strategy)}
        />
      ))}

      {/* Warnings */}
      {recommendations.warnings.length > 0 && (
        <WarningsSection warnings={recommendations.warnings} />
      )}
    </div>
  );
};
```

#### UI подкомпоненты:

**ImageQualityCard:**
```typescript
- Resolution indicator (DPI)
- Clarity meter (0-100)
- Contrast meter (0-100)
- Skew angle indicator
- Type badge (Scan/Photo)
- Noise indicator
- Preprocessing recommendations
```

**LanguageDetectionCard:**
```typescript
- Primary language with confidence
- Secondary languages list
- Script type badge
- Mixed languages indicator
- Recommended Tesseract languages string
```

**DocumentStructureCard:**
```typescript
- Layout type badge (single/double/complex)
- Columns indicator
- Tables detected
- Images detected
- Handwriting detected
- Text density meter
- Average font size
```

**PredictionsGrid:**
```typescript
- Processing time estimate
- Accuracy prediction (0-100%)
- Word count estimate
- Output size estimate
- Preprocessing required badge
```

**StrategyCard:**
```typescript
- Strategy name + description
- Recommended badge (if recommendedStrategy)
- Expected accuracy meter
- Expected time
- Pros/Cons lists
- Settings preview (collapsible)
- Apply button
```

---

Продолжение следует...