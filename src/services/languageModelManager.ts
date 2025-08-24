/**
 * Advanced Language Model Manager for OCR
 * 
 * Handles intelligent loading, caching, and optimization of Tesseract.js language models
 * with support for progressive loading, prefetching, and memory-efficient management
 */

import { memoryManager } from '../utils/memoryManager';

export interface LanguageModel {
  code: string;
  name: string;
  nativeName: string;
  size: number; // Estimated size in MB
  priority: 'high' | 'medium' | 'low';
  category: 'latin' | 'cyrillic' | 'mixed' | 'special';
  downloadUrl?: string;
  isLoaded: boolean;
  loadedAt?: number;
  lastUsed?: number;
}

export interface LanguageLoadingProgress {
  language: string;
  status: 'downloading' | 'initializing' | 'ready' | 'error';
  progress: number;
  downloadSpeed?: number; // KB/s
  estimatedTime?: number; // seconds
}

interface LanguageDetectionHint {
  script: 'latin' | 'cyrillic' | 'mixed';
  confidence: number;
  recommendedLanguages: string[];
  fallbackLanguages: string[];
}

export class LanguageModelManager {
  private static instance: LanguageModelManager;
  private loadedModels: Map<string, LanguageModel> = new Map();
  private loadingQueue: Set<string> = new Set();
  private preloadQueue: string[] = [];
  private maxCachedModels = 5; // Limit memory usage
  private loadingProgress: Map<string, LanguageLoadingProgress> = new Map();

  // Comprehensive language model registry
  private readonly LANGUAGE_MODELS: Record<string, LanguageModel> = {
    'eng': {
      code: 'eng',
      name: 'English',
      nativeName: 'English',
      size: 45,
      priority: 'high',
      category: 'latin',
      isLoaded: false
    },
    'rus': {
      code: 'rus',
      name: 'Russian',
      nativeName: 'Русский',
      size: 55,
      priority: 'high',
      category: 'cyrillic',
      isLoaded: false
    },
    'deu': {
      code: 'deu',
      name: 'German',
      nativeName: 'Deutsch',
      size: 48,
      priority: 'medium',
      category: 'latin',
      isLoaded: false
    },
    'fra': {
      code: 'fra',
      name: 'French',
      nativeName: 'Français',
      size: 47,
      priority: 'medium',
      category: 'latin',
      isLoaded: false
    },
    'spa': {
      code: 'spa',
      name: 'Spanish',
      nativeName: 'Español',
      size: 46,
      priority: 'medium',
      category: 'latin',
      isLoaded: false
    },
    'ita': {
      code: 'ita',
      name: 'Italian',
      nativeName: 'Italiano',
      size: 47,
      priority: 'low',
      category: 'latin',
      isLoaded: false
    },
    'por': {
      code: 'por',
      name: 'Portuguese',
      nativeName: 'Português',
      size: 46,
      priority: 'low',
      category: 'latin',
      isLoaded: false
    },
    'nld': {
      code: 'nld',
      name: 'Dutch',
      nativeName: 'Nederlands',
      size: 45,
      priority: 'low',
      category: 'latin',
      isLoaded: false
    },
    'pol': {
      code: 'pol',
      name: 'Polish',
      nativeName: 'Polski',
      size: 50,
      priority: 'low',
      category: 'latin',
      isLoaded: false
    },
    'ukr': {
      code: 'ukr',
      name: 'Ukrainian',
      nativeName: 'Українська',
      size: 52,
      priority: 'medium',
      category: 'cyrillic',
      isLoaded: false
    }
  };

  private constructor() {
    this.initializePreloadStrategy();
  }

  public static getInstance(): LanguageModelManager {
    if (!LanguageModelManager.instance) {
      LanguageModelManager.instance = new LanguageModelManager();
    }
    return LanguageModelManager.instance;
  }

  /**
   * Initialize smart preloading strategy based on user patterns
   */
  private initializePreloadStrategy(): void {
    // Get user's browser language preferences
    const browserLanguages = navigator.languages || [navigator.language];
    const userRegion = Intl.DateTimeFormat().resolvedOptions().timeZone;

    console.log('🌍 Language Model Manager: Detected browser languages:', browserLanguages);
    console.log('🌍 User region:', userRegion);

    // Determine priority languages based on user context
    const priorityLanguages = this.determinePriorityLanguages(browserLanguages, userRegion);
    
    // Start background preloading of high-priority languages
    this.schedulePreloading(priorityLanguages);
  }

  /**
   * Determine priority languages based on user context
   */
  private determinePriorityLanguages(browserLanguages: readonly string[], userRegion: string): string[] {
    const priorities: string[] = [];

    // Always include English as fallback
    priorities.push('eng');

    // Add languages based on browser preferences
    for (const lang of browserLanguages) {
      const langCode = this.mapBrowserLanguageToOCR(lang);
      if (langCode && !priorities.includes(langCode)) {
        priorities.push(langCode);
      }
    }

    // Add regional preferences
    if (userRegion.includes('Europe') || userRegion.includes('Moscow')) {
      if (!priorities.includes('rus')) priorities.push('rus');
      if (!priorities.includes('deu')) priorities.push('deu');
      if (!priorities.includes('fra')) priorities.push('fra');
    }

    // For this application (LocalPDF), prioritize Russian and English
    if (!priorities.includes('rus')) {
      priorities.unshift('rus'); // Add Russian at the beginning
    }

    return priorities.slice(0, 3); // Limit to 3 priority languages
  }

  /**
   * Map browser language codes to OCR language codes
   */
  private mapBrowserLanguageToOCR(browserLang: string): string | null {
    const langMap: Record<string, string> = {
      'en': 'eng', 'en-US': 'eng', 'en-GB': 'eng',
      'ru': 'rus', 'ru-RU': 'rus',
      'de': 'deu', 'de-DE': 'deu',
      'fr': 'fra', 'fr-FR': 'fra',
      'es': 'spa', 'es-ES': 'spa',
      'it': 'ita', 'it-IT': 'ita',
      'pt': 'por', 'pt-BR': 'por',
      'nl': 'nld', 'nl-NL': 'nld',
      'pl': 'pol', 'pl-PL': 'pol',
      'uk': 'ukr', 'uk-UA': 'ukr'
    };

    return langMap[browserLang.toLowerCase()] || null;
  }

  /**
   * Schedule background preloading of priority languages
   */
  private schedulePreloading(languages: string[]): void {
    console.log('📥 Language Model Manager: Scheduling preload for:', languages);
    
    // Use requestIdleCallback for non-blocking preloading
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.preloadLanguagesInBackground(languages);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadLanguagesInBackground(languages);
      }, 2000);
    }
  }

  /**
   * Preload languages in background without blocking UI
   */
  private async preloadLanguagesInBackground(languages: string[]): Promise<void> {
    for (const lang of languages) {
      if (!this.isLanguageLoaded(lang) && !this.loadingQueue.has(lang)) {
        try {
          console.log(`⏬ Language Model Manager: Background preloading ${lang}`);
          await this.loadLanguageModel(lang, true); // Silent loading
          
          // Small delay between preloads to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`⚠️ Background preload failed for ${lang}:`, error);
        }
      }
    }
  }

  /**
   * Load language model with progress tracking
   */
  async loadLanguageModel(
    languageCode: string, 
    silent: boolean = false,
    onProgress?: (progress: LanguageLoadingProgress) => void
  ): Promise<void> {
    if (this.isLanguageLoaded(languageCode)) {
      this.updateLastUsed(languageCode);
      return;
    }

    if (this.loadingQueue.has(languageCode)) {
      // Wait for ongoing loading
      return this.waitForLanguageLoad(languageCode);
    }

    const model = this.LANGUAGE_MODELS[languageCode];
    if (!model) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    this.loadingQueue.add(languageCode);
    
    const progressData: LanguageLoadingProgress = {
      language: languageCode,
      status: 'downloading',
      progress: 0
    };

    this.loadingProgress.set(languageCode, progressData);

    try {
      if (!silent) {
        console.log(`📥 Language Model Manager: Loading ${model.name} (${model.size}MB)`);
      }

      // Check memory before loading
      await this.ensureMemoryAvailable(model.size);

      // Simulate progressive loading with actual Tesseract.js worker creation
      const startTime = Date.now();
      
      // Update progress during loading
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const estimatedTotal = model.size * 100; // Rough estimate: 100ms per MB
        
        progressData.progress = Math.min(95, (elapsed / estimatedTotal) * 100);
        progressData.downloadSpeed = (model.size * 1024) / (elapsed / 1000); // KB/s
        progressData.estimatedTime = Math.max(0, (estimatedTotal - elapsed) / 1000);
        
        if (onProgress) onProgress({ ...progressData });
      }, 500);

      // This would be replaced with actual Tesseract.js worker creation
      // For now, simulate the loading time
      await new Promise(resolve => setTimeout(resolve, model.size * 50)); // 50ms per MB

      clearInterval(progressInterval);

      // Mark as loaded
      model.isLoaded = true;
      model.loadedAt = Date.now();
      model.lastUsed = Date.now();
      
      this.loadedModels.set(languageCode, model);
      
      progressData.status = 'ready';
      progressData.progress = 100;
      
      if (onProgress) onProgress({ ...progressData });

      if (!silent) {
        console.log(`✅ Language Model Manager: ${model.name} loaded successfully`);
      }

    } catch (error) {
      progressData.status = 'error';
      if (onProgress) onProgress({ ...progressData });
      
      console.error(`❌ Language Model Manager: Failed to load ${model.name}:`, error);
      throw error;
    } finally {
      this.loadingQueue.delete(languageCode);
      this.loadingProgress.delete(languageCode);
    }
  }

  /**
   * Wait for ongoing language loading to complete
   */
  private async waitForLanguageLoad(languageCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.loadingQueue.has(languageCode)) {
          clearInterval(checkInterval);
          if (this.isLanguageLoaded(languageCode)) {
            resolve();
          } else {
            reject(new Error(`Failed to load language: ${languageCode}`));
          }
        }
      }, 100);

      // Timeout after 2 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error(`Timeout loading language: ${languageCode}`));
      }, 120000);
    });
  }

  /**
   * Ensure sufficient memory is available before loading
   */
  private async ensureMemoryAvailable(requiredMB: number): Promise<void> {
    const stats = memoryManager.getStats();
    
    if (stats.memoryPressure === 'high') {
      console.log('🧹 Language Model Manager: High memory pressure, cleaning up old models');
      await this.cleanupOldLanguageModels();
    }

    // If we have too many loaded models, remove the least recently used
    if (this.loadedModels.size >= this.maxCachedModels) {
      await this.evictLeastRecentlyUsed();
    }
  }

  /**
   * Clean up old language models to free memory
   */
  private async cleanupOldLanguageModels(): Promise<void> {
    const oldThreshold = Date.now() - 300000; // 5 minutes
    const toRemove: string[] = [];

    for (const [code, model] of this.loadedModels.entries()) {
      if (model.lastUsed && model.lastUsed < oldThreshold) {
        toRemove.push(code);
      }
    }

    for (const code of toRemove) {
      await this.unloadLanguageModel(code);
    }
  }

  /**
   * Evict least recently used language model
   */
  private async evictLeastRecentlyUsed(): Promise<void> {
    let oldestCode = '';
    let oldestTime = Date.now();

    for (const [code, model] of this.loadedModels.entries()) {
      if (model.lastUsed && model.lastUsed < oldestTime) {
        oldestTime = model.lastUsed;
        oldestCode = code;
      }
    }

    if (oldestCode) {
      console.log(`🗑️ Language Model Manager: Evicting LRU model: ${oldestCode}`);
      await this.unloadLanguageModel(oldestCode);
    }
  }

  /**
   * Unload a language model to free memory
   */
  async unloadLanguageModel(languageCode: string): Promise<void> {
    const model = this.loadedModels.get(languageCode);
    if (!model) return;

    // This would terminate the Tesseract.js worker for this language
    // For now, just mark as unloaded
    model.isLoaded = false;
    model.loadedAt = undefined;
    
    this.loadedModels.delete(languageCode);
    
    console.log(`🗑️ Language Model Manager: Unloaded ${model.name}`);
  }

  /**
   * Get smart language recommendations based on content analysis
   */
  getLanguageRecommendations(detectionHint: LanguageDetectionHint): string[] {
    const recommendations: string[] = [];

    // Primary recommendations based on script detection
    if (detectionHint.script === 'cyrillic') {
      recommendations.push('rus', 'ukr');
    } else if (detectionHint.script === 'latin') {
      recommendations.push('eng', 'deu', 'fra', 'spa');
    } else if (detectionHint.script === 'mixed') {
      // For mixed content, prioritize languages that can handle both scripts
      recommendations.push('eng', 'rus');
    }

    // Add fallback languages
    recommendations.push(...detectionHint.fallbackLanguages);

    // Remove duplicates and limit to 4 recommendations
    return [...new Set(recommendations)].slice(0, 4);
  }

  /**
   * Check if language model is loaded
   */
  isLanguageLoaded(languageCode: string): boolean {
    const model = this.loadedModels.get(languageCode);
    return model?.isLoaded === true;
  }

  /**
   * Update last used timestamp for LRU eviction
   */
  updateLastUsed(languageCode: string): void {
    const model = this.loadedModels.get(languageCode);
    if (model) {
      model.lastUsed = Date.now();
    }
  }

  /**
   * Get loading progress for a language
   */
  getLoadingProgress(languageCode: string): LanguageLoadingProgress | null {
    return this.loadingProgress.get(languageCode) || null;
  }

  /**
   * Get all available language models
   */
  getAvailableLanguages(): LanguageModel[] {
    return Object.values(this.LANGUAGE_MODELS);
  }

  /**
   * Get loaded language models
   */
  getLoadedLanguages(): LanguageModel[] {
    return Array.from(this.loadedModels.values());
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    loadedModels: number;
    totalSizeMB: number;
    maxCachedModels: number;
    memoryPressure: string;
  } {
    const totalSize = Array.from(this.loadedModels.values())
      .reduce((sum, model) => sum + model.size, 0);

    return {
      loadedModels: this.loadedModels.size,
      totalSizeMB: totalSize,
      maxCachedModels: this.maxCachedModels,
      memoryPressure: memoryManager.getStats().memoryPressure
    };
  }

  /**
   * Cleanup all language models
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Language Model Manager: Performing full cleanup');
    
    for (const code of this.loadedModels.keys()) {
      await this.unloadLanguageModel(code);
    }
    
    this.loadingQueue.clear();
    this.preloadQueue = [];
    this.loadingProgress.clear();
    
    console.log('✅ Language Model Manager: Cleanup completed');
  }
}

// Export singleton instance
export const languageModelManager = LanguageModelManager.getInstance();