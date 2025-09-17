import { useState, useEffect, useMemo } from 'react';
import { BlogPost, BlogCategory, BlogLanguage } from '../types/blog';
import { getBlogCategories, paginatePosts } from '../utils/blogUtils';
import { 
  getCachedPosts, 
  getPostBySlug, 
  getRelatedPosts as getRelatedFromContent,
  getBlogStats
} from '../utils/blogContentLoader';
import { useI18n } from './useI18n';

// Mock data for development - will be replaced with actual content loading
const mockBlogPosts: BlogPost[] = [
  // English posts
  {
    slug: 'complete-guide-pdf-merging-2025',
    title: 'Complete Guide to PDF Merging in 2025',
    excerpt: 'Learn professional techniques for merging PDF files with step-by-step instructions and best practices.',
    content: '<p>Comprehensive guide content...</p>',
    author: 'LocalPDF Team',
    publishedAt: '2025-01-15',
    category: 'tutorials',
    tags: ['pdf-merge', 'tutorial', 'guide'],
    readingTime: 8,
    language: 'en',
    seo: {
      metaTitle: 'How to Merge PDF Files Online - Complete Guide | LocalPDF',
      metaDescription: 'Professional guide to merging PDF files. Learn 5 methods including online tools, software, and batch merging. Free step-by-step tutorial.',
    },
    featured: true,
    relatedPosts: ['pdf-compression-guide', 'pdf-security-guide'],
  },
  {
    slug: 'pdf-compression-guide',
    title: 'How to Compress PDFs Without Losing Quality',
    excerpt: 'Discover advanced techniques to reduce PDF file sizes while maintaining document quality and readability.',
    content: '<p>PDF compression guide content...</p>',
    author: 'LocalPDF Team',
    publishedAt: '2025-01-10',
    category: 'tutorials',
    tags: ['pdf-compress', 'optimization', 'file-size'],
    readingTime: 6,
    language: 'en',
    seo: {
      metaTitle: 'How to Compress PDF Files - Reduce Size Without Quality Loss',
      metaDescription: 'Learn professional PDF compression techniques. Reduce file size by up to 90% while maintaining quality. Free online tools and tips.',
    },
    featured: false,
  },
  // German posts
  {
    slug: 'vollstandige-anleitung-pdf-zusammenfugen-2025',
    title: 'Vollständige Anleitung zum PDF-Zusammenführen 2025',
    excerpt: 'Lernen Sie professionelle Techniken zum Zusammenführen von PDF-Dateien mit Schritt-für-Schritt-Anleitungen und Best Practices.',
    content: '<p>Umfassender Leitfaden Inhalt...</p>',
    author: 'LocalPDF Team',
    publishedAt: '2025-01-15',
    category: 'tutorials',
    tags: ['pdf-merge', 'tutorial', 'guide'],
    readingTime: 8,
    language: 'de',
    seo: {
      metaTitle: 'PDF-Dateien online zusammenführen - Vollständige Anleitung | LocalPDF',
      metaDescription: 'Professionelle Anleitung zum Zusammenführen von PDF-Dateien. Lernen Sie 5 Methoden einschließlich Online-Tools und Batch-Verarbeitung.',
    },
    featured: true,
    relatedPosts: ['pdf-compression-guide', 'pdf-security-guide'],
  },
  // Russian posts
  {
    slug: 'polnoe-rukovodstvo-po-slianiiu-pdf-2025',
    title: 'Полное руководство по слиянию PDF в 2025',
    excerpt: 'Изучите профессиональные техники объединения PDF файлов с пошаговыми инструкциями и лучшими практиками.',
    content: '<p>Содержание подробного руководства...</p>',
    author: 'Команда LocalPDF',
    publishedAt: '2025-01-15',
    category: 'tutorials',
    tags: ['pdf-merge', 'tutorial', 'guide'],
    readingTime: 8,
    language: 'ru',
    seo: {
      metaTitle: 'Как объединить PDF файлы онлайн - Полное руководство | LocalPDF',
      metaDescription: 'Профессиональное руководство по объединению PDF файлов. Изучите 5 методов включая онлайн инструменты и пакетное объединение.',
    },
    featured: true,
    relatedPosts: ['pdf-compression-guide', 'pdf-security-guide'],
  },
  // French posts  
  {
    slug: 'guide-complet-fusion-pdf-2025',
    title: 'Guide complet de fusion PDF en 2025',
    excerpt: 'Apprenez les techniques professionnelles pour fusionner des fichiers PDF avec des instructions étape par étape et les meilleures pratiques.',
    content: '<p>Contenu du guide complet...</p>',
    author: 'Équipe LocalPDF',
    publishedAt: '2025-01-15',
    category: 'tutorials',
    tags: ['pdf-merge', 'tutorial', 'guide'],
    readingTime: 8,
    language: 'fr',
    seo: {
      metaTitle: 'Comment fusionner des fichiers PDF en ligne - Guide complet | LocalPDF',
      metaDescription: 'Guide professionnel pour fusionner des fichiers PDF. Apprenez 5 méthodes incluant les outils en ligne et la fusion par lots.',
    },
    featured: true,
    relatedPosts: ['pdf-compression-guide', 'pdf-security-guide'],
  },
  // Spanish posts
  {
    slug: 'guia-completa-fusion-pdf-2025',
    title: 'Guía completa de fusión PDF en 2025',
    excerpt: 'Aprende técnicas profesionales para fusionar archivos PDF con instrucciones paso a paso y mejores prácticas.',
    content: '<p>Contenido de la guía completa...</p>',
    author: 'Equipo LocalPDF',
    publishedAt: '2025-01-15',
    category: 'tutorials',
    tags: ['pdf-merge', 'tutorial', 'guide'],
    readingTime: 8,
    language: 'es',
    seo: {
      metaTitle: 'Cómo fusionar archivos PDF en línea - Guía completa | LocalPDF',
      metaDescription: 'Guía profesional para fusionar archivos PDF. Aprende 5 métodos incluyendo herramientas en línea y fusión por lotes.',
    },
    featured: true,
    relatedPosts: ['pdf-compression-guide', 'pdf-security-guide'],
  },
];

export const useBlogPosts = (language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetLanguage = language || currentLanguage;

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        
        // Загружаем реальные markdown файлы с fallback
        const loadedPosts = await getCachedPosts(targetLanguage);
        
        if (loadedPosts.length === 0) {
          // Fallback к mock данным если markdown файлы не загружаются
          const filteredPosts = mockBlogPosts.filter(post => post.language === targetLanguage);
          setPosts(filteredPosts);
        } else {
          setPosts(loadedPosts);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blog posts');
        
        // В случае ошибки используем mock данные как fallback
        const filteredPosts = mockBlogPosts.filter(post => post.language === targetLanguage);
        setPosts(filteredPosts);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [targetLanguage]);

  const categories = useMemo(() => getBlogCategories(posts), [posts]);
  
  const featuredPosts = useMemo(() => 
    posts.filter(post => post.featured).slice(0, 3),
    [posts]
  );

  const recentPosts = useMemo(() =>
    posts
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5),
    [posts]
  );

  const getPostBySlug = (slug: string): BlogPost | undefined => {
    return posts.find(post => post.slug === slug);
  };

  const getPostsByCategory = (category: string): BlogPost[] => {
    return posts.filter(post => post.category === category);
  };

  const getPostsByTag = (tag: string): BlogPost[] => {
    return posts.filter(post => post.tags.includes(tag));
  };

  const getRelatedPostsForPost = async (post: BlogPost, maxPosts: number = 3): Promise<BlogPost[]> => {
    try {
      return await getRelatedFromContent(post, targetLanguage, maxPosts);
    } catch (error) {
      // Fallback к локальной функции если что-то пошло не так
      const related = posts
        .filter(p => p.slug !== post.slug)
        .filter(p => 
          p.category === post.category || 
          p.tags.some(tag => post.tags.includes(tag))
        )
        .slice(0, maxPosts);
      return related;
    }
  };

  return {
    posts,
    categories,
    featuredPosts,
    recentPosts,
    loading,
    error,
    getPostBySlug,
    getPostsByCategory,
    getPostsByTag,
    getRelatedPostsForPost,
    totalPosts: posts.length,
  };
};

export const useBlogPost = (slug: string, language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        
        // Загружаем статью по slug
        const loadedPost = await getPostBySlug(slug, targetLanguage);
        setPost(loadedPost);
        
        // Загружаем похожие статьи
        if (loadedPost) {
          const related = await getRelatedFromContent(loadedPost, targetLanguage, 3);
          setRelatedPosts(related);
        }
        
        setError(null);
      } catch (err) {
        console.error(`Failed to load post ${slug}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
        setPost(null);
        setRelatedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, targetLanguage]);

  return {
    post,
    relatedPosts,
    loading,
    error,
    notFound: !loading && !error && !post,
  };
};

export const useBlogCategory = (categorySlug: string, language?: BlogLanguage) => {
  const { posts, categories, loading, error } = useBlogPosts(language);
  
  const category = categories.find(cat => cat.slug === categorySlug);
  const categoryPosts = posts.filter(post => post.category === categorySlug);

  return {
    category,
    posts: categoryPosts,
    loading,
    error,
    notFound: !loading && !error && !category,
  };
};

export const usePaginatedBlogPosts = (
  page: number = 1,
  postsPerPage: number = 10,
  category?: string,
  tag?: string,
  language?: BlogLanguage
) => {
  const { posts, loading, error } = useBlogPosts(language);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    
    if (category) {
      filtered = filtered.filter(post => post.category === category);
    }
    
    if (tag) {
      filtered = filtered.filter(post => post.tags.includes(tag));
    }

    return filtered.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [posts, category, tag]);

  const paginationResult = useMemo(() => 
    paginatePosts(filteredPosts, page, postsPerPage),
    [filteredPosts, page, postsPerPage]
  );

  return {
    ...paginationResult,
    loading,
    error,
  };
};