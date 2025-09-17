import { useState, useEffect, useMemo } from 'react';
import { BlogPost, BlogCategory, BlogLanguage } from '../types/blog';
import { blogService } from '../services/simpleBlogService';
import { useI18n } from './useI18n';

/**
 * Simple, reliable blog hooks using embedded data
 * No external dependencies - instant loading
 */

export const useSimpleBlogPosts = (language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;

  const posts = useMemo(() => {
    console.log(`✅ [SimpleBlog] Loading posts for ${targetLanguage}...`);
    const result = blogService.getPostsByLanguage(targetLanguage);
    console.log(`✅ [SimpleBlog] Successfully loaded ${result.length} posts for ${targetLanguage}`);
    return result;
  }, [targetLanguage]);

  const categories = useMemo(() => blogService.getCategories(targetLanguage), [targetLanguage]);

  const featuredPosts = useMemo(() =>
    blogService.getFeaturedPosts(targetLanguage, 3),
    [targetLanguage]
  );

  const recentPosts = useMemo(() =>
    blogService.getRecentPosts(targetLanguage, 5),
    [targetLanguage]
  );

  const getPostBySlug = (slug: string): BlogPost | undefined => {
    return blogService.getPostBySlug(slug, targetLanguage) || undefined;
  };

  const getPostsByCategory = (category: string): BlogPost[] => {
    return blogService.getPostsByCategory(category, targetLanguage);
  };

  const getPostsByTag = (tag: string): BlogPost[] => {
    return blogService.getPostsByTag(tag, targetLanguage);
  };

  const getRelatedPostsForPost = (post: BlogPost, maxPosts: number = 3): BlogPost[] => {
    return blogService.getRelatedPosts(post, targetLanguage, maxPosts);
  };

  return {
    posts,
    categories,
    featuredPosts,
    recentPosts,
    loading: false,
    error: null,
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

  const [loading, setLoading] = useState(true);

  const post = useMemo(() => {
    const result = blogService.getPostBySlug(slug, targetLanguage);
    console.log(`✅ [SimpleBlog] Loading post "${slug}" for ${targetLanguage}:`, result ? 'found' : 'not found');
    return result;
  }, [slug, targetLanguage]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return blogService.getRelatedPosts(post, targetLanguage, 3);
  }, [post, targetLanguage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    post,
    relatedPosts,
    loading,
    error: null,
    notFound: !loading && !post,
  };
};

export const useSimpleBlogCategory = (categorySlug: string, language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;

  const categories = useMemo(() => blogService.getCategories(targetLanguage), [targetLanguage]);
  const category = categories.find(cat => cat.slug === categorySlug);
  const categoryPosts = useMemo(() =>
    blogService.getPostsByCategory(categorySlug, targetLanguage),
    [categorySlug, targetLanguage]
  );

  return {
    category,
    posts: categoryPosts,
    loading: false,
    error: null,
    notFound: !category,
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

  const filteredPosts = useMemo(() => {
    let posts = blogService.getPostsByLanguage(targetLanguage);

    if (category) {
      posts = blogService.getPostsByCategory(category, targetLanguage);
    }

    if (tag) {
      posts = blogService.getPostsByTag(tag, targetLanguage);
    }

    return posts;
  }, [targetLanguage, category, tag]);

  const paginationResult = useMemo(() =>
    blogService.paginatePosts(filteredPosts, page, postsPerPage),
    [filteredPosts, page, postsPerPage]
  );

  return {
    ...paginationResult,
    loading: false,
    error: null,
  };
};

export const useSimpleBlogSearch = (query: string, language?: BlogLanguage) => {
  const { currentLanguage } = useI18n();
  const targetLanguage = language || currentLanguage;

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    console.log(`🔍 [SimpleBlog] Searching for "${query}" in ${targetLanguage}...`);
    const results = blogService.searchPosts(query, targetLanguage);
    console.log(`✅ [SimpleBlog] Found ${results.length} results for "${query}"`);
    return results;
  }, [query, targetLanguage]);

  return {
    results: searchResults,
    loading: false,
    error: null,
    hasResults: searchResults.length > 0,
    totalResults: searchResults.length,
  };
};