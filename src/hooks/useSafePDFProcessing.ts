/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */


// src/hooks/useSafePDFProcessing.ts
import { useRef, useCallback, useEffect } from 'react';

interface UseSafePDFProcessingOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export const useSafePDFProcessing = (options: UseSafePDFProcessingOptions = {}) => {
  const isMountedRef = useRef(true);
  const activeTasksRef = useRef(new Set<string>());

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Отменяем все активные задачи
      activeTasksRef.current.clear();
    };
  }, []);

  const executeTask = useCallback(async <T>(
    taskId: string,
    task: () => Promise<T>
  ): Promise<T | null> => {
    if (!isMountedRef.current) {
      console.warn('⚠️ Task cancelled: component unmounted');
      return null;
    }

    if (activeTasksRef.current.has(taskId)) {
      console.warn('⚠️ Task already running:', taskId);
      return null;
    }

    activeTasksRef.current.add(taskId);

    try {
      console.log('🔄 Starting task:', taskId);
      const result = await task();
      
      if (!isMountedRef.current) {
        console.warn('⚠️ Task completed but component unmounted:', taskId);
        return null;
      }

      console.log('✅ Task completed:', taskId);
      options.onSuccess?.(result);
      return result;
      
    } catch (error) {
      console.error('❌ Task failed:', taskId, error);
      
      if (isMountedRef.current) {
        options.onError?.(error as Error);
      }
      
      throw error;
    } finally {
      activeTasksRef.current.delete(taskId);
    }
  }, [options]);

  const cancelAllTasks = useCallback(() => {
    console.log('🛑 Cancelling all tasks');
    activeTasksRef.current.clear();
  }, []);

  const isTaskRunning = useCallback((taskId: string) => {
    return activeTasksRef.current.has(taskId);
  }, []);

  return {
    executeTask,
    cancelAllTasks,
    isTaskRunning,
    isMounted: () => isMountedRef.current
  };
};

// Дополнительный хук для PDF Canvas рендеринга
export const usePDFCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderingRef = useRef(false);
  const { executeTask } = useSafePDFProcessing();

  const renderPage = useCallback(async (
    pdfDocument: any,
    pageNumber: number,
    options: { scale?: number; rotation?: number } = {}
  ) => {
    const taskId = `render-page-${pageNumber}`;
    
    return executeTask(taskId, async () => {
      if (!canvasRef.current) {
        throw new Error('Canvas not available');
      }

      if (renderingRef.current) {
        throw new Error('Already rendering');
      }

      renderingRef.current = true;

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Cannot get canvas context');
        }

        const { scale = 1.0, rotation = 0 } = options;
        const viewport = page.getViewport({ scale, rotation });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        return { success: true, pageNumber };
        
      } finally {
        renderingRef.current = false;
      }
    });
  }, [executeTask]);

  const clearCanvas = useCallback(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  return {
    canvasRef,
    renderPage,
    clearCanvas,
    isRendering: () => renderingRef.current
  };
};