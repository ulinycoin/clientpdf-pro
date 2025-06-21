import { useState, useCallback, useEffect, useRef } from 'react'
import { 
  loadPDFJS, 
  loadPDFLib, 
  loadPDFGenerator, 
  preloadPDFLibraries,
  checkPDFSupport,
  validatePDFFile
} from '@/utils/pdfLoader'

export type PDFLibrary = 'pdfjs' | 'pdf-lib' | 'pdf-generator'

interface UsePDFLoaderState {
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  progress: number
}

interface UsePDFLoaderReturn extends UsePDFLoaderState {
  loadLibrary: (library: PDFLibrary) => Promise<any>
  preloadAll: () => Promise<void>
  resetError: () => void
  isSupported: boolean
}

/**
 * Hook для управления ленивой загрузкой PDF библиотек
 */
export const usePDFLoader = (autoPreload = false): UsePDFLoaderReturn => {
  const [state, setState] = useState<UsePDFLoaderState>({
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0
  })
  
  const loadedLibraries = useRef<Set<PDFLibrary>>(new Set())
  const loadingPromises = useRef<Map<PDFLibrary, Promise<any>>>(new Map())
  
  // Проверяем поддержку браузера
  const { isSupported } = checkPDFSupport()
  
  const updateState = useCallback((updates: Partial<UsePDFLoaderState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])
  
  const loadLibrary = useCallback(async (library: PDFLibrary) => {
    // Если уже загружена, возвращаем кешированную
    if (loadedLibraries.current.has(library)) {
      return Promise.resolve()
    }
    
    // Если уже загружается, возвращаем существующий промис
    if (loadingPromises.current.has(library)) {
      return loadingPromises.current.get(library)
    }
    
    updateState({ isLoading: true, error: null, progress: 0 })
    
    const loadPromise = (async () => {
      try {
        let result
        
        switch (library) {
          case 'pdfjs':
            updateState({ progress: 30 })
            result = await loadPDFJS()
            break
            
          case 'pdf-lib':
            updateState({ progress: 50 })
            result = await loadPDFLib()
            break
            
          case 'pdf-generator':
            updateState({ progress: 70 })
            result = await loadPDFGenerator()
            break
            
          default:
            throw new Error(`Unknown library: ${library}`)
        }
        
        loadedLibraries.current.add(library)
        updateState({ 
          isLoading: false, 
          isLoaded: true, 
          progress: 100 
        })
        
        return result
        
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load PDF library'
          
        updateState({ 
          isLoading: false, 
          error: errorMessage, 
          progress: 0 
        })
        
        throw error
      } finally {
        loadingPromises.current.delete(library)
      }
    })()
    
    loadingPromises.current.set(library, loadPromise)
    return loadPromise
  }, [updateState])
  
  const preloadAll = useCallback(async () => {
    if (!isSupported) {
      throw new Error('PDF functionality is not supported in this browser')
    }
    
    updateState({ isLoading: true, error: null, progress: 0 })
    
    try {
      updateState({ progress: 25 })
      await preloadPDFLibraries()
      
      // Помечаем как загруженные
      loadedLibraries.current.add('pdfjs')
      loadedLibraries.current.add('pdf-lib')
      
      updateState({ 
        isLoading: false, 
        isLoaded: true, 
        progress: 100 
      })
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to preload PDF libraries'
        
      updateState({ 
        isLoading: false, 
        error: errorMessage, 
        progress: 0 
      })
    }
  }, [isSupported, updateState])
  
  const resetError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])
  
  // Автоматическая предзагрузка если включена
  useEffect(() => {
    if (autoPreload && isSupported) {
      const timer = setTimeout(() => {
        preloadAll().catch(() => {
          // Игнорируем ошибки автопредзагрузки
        })
      }, 1000) // Задержка для не блокирования initial render
      
      return () => clearTimeout(timer)
    }
  }, [autoPreload, isSupported, preloadAll])
  
  return {
    ...state,
    loadLibrary,
    preloadAll,
    resetError,
    isSupported
  }
}

/**
 * Hook для предзагрузки при hover/focus
 */
export const usePDFPreloader = () => {
  const [isPreloaded, setIsPreloaded] = useState(false)
  const preloadTimeoutRef = useRef<NodeJS.Timeout>()
  
  const triggerPreload = useCallback(() => {
    if (isPreloaded) return
    
    // Отменяем предыдущий timeout
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current)
    }
    
    // Небольшая задержка для избежания случайных hover
    preloadTimeoutRef.current = setTimeout(async () => {
      try {
        await preloadPDFLibraries()
        setIsPreloaded(true)
      } catch (error) {
        console.warn('PDF libraries preload failed:', error)
      }
    }, 300)
  }, [isPreloaded])
  
  const cancelPreload = useCallback(() => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current)
    }
  }, [])
  
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current)
      }
    }
  }, [])
  
  return {
    isPreloaded,
    triggerPreload,
    cancelPreload
  }
}

/**
 * Hook для валидации PDF файлов
 */
export const usePDFValidator = () => {
  const validateFile = useCallback((file: File) => {
    try {
      validatePDFFile(file)
      return { isValid: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Invalid PDF file'
      return { isValid: false, error: errorMessage }
    }
  }, [])
  
  const validateFiles = useCallback((files: File[]) => {
    const results = files.map(file => ({
      file,
      ...validateFile(file)
    }))
    
    const validFiles = results.filter(r => r.isValid).map(r => r.file)
    const errors = results.filter(r => !r.isValid).map(r => r.error)
    
    return {
      validFiles,
      errors,
      hasErrors: errors.length > 0
    }
  }, [validateFile])
  
  return {
    validateFile,
    validateFiles
  }
}
