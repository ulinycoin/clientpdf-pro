import { useState, useEffect } from 'react';
import { BlogPost, BlogCategory, BlogLanguage } from '../types/blog';
import { blogService } from '../services/simpleBlogService';
import { useI18n } from './useI18n';

/**
 * Optimized blog hooks with lazy loading by language
 *
 * Performance improvement:
 * - Old: ~454 KB bundle (all posts loaded)
 * - New: ~88 KB per language (lazy loaded)
 * - Mobile LCP: Expected -2-3s improvement
 */

export const useSimpleBlogPosts = (language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBlogData = async () => {
      try {
        setLoading(true);
        console.log(`✅ [SimpleBlog] Loading posts for ${targetLanguage}...`);

        const [allPosts, cats, featured, recent] = await Promise.all([
          blogService.getPostsByLanguage(targetLanguage),
          blogService.getCategories(targetLanguage),
          blogService.getFeaturedPosts(targetLanguage, 3),
          blogService.getRecentPosts(targetLanguage, 5),
        ]);

        if (mounted) {
          setPosts(allPosts);
          setCategories(cats);
          setFeaturedPosts(featured);
          setRecentPosts(recent);
          console.log(`✅ [SimpleBlog] Successfully loaded ${allPosts.length} posts for ${targetLanguage}`);
        }
      } catch (err) {
        console.error('[SimpleBlog] Failed to load blog data:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBlogData();

    return () => {
      mounted = false;
    };
  }, [targetLanguage]);

  const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
    const result = await blogService.getPostBySlug(slug, targetLanguage);
    return result || undefined;
  };

  const getPostsByCategory = async (category: string): Promise<BlogPost[]> => {
    return blogService.getPostsByCategory(category, targetLanguage);
  };

  const getPostsByTag = async (tag: string): Promise<BlogPost[]> => {
    return blogService.getPostsByTag(tag, targetLanguage);
  };

  const getRelatedPostsForPost = async (post: BlogPost, maxPosts: number = 3): Promise<BlogPost[]> => {
    return blogService.getRelatedPosts(post, targetLanguage, maxPosts);
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

export const useSimpleBlogPost = (slug: string, language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPost = async () => {
      try {
        setLoading(true);
        console.log(`✅ [SimpleBlog] Loading post "${slug}" for ${targetLanguage}...`);

        const loadedPost = await blogService.getPostBySlug(slug, targetLanguage);

        if (mounted) {
          setPost(loadedPost);
          console.log(`✅ [SimpleBlog] Post "${slug}": ${loadedPost ? 'found' : 'not found'}`);

          if (loadedPost) {
            const related = await blogService.getRelatedPosts(loadedPost, targetLanguage, 3);
            if (mounted) {
              setRelatedPosts(related);
            }
          }
        }
      } catch (err) {
        console.error('[SimpleBlog] Failed to load post:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      mounted = false;
    };
  }, [slug, targetLanguage]);

  return {
    post,
    relatedPosts,
    loading,
    error,
    notFound: !loading && !post,
  };
};

export const useSimpleBlogCategory = (categorySlug: string, language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;

  const [category, setCategory] = useState<BlogCategory | undefined>(undefined);
  const [categoryPosts, setCategoryPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCategory = async () => {
      try {
        setLoading(true);

        const [categories, posts] = await Promise.all([
          blogService.getCategories(targetLanguage),
          blogService.getPostsByCategory(categorySlug, targetLanguage),
        ]);

        if (mounted) {
          const cat = categories.find(c => c.slug === categorySlug);
          setCategory(cat);
          setCategoryPosts(posts);
        }
      } catch (err) {
        console.error('[SimpleBlog] Failed to load category:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategory();

    return () => {
      mounted = false;
    };
  }, [categorySlug, targetLanguage]);

  return {
    category,
    posts: categoryPosts,
    loading,
    error,
    notFound: !loading && !category,
  };
};

export const usePaginatedSimpleBlogPosts = (
  page: number = 1,
  postsPerPage: number = 10,
  category?: string,
  tag?: string,
  language?: BlogLanguage
) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;

  const [paginationResult, setPaginationResult] = useState({
    posts: [] as BlogPost[],
    currentPage: page,
    totalPages: 0,
    totalPosts: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    postsPerPage,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPosts = async () => {
      try {
        setLoading(true);

        let posts: BlogPost[];

        if (category) {
          posts = await blogService.getPostsByCategory(category, targetLanguage);
        } else if (tag) {
          posts = await blogService.getPostsByTag(tag, targetLanguage);
        } else {
          posts = await blogService.getPostsByLanguage(targetLanguage);
        }

        if (mounted) {
          const result = blogService.paginatePosts(posts, page, postsPerPage);
          setPaginationResult(result);
        }
      } catch (err) {
        console.error('[SimpleBlog] Failed to load paginated posts:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      mounted = false;
    };
  }, [targetLanguage, category, tag, page, postsPerPage]);

  return {
    ...paginationResult,
    loading,
    error,
  };
};

export const useSimpleBlogSearch = (query: string, language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;

  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    let mounted = true;

    const performSearch = async () => {
      try {
        setLoading(true);
        console.log(`🔍 [SimpleBlog] Searching for "${query}" in ${targetLanguage}...`);

        const results = await blogService.searchPosts(query, targetLanguage);

        if (mounted) {
          setSearchResults(results);
          console.log(`✅ [SimpleBlog] Found ${results.length} results for "${query}"`);
        }
      } catch (err) {
        console.error('[SimpleBlog] Search failed:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      mounted = false;
    };
  }, [query, targetLanguage]);

  return {
    results: searchResults,
    loading,
    error,
    hasResults: searchResults.length > 0,
    totalResults: searchResults.length,
  };
};
