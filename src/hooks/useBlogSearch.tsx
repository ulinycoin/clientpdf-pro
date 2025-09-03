import { useState, useEffect, useMemo } from 'react';
import { BlogPost, BlogSearchResult, BlogLanguage } from '../types/blog';
import { searchPosts, paginatePosts } from '../utils/blogUtils';
import { useBlogPosts } from './useBlogPosts';

export const useBlogSearch = (language?: BlogLanguage) => {
  const { posts, loading: postsLoading } = useBlogPosts(language);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Debounced search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchPosts(posts, query, language);
  }, [posts, query, language]);

  const clearSearch = () => {
    setQuery('');
  };

  const addToSearchHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 10); // Keep only last 10 searches
    });
  };

  const removeFromSearchHistory = (searchQuery: string) => {
    setSearchHistory(prev => prev.filter(item => item !== searchQuery));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  // Auto-add to history when search completes
  useEffect(() => {
    if (query.trim() && searchResults.length > 0) {
      const timeoutId = setTimeout(() => {
        addToSearchHistory(query);
      }, 1000); // Add to history after 1 second of stable search

      return () => clearTimeout(timeoutId);
    }
  }, [query, searchResults.length]);

  const performSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearching(true);
    
    // Simulate search delay for UX
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  return {
    query,
    searchResults,
    isSearching: isSearching || postsLoading,
    hasResults: searchResults.length > 0,
    hasQuery: query.trim().length > 0,
    searchHistory,
    setQuery,
    performSearch,
    clearSearch,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
  };
};

export const usePaginatedBlogSearch = (
  query: string,
  page: number = 1,
  postsPerPage: number = 10,
  language?: BlogLanguage
) => {
  const { posts, loading } = useBlogPosts(language);
  
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchPosts(posts, query, language);
  }, [posts, query, language]);

  const paginationResult = useMemo(() => 
    paginatePosts(searchResults, page, postsPerPage),
    [searchResults, page, postsPerPage]
  );

  const searchSummary = useMemo(() => ({
    query,
    totalResults: searchResults.length,
    showingFrom: paginationResult.posts.length > 0 ? ((page - 1) * postsPerPage) + 1 : 0,
    showingTo: Math.min(page * postsPerPage, searchResults.length),
    currentPage: page,
    totalPages: paginationResult.totalPages,
  }), [query, searchResults.length, paginationResult, page, postsPerPage]);

  return {
    ...paginationResult,
    searchSummary,
    loading,
    hasQuery: query.trim().length > 0,
    hasResults: searchResults.length > 0,
  };
};

// Advanced search with filters
export const useAdvancedBlogSearch = (language?: BlogLanguage) => {
  const { posts, categories, loading } = useBlogPosts(language);
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    tags: [] as string[],
    dateFrom: '',
    dateTo: '',
    author: '',
  });

  const searchResults = useMemo(() => {
    let filtered = posts;

    // Text search
    if (filters.query.trim()) {
      filtered = searchPosts(filtered, filters.query);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(post => post.category === filters.category);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(post => 
        filters.tags.some(tag => post.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(post => 
        new Date(post.publishedAt) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(post => 
        new Date(post.publishedAt) <= toDate
      );
    }

    // Author filter
    if (filters.author) {
      filtered = filtered.filter(post => 
        post.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [posts, filters]);

  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      tags: [],
      dateFrom: '',
      dateTo: '',
      author: '',
    });
  };

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'tags') return Array.isArray(value) && value.length > 0;
      return typeof value === 'string' && value.trim().length > 0;
    });
  }, [filters]);

  // Get all unique tags from posts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Get all unique authors
  const availableAuthors = useMemo(() => {
    const authorSet = new Set<string>();
    posts.forEach(post => authorSet.add(post.author));
    return Array.from(authorSet).sort();
  }, [posts]);

  return {
    filters,
    searchResults,
    categories,
    availableTags,
    availableAuthors,
    loading,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    totalResults: searchResults.length,
  };
};