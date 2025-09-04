import { BlogPost, BlogCategory, BlogFrontmatter, BlogLanguage } from '../types/blog';

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const formatDate = (dateString: string, language: BlogLanguage = 'en'): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const localeMap = {
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
    ru: 'ru-RU',
  };

  return date.toLocaleDateString(localeMap[language], options);
};

export const generateBlogSlug = (title: string): string => {
  if (!title || typeof title !== 'string') {
    return 'untitled-post';
  }
  
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const extractExcerpt = (content: string, maxLength: number = 160): string => {
  const strippedContent = content.replace(/[#*`]/g, '').replace(/\n/g, ' ');
  if (strippedContent.length <= maxLength) return strippedContent;
  
  return strippedContent.substring(0, maxLength).trim() + '...';
};

export const groupPostsByCategory = (posts: BlogPost[]): Record<string, BlogPost[]> => {
  return posts.reduce((acc, post) => {
    if (!acc[post.category]) {
      acc[post.category] = [];
    }
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, BlogPost[]>);
};

export const getRelatedPosts = (
  currentPost: BlogPost,
  allPosts: BlogPost[],
  maxPosts: number = 3
): BlogPost[] => {
  const relatedPosts = allPosts
    .filter(post => 
      post.slug !== currentPost.slug &&
      post.language === currentPost.language &&
      (
        post.category === currentPost.category ||
        post.tags.some(tag => currentPost.tags.includes(tag))
      )
    )
    .sort((a, b) => {
      const aScore = (a.category === currentPost.category ? 2 : 0) +
                    a.tags.filter(tag => currentPost.tags.includes(tag)).length;
      const bScore = (b.category === currentPost.category ? 2 : 0) +
                    b.tags.filter(tag => currentPost.tags.includes(tag)).length;
      return bScore - aScore;
    })
    .slice(0, maxPosts);

  return relatedPosts;
};

export const getBlogCategories = (posts: BlogPost[]): BlogCategory[] => {
  const categoryMap = new Map<string, BlogCategory>();

  posts.forEach(post => {
    const existing = categoryMap.get(post.category);
    if (existing) {
      existing.postCount++;
    } else {
      categoryMap.set(post.category, {
        slug: post.category,
        name: post.category.charAt(0).toUpperCase() + post.category.slice(1),
        description: `${post.category} related articles`,
        postCount: 1,
        language: post.language,
      });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.postCount - a.postCount);
};

export const searchPosts = (
  posts: BlogPost[],
  query: string,
  language?: BlogLanguage
): BlogPost[] => {
  const searchQuery = query.toLowerCase().trim();
  if (!searchQuery) return posts;

  let filteredPosts = posts;
  if (language) {
    filteredPosts = posts.filter(post => post.language === language);
  }

  return filteredPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery) ||
    post.excerpt.toLowerCase().includes(searchQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
    post.category.toLowerCase().includes(searchQuery)
  );
};

export const paginatePosts = (
  posts: BlogPost[],
  page: number = 1,
  postsPerPage: number = 10
) => {
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = posts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return {
    posts: paginatedPosts,
    currentPage: page,
    totalPages,
    totalPosts: posts.length,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const generateBlogUrl = (slug: string, language: BlogLanguage = 'en'): string => {
  const basePath = language === 'en' ? '/blog' : `/${language}/blog`;
  return `${basePath}/${slug}`;
};

export const generateCategoryUrl = (category: string, language: BlogLanguage = 'en'): string => {
  const basePath = language === 'en' ? '/blog/category' : `/${language}/blog/category`;
  return `${basePath}/${category}`;
};

export const validateBlogPost = (post: Partial<BlogPost>): string[] => {
  const errors: string[] = [];

  if (!post.slug) errors.push('Slug is required');
  if (!post.title) errors.push('Title is required');
  if (!post.content) errors.push('Content is required');
  if (!post.author) errors.push('Author is required');
  if (!post.category) errors.push('Category is required');
  if (!post.publishedAt) errors.push('Published date is required');
  if (!post.seo?.metaTitle) errors.push('SEO meta title is required');
  if (!post.seo?.metaDescription) errors.push('SEO meta description is required');

  return errors;
};