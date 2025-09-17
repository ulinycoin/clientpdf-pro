import { BlogPost, BlogLanguage } from '../types/blog';
import { createBlogPostFromMarkdown } from './markdownParser';

/**
 * Динамическая загрузка markdown статей из content/blog/
 * Использует Vite's import.meta.glob для статической загрузки при сборке
 */

// Создаем карту всех markdown файлов из content/blog/
const markdownFiles = import.meta.glob('/src/content/blog/**/*.md', {
  as: 'raw',
  eager: false
});

// Production-ready file loading function
async function loadMarkdownFromPath(path: string): Promise<string | null> {
  try {
    // In development, try import.meta.glob first
    if (import.meta.env.DEV && markdownFiles[path]) {
      const loadFile = markdownFiles[path];
      return await loadFile() as string;
    }

    // In production or as fallback, use fetch for files copied by our Vite plugin
    const response = await fetch(path);
    if (response.ok) {
      return await response.text();
    }

    console.warn(`Could not load markdown from path: ${path}`);
    return null;
  } catch (error) {
    console.warn(`Failed to load markdown from ${path}:`, error);
    return null;
  }
}


/**
 * Получить список всех доступных статей для языка
 */
export const getAvailablePosts = async (language: BlogLanguage): Promise<BlogPost[]> => {
  const posts: BlogPost[] = [];

  // Debug: показываем все доступные файлы
  console.log('🔍 [BlogLoader] Available markdown files from import.meta.glob:', Object.keys(markdownFiles));
  console.log('🔍 [BlogLoader] Looking for language:', language);

  // In development, try import.meta.glob first, but don't rely on it exclusively
  if (import.meta.env.DEV && Object.keys(markdownFiles).length > 0) {
    console.log('🔄 [BlogLoader] Development mode: trying import.meta.glob approach...');

    const languageFiles = Object.keys(markdownFiles).filter(
      path => path.includes(`/blog/${language}/`)
    );

    console.log('🔍 [BlogLoader] Found files from import.meta.glob for', language, ':', languageFiles);

    for (const filePath of languageFiles) {
      try {
        const content = await loadMarkdownFromPath(filePath);

        if (content) {
          const post = createBlogPostFromMarkdown(content, language);
          const fileName = filePath.split('/').pop()?.replace('.md', '') || '';
          post.slug = fileName;
          posts.push(post);
        }
      } catch (error) {
        console.warn(`Failed to load blog post: ${filePath}`, error);
      }
    }
  }

  // In production or if dev approach failed, use static list
  if (posts.length === 0) {
    console.log('🔄 [BlogLoader] Using static list approach (production or fallback)...');

    const BLOG_POSTS = [
      'complete-guide-pdf-merging-2025',
      'how-to-add-text-to-pdf',
      'how-to-convert-excel-to-pdf',
      'how-to-convert-image-to-pdf',
      'how-to-convert-pdf-to-image',
      'how-to-convert-pdf-to-svg',
      'how-to-convert-word-to-pdf',
      'how-to-extract-images-from-pdf',
      'how-to-extract-pages-from-pdf',
      'how-to-extract-text-from-pdf',
      'how-to-rotate-pdf-files',
      'how-to-split-pdf-files',
      'how-to-watermark-pdf-files',
      'ocr-pdf-ultimate-guide',
      'pdf-accessibility-wcag-compliance',
      'pdf-compression-guide',
      'pdf-security-guide',
      'protect-pdf-guide'
    ];

    for (const slug of BLOG_POSTS) {
      try {
        const filePath = `/src/content/blog/${language}/${slug}.md`;
        const content = await loadMarkdownFromPath(filePath);

        if (content) {
          const post = createBlogPostFromMarkdown(content, language);
          post.slug = slug;
          posts.push(post);
        }
      } catch (error) {
        console.warn(`Failed to load blog post from static list: ${slug}`, error);
      }
    }
  }

  console.log(`✅ [BlogLoader] Successfully loaded ${posts.length} posts for ${language}`);

  // Сортируем по дате публикации (новые сначала)
  return posts.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
};

/**
 * Получить конкретную статью по slug и языку
 */
export const getPostBySlug = async (slug: string, language: BlogLanguage): Promise<BlogPost | null> => {
  try {
    // Direct approach: try to load the specific file first
    const filePath = `/src/content/blog/${language}/${slug}.md`;
    const content = await loadMarkdownFromPath(filePath);

    if (content) {
      const post = createBlogPostFromMarkdown(content, language);
      post.slug = slug; // Убеждаемся что slug соответствует запросу
      return post;
    }

    // Fallback: ищем среди всех статей
    console.warn(`Direct loading failed for ${slug}, falling back to getAvailablePosts`);
    const allPosts = await getAvailablePosts(language);
    return allPosts.find(post => post.slug === slug) || null;

  } catch (error) {
    console.error(`Failed to load post ${slug} for language ${language}:`, error);
    return null;
  }
};

/**
 * Получить статьи по категории
 */
export const getPostsByCategory = async (
  category: string, 
  language: BlogLanguage
): Promise<BlogPost[]> => {
  const allPosts = await getAvailablePosts(language);
  return allPosts.filter(post => post.category === category);
};

/**
 * Получить статьи по тегу
 */
export const getPostsByTag = async (
  tag: string, 
  language: BlogLanguage
): Promise<BlogPost[]> => {
  const allPosts = await getAvailablePosts(language);
  return allPosts.filter(post => post.tags.includes(tag));
};

/**
 * Поиск статей по запросу
 */
export const searchPosts = async (
  query: string, 
  language: BlogLanguage
): Promise<BlogPost[]> => {
  if (!query.trim()) {
    return getAvailablePosts(language);
  }

  const allPosts = await getAvailablePosts(language);
  const searchTerm = query.toLowerCase();

  return allPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.excerpt.toLowerCase().includes(searchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    post.category.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm)
  );
};

/**
 * Получить похожие статьи на основе категории и тегов
 */
export const getRelatedPosts = async (
  currentPost: BlogPost, 
  language: BlogLanguage,
  maxPosts: number = 3
): Promise<BlogPost[]> => {
  const allPosts = await getAvailablePosts(language);
  
  const relatedPosts = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      let score = 0;
      
      // Та же категория = +2 очка
      if (post.category === currentPost.category) {
        score += 2;
      }
      
      // Общие теги = +1 очко за каждый
      const commonTags = post.tags.filter(tag => 
        currentPost.tags.includes(tag)
      );
      score += commonTags.length;
      
      return { post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPosts)
    .map(item => item.post);

  return relatedPosts;
};

/**
 * Получить статистику блога
 */
export const getBlogStats = async (language: BlogLanguage) => {
  const posts = await getAvailablePosts(language);
  
  const categories = new Map<string, number>();
  const tags = new Map<string, number>();
  
  posts.forEach(post => {
    // Подсчет категорий
    categories.set(post.category, (categories.get(post.category) || 0) + 1);
    
    // Подсчет тегов
    post.tags.forEach(tag => {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    });
  });

  return {
    totalPosts: posts.length,
    featuredPosts: posts.filter(post => post.featured).length,
    categories: Array.from(categories.entries()).map(([name, count]) => ({
      slug: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      description: `${name} related articles`,
      postCount: count,
      language
    })),
    tags: Array.from(tags.entries()).map(([name, count]) => ({
      slug: name,
      name,
      postCount: count
    }))
  };
};

/**
 * Кэш для улучшения производительности
 */
const postCache = new Map<string, { posts: BlogPost[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export const getCachedPosts = async (language: BlogLanguage): Promise<BlogPost[]> => {
  const cacheKey = `posts-${language}`;
  const cached = postCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.posts;
  }
  
  const posts = await getAvailablePosts(language);
  postCache.set(cacheKey, { posts, timestamp: Date.now() });
  
  return posts;
};