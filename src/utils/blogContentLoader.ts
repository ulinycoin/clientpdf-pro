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


/**
 * Получить список всех доступных статей для языка
 */
export const getAvailablePosts = async (language: BlogLanguage): Promise<BlogPost[]> => {
  const posts: BlogPost[] = [];
  
  // Фильтруем файлы по языку
  const languageFiles = Object.keys(markdownFiles).filter(
    path => path.includes(`/blog/${language}/`)
  );
  

  // Загружаем и парсим каждый файл
  for (const filePath of languageFiles) {
    try {
      const loadFile = markdownFiles[filePath];
      const content = await loadFile() as string;
      
      if (content) {
        const post = createBlogPostFromMarkdown(content, language);
        // Всегда используем имя файла как slug для консистентности
        const fileName = filePath.split('/').pop()?.replace('.md', '') || '';
        post.slug = fileName;
        posts.push(post);
      }
    } catch (error) {
      console.warn(`Failed to load blog post: ${filePath}`, error);
    }
  }

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
    // Пытаемся найти файл по slug
    const possiblePaths = [
      `/src/content/blog/${language}/${slug}.md`,
    ];

    for (const path of possiblePaths) {
      if (markdownFiles[path]) {
        const loadFile = markdownFiles[path];
        const content = await loadFile() as string;
        
        if (content) {
          const post = createBlogPostFromMarkdown(content, language);
          post.slug = slug; // Убеждаемся что slug соответствует запросу
          return post;
        }
      }
    }

    // Если не найден точный файл, ищем среди всех статей
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