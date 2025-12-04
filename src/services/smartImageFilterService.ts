/**
 * Smart Image Filter Service
 * AI-powered image categorization for intelligent filtering
 */

import type { ExtractedImage } from '@/types/pdf';

export type ImageCategory = 'photo' | 'icon' | 'logo' | 'chart' | 'decoration' | 'other';

export interface CategorizedImage extends ExtractedImage {
  category: ImageCategory;
  confidence: number;
  aspectRatio: number;
  megapixels: number;
  isLikelyUseful: boolean;
}

export interface ImageCategoryGroup {
  category: ImageCategory;
  label: string;
  icon: string;
  images: CategorizedImage[];
  count: number;
}

export interface SmartImageFilterAnalysis {
  totalImages: number;
  categories: ImageCategoryGroup[];
  usefulImages: CategorizedImage[];
  likelyJunk: CategorizedImage[];
  analysisTime: number;
}

const THRESHOLDS = {
  ICON_MAX_SIZE: 128,
  LOGO_MAX_WIDTH: 400,
  LOGO_MAX_HEIGHT: 200,
  PHOTO_MIN_SIZE: 200,
  CHART_MIN_SIZE: 300,
  ICON_MAX_MEGAPIXELS: 0.02,
  PHOTO_MIN_MEGAPIXELS: 0.05,
  CHART_MIN_MEGAPIXELS: 0.1,
  SQUARE_ASPECT_MIN: 0.9,
  SQUARE_ASPECT_MAX: 1.1,
  LOGO_ASPECT_MIN: 2,
  BANNER_ASPECT_MIN: 3,
  ICON_MAX_SIZE_BYTES: 50 * 1024,
  PHOTO_MIN_SIZE_BYTES: 100 * 1024,
};

class SmartImageFilterService {
  private static instance: SmartImageFilterService;

  static getInstance(): SmartImageFilterService {
    if (!this.instance) {
      this.instance = new SmartImageFilterService();
    }
    return this.instance;
  }

  analyzeImages(images: ExtractedImage[]): SmartImageFilterAnalysis {
    const startTime = performance.now();
    const categorizedImages = images.map(img => this.categorizeImage(img));

    const categoryMap = new Map<ImageCategory, CategorizedImage[]>();
    categorizedImages.forEach(img => {
      if (!categoryMap.has(img.category)) {
        categoryMap.set(img.category, []);
      }
      categoryMap.get(img.category)!.push(img);
    });

    const categories: ImageCategoryGroup[] = [];
    const categoryLabels: Record<ImageCategory, { label: string; icon: string }> = {
      photo: { label: 'Photos', icon: '📷' },
      chart: { label: 'Charts & Graphs', icon: '📊' },
      logo: { label: 'Logos', icon: '🏢' },
      icon: { label: 'Icons & Buttons', icon: '🔘' },
      decoration: { label: 'Decorations', icon: '✨' },
      other: { label: 'Other', icon: '🖼️' },
    };

    (['photo', 'chart', 'logo', 'icon', 'decoration', 'other'] as ImageCategory[]).forEach(category => {
      const imgs = categoryMap.get(category) || [];
      if (imgs.length > 0) {
        categories.push({
          category,
          label: categoryLabels[category].label,
          icon: categoryLabels[category].icon,
          images: imgs,
          count: imgs.length,
        });
      }
    });

    const usefulImages = categorizedImages.filter(img => img.isLikelyUseful);
    const likelyJunk = categorizedImages.filter(img => !img.isLikelyUseful);

    return {
      totalImages: images.length,
      categories,
      usefulImages,
      likelyJunk,
      analysisTime: performance.now() - startTime,
    };
  }

  private categorizeImage(image: ExtractedImage): CategorizedImage {
    const { width, height, size } = image;
    const aspectRatio = width / height;
    const megapixels = (width * height) / 1_000_000;
    const maxDimension = Math.max(width, height);
    const minDimension = Math.min(width, height);

    let category: ImageCategory = 'other';
    let confidence = 0.5;

    if (
      maxDimension <= THRESHOLDS.ICON_MAX_SIZE &&
      megapixels <= THRESHOLDS.ICON_MAX_MEGAPIXELS &&
      aspectRatio >= THRESHOLDS.SQUARE_ASPECT_MIN &&
      aspectRatio <= THRESHOLDS.SQUARE_ASPECT_MAX
    ) {
      category = 'icon';
      confidence = 0.9;
    } else if (
      maxDimension <= THRESHOLDS.ICON_MAX_SIZE &&
      size <= THRESHOLDS.ICON_MAX_SIZE_BYTES
    ) {
      category = 'decoration';
      confidence = 0.85;
    } else if (aspectRatio >= THRESHOLDS.BANNER_ASPECT_MIN) {
      category = 'decoration';
      confidence = 0.8;
    } else if (
      aspectRatio >= THRESHOLDS.LOGO_ASPECT_MIN &&
      width <= THRESHOLDS.LOGO_MAX_WIDTH &&
      height <= THRESHOLDS.LOGO_MAX_HEIGHT
    ) {
      category = 'logo';
      confidence = 0.75;
    } else if (megapixels >= THRESHOLDS.PHOTO_MIN_MEGAPIXELS) {
      // Prioritize photos over charts for better detection
      if (size >= THRESHOLDS.PHOTO_MIN_SIZE_BYTES && image.format === 'jpg') {
        // JPG files with good size are likely photos
        category = 'photo';
        confidence = 0.85;
      } else if (
        megapixels >= THRESHOLDS.CHART_MIN_MEGAPIXELS &&
        image.format === 'png' &&
        minDimension >= THRESHOLDS.CHART_MIN_SIZE &&
        size < THRESHOLDS.PHOTO_MIN_SIZE_BYTES // Charts are usually smaller
      ) {
        category = 'chart';
        confidence = 0.7;
      } else if (size >= THRESHOLDS.PHOTO_MIN_SIZE_BYTES / 2) {
        // Large enough to be a photo
        category = 'photo';
        confidence = 0.75;
      } else {
        category = 'other';
        confidence = 0.6;
      }
    } else if (
      aspectRatio >= THRESHOLDS.SQUARE_ASPECT_MIN &&
      aspectRatio <= THRESHOLDS.SQUARE_ASPECT_MAX &&
      minDimension >= THRESHOLDS.PHOTO_MIN_SIZE
    ) {
      category = 'logo';
      confidence = 0.65;
    } else if (minDimension >= THRESHOLDS.PHOTO_MIN_SIZE) {
      category = 'other';
      confidence = 0.5;
    } else {
      category = 'decoration';
      confidence = 0.6;
    }

    const isLikelyUseful = category === 'photo' || category === 'chart';

    return {
      ...image,
      category,
      confidence,
      aspectRatio,
      megapixels,
      isLikelyUseful,
    };
  }

  getFilterPresets() {
    return [
      {
        id: 'photos-only',
        label: 'Photos Only',
        icon: '📷',
        description: 'Select only high-quality photos',
        filter: (img: CategorizedImage) => img.category === 'photo',
      },
      {
        id: 'useful',
        label: 'Useful Images',
        icon: '⭐',
        description: 'Photos and charts (excluding icons/decorations)',
        filter: (img: CategorizedImage) => img.isLikelyUseful,
      },
      {
        id: 'large',
        label: 'Large Images',
        icon: '🖼️',
        description: 'Images larger than 0.1 megapixels',
        filter: (img: CategorizedImage) => img.megapixels >= 0.1,
      },
      {
        id: 'charts',
        label: 'Charts & Graphs',
        icon: '📊',
        description: 'Select charts and diagrams',
        filter: (img: CategorizedImage) => img.category === 'chart',
      },
      {
        id: 'exclude-icons',
        label: 'No Icons',
        icon: '🚫',
        description: 'Exclude small icons and buttons',
        filter: (img: CategorizedImage) => img.category !== 'icon' && img.category !== 'decoration',
      },
    ];
  }
}

export const smartImageFilterService = SmartImageFilterService.getInstance();
export default smartImageFilterService;
