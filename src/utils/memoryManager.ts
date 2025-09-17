/**
 * Memory Management Utility for OCR Processing
 * 
 * Handles cleanup of canvas elements, blob URLs, and other memory-intensive resources
 * to prevent memory leaks during OCR operations
 */

interface MemoryResource {
  id: string;
  type: 'canvas' | 'blob-url' | 'worker' | 'image-data';
  resource: any;
  created: number;
  lastAccessed: number;
  size?: number;
}

interface MemoryStats {
  totalResources: number;
  totalEstimatedSize: number;
  resourcesByType: Record<string, number>;
  oldestResource: number;
  memoryPressure: 'low' | 'medium' | 'high';
}

class MemoryManager {
  private static instance: MemoryManager;
  private resources: Map<string, MemoryResource> = new Map();
  private maxRetentionTime = 300000; // 5 minutes
  private maxTotalResources = 100;
  private cleanupInterval: number | null = null;

  private constructor() {
    this.startCleanupTimer();
    
    // Listen for memory pressure events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanup());
      
      // Listen for memory pressure if available
      if ('memory' in performance) {
        setInterval(() => this.checkMemoryPressure(), 30000); // Every 30 seconds
      }
    }
  }

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register a canvas element for memory management
   */
  registerCanvas(canvas: HTMLCanvasElement, id?: string): string {
    const resourceId = id || this.generateId('canvas');
    const size = canvas.width * canvas.height * 4; // RGBA bytes
    
    this.resources.set(resourceId, {
      id: resourceId,
      type: 'canvas',
      resource: canvas,
      created: Date.now(),
      lastAccessed: Date.now(),
      size
    });

    console.log(`🎨 Memory: Registered canvas ${resourceId} (${this.formatBytes(size)})`);
    this.checkForCleanup();
    return resourceId;
  }

  /**
   * Register a Tesseract.js worker for memory management
   */
  registerWorker(worker: any, language: string, id?: string): string {
    const resourceId = id || this.generateId('worker');
    
    this.resources.set(resourceId, {
      id: resourceId,
      type: 'worker',
      resource: { worker, language },
      created: Date.now(),
      lastAccessed: Date.now(),
      size: 50 * 1024 * 1024 // Estimate 50MB for language model
    });

    console.log(`⚙️ Memory: Registered OCR worker ${resourceId} (${language})`);
    this.checkForCleanup();
    return resourceId;
  }

  /**
   * OCR-specific memory optimization: Clean up canvas after OCR processing
   */
  async processCanvasWithCleanup<T>(
    canvas: HTMLCanvasElement,
    processor: (canvas: HTMLCanvasElement) => Promise<T>
  ): Promise<T> {
    const canvasId = this.registerCanvas(canvas);
    
    try {
      const result = await processor(canvas);
      return result;
    } finally {
      // Immediate cleanup after processing
      this.releaseResource(canvasId);
      
      // Force canvas dimensions to 0 to free GPU memory
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  /**
   * Batch process with automatic memory management
   */
  async batchProcessWithMemoryControl<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    batchSize: number = 3
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((item, batchIndex) => processor(item, i + batchIndex))
      );
      
      results.push(...batchResults);
      
      // Force cleanup between batches
      if (i + batchSize < items.length) {
        this.cleanupOldResources();
        
        // Force garbage collection if available
        if (typeof window !== 'undefined' && 'gc' in window) {
          (window as any).gc();
        }
        
        // Brief pause to allow memory cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Register a blob URL for memory management
   */
  registerBlobUrl(url: string, id?: string): string {
    const resourceId = id || this.generateId('blob');
    
    this.resources.set(resourceId, {
      id: resourceId,
      type: 'blob-url',
      resource: url,
      created: Date.now(),
      lastAccessed: Date.now()
    });

    console.log(`🔗 Memory: Registered blob URL ${resourceId}`);
    this.checkForCleanup();
    return resourceId;
  }

  /**
   * Register image data for memory management
   */
  registerImageData(imageData: ImageData, id?: string): string {
    const resourceId = id || this.generateId('imagedata');
    const size = imageData.width * imageData.height * 4; // RGBA bytes
    
    this.resources.set(resourceId, {
      id: resourceId,
      type: 'image-data',
      resource: imageData,
      created: Date.now(),
      lastAccessed: Date.now(),
      size
    });

    console.log(`📊 Memory: Registered image data ${resourceId} (${this.formatBytes(size)})`);
    this.checkForCleanup();
    return resourceId;
  }

  /**
   * Access a resource (updates last accessed time)
   */
  accessResource(resourceId: string): any {
    const resource = this.resources.get(resourceId);
    if (resource) {
      resource.lastAccessed = Date.now();
      return resource.resource;
    }
    return null;
  }

  /**
   * Manually release a specific resource
   */
  releaseResource(resourceId: string): boolean {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      return false;
    }

    this.cleanupResource(resource);
    this.resources.delete(resourceId);
    
    console.log(`🗑️ Memory: Released resource ${resourceId}`);
    return true;
  }

  /**
   * Release all resources of a specific type
   */
  releaseResourcesByType(type: MemoryResource['type']): number {
    let released = 0;
    
    for (const [id, resource] of this.resources.entries()) {
      if (resource.type === type) {
        this.cleanupResource(resource);
        this.resources.delete(id);
        released++;
      }
    }

    if (released > 0) {
      console.log(`🗑️ Memory: Released ${released} resources of type ${type}`);
    }
    
    return released;
  }

  /**
   * Clean up old resources automatically
   */
  private cleanupOldResources(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, resource] of this.resources.entries()) {
      const age = now - resource.lastAccessed;
      
      if (age > this.maxRetentionTime) {
        this.cleanupResource(resource);
        toDelete.push(id);
      }
    }

    toDelete.forEach(id => this.resources.delete(id));
    
    if (toDelete.length > 0) {
      console.log(`🧹 Memory: Auto-cleaned ${toDelete.length} old resources`);
    }
  }

  /**
   * Clean up a specific resource
   */
  private cleanupResource(resource: MemoryResource): void {
    try {
      switch (resource.type) {
        case 'canvas':
          const canvas = resource.resource as HTMLCanvasElement;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          canvas.width = 0;
          canvas.height = 0;
          break;

        case 'blob-url':
          URL.revokeObjectURL(resource.resource as string);
          break;

        case 'image-data':
          // ImageData doesn't need explicit cleanup, just remove reference
          resource.resource = null;
          break;
      }
    } catch (error) {
      console.warn(`⚠️ Memory: Failed to cleanup resource ${resource.id}:`, error);
    }
  }

  /**
   * Check if cleanup is needed due to resource limits
   */
  private checkForCleanup(): void {
    if (this.resources.size > this.maxTotalResources) {
      console.log(`⚠️ Memory: Resource limit exceeded (${this.resources.size}/${this.maxTotalResources})`);
      this.cleanupOldestResources(this.resources.size - this.maxTotalResources);
    }
  }

  /**
   * Clean up the oldest resources
   */
  private cleanupOldestResources(count: number): void {
    const sortedResources = Array.from(this.resources.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    for (let i = 0; i < Math.min(count, sortedResources.length); i++) {
      const [id, resource] = sortedResources[i];
      this.cleanupResource(resource);
      this.resources.delete(id);
    }

    console.log(`🧹 Memory: Cleaned up ${count} oldest resources`);
  }

  /**
   * Check memory pressure and clean up if needed
   */
  private checkMemoryPressure(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const limit = memory.jsHeapSizeLimit;

      const pressure = used / limit;
      
      if (pressure > 0.8) {
        console.log(`🚨 Memory: High memory pressure detected (${(pressure * 100).toFixed(1)}%)`);
        this.forceCleanup();
      } else if (pressure > 0.6) {
        console.log(`⚠️ Memory: Medium memory pressure detected (${(pressure * 100).toFixed(1)}%)`);
        this.cleanupOldResources();
      }
    }
  }

  /**
   * Force aggressive cleanup
   */
  private forceCleanup(): void {
    console.log('🚨 Memory: Performing aggressive cleanup');
    
    // Clean up all but the most recent resources
    const recentTime = Date.now() - 60000; // Keep resources from last minute
    const toDelete: string[] = [];

    for (const [id, resource] of this.resources.entries()) {
      if (resource.lastAccessed < recentTime) {
        this.cleanupResource(resource);
        toDelete.push(id);
      }
    }

    toDelete.forEach(id => this.resources.delete(id));
    console.log(`🧹 Memory: Force-cleaned ${toDelete.length} resources`);
  }

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats {
    const resourcesByType: Record<string, number> = {};
    let totalEstimatedSize = 0;
    let oldestResource = Date.now();

    for (const resource of this.resources.values()) {
      resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1;
      totalEstimatedSize += resource.size || 0;
      oldestResource = Math.min(oldestResource, resource.created);
    }

    let memoryPressure: 'low' | 'medium' | 'high' = 'low';
    
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const pressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (pressure > 0.8) {
        memoryPressure = 'high';
      } else if (pressure > 0.6) {
        memoryPressure = 'medium';
      }
    }

    return {
      totalResources: this.resources.size,
      totalEstimatedSize,
      resourcesByType,
      oldestResource,
      memoryPressure
    };
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupOldResources();
    }, 60000) as any; // Every minute
  }

  /**
   * Full cleanup of all resources
   */
  cleanup(): void {
    console.log('🧹 Memory: Starting full cleanup');
    
    for (const resource of this.resources.values()) {
      this.cleanupResource(resource);
    }
    
    this.resources.clear();
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    console.log('✅ Memory: Full cleanup completed');
  }

  /**
   * Generate unique ID for resources
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();
export default memoryManager;