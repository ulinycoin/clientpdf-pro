import { BlogPost, BlogLanguage, BlogCategory } from '../types/blog';
import { loadBlogPostsByLanguage, getBlogPostsSyncIfLoaded } from '../data/blogPosts';

/**
 * Optimized blog service with lazy loading by language
 *
 * Performance improvement:
 * - Old: ~454 KB bundle (all 79 posts loaded upfront)
 * - New: ~88 KB per language (only requested language)
 * - Mobile LCP: Expected -2-3s improvement
 *
 * All methods are now async to support dynamic loading
 */

export class SimpleBlogService {
  private postsCache = new Map<BlogLanguage, BlogPost[]>();

  /**
   * Load posts for a specific language (async)
   * Returns cached data if already loaded
   */
  private async ensurePostsLoaded(language: BlogLanguage): Promise<BlogPost[]> {
    if (this.postsCache.has(language)) {
      return this.postsCache.get(language)!;
    }

    const posts = await loadBlogPostsByLanguage(language);
    this.postsCache.set(language, posts);
    return posts;
  }

  /**
   * Get all posts for a specific language
   */
  async getPostsByLanguage(language: BlogLanguage): Promise<BlogPost[]> {
    const posts = await this.ensurePostsLoaded(language);
    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Get a specific post by slug and language
   */
  async getPostBySlug(slug: string, language: BlogLanguage): Promise<BlogPost | null> {
    const posts = await this.ensurePostsLoaded(language);
    return posts.find(post => post.slug === slug) || null;
  }

  /**
   * Get featured posts for a language
   */
  async getFeaturedPosts(language: BlogLanguage, limit: number = 3): Promise<BlogPost[]> {
    const posts = await this.ensurePostsLoaded(language);
    return posts
      .filter(post => post.featured)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get recent posts for a language
   */
  async getRecentPosts(language: BlogLanguage, limit: number = 5): Promise<BlogPost[]> {
    const posts = await this.ensurePostsLoaded(language);
    return posts
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(category: string, language: BlogLanguage): Promise<BlogPost[]> {
    const posts = await this.ensurePostsLoaded(language);
    return posts
      .filter(post => post.category === category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(tag: string, language: BlogLanguage): Promise<BlogPost[]> {
    const posts = await this.ensurePostsLoaded(language);
    return posts
      .filter(post => post.tags.includes(tag))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Get related posts for a given post
   */
  async getRelatedPosts(currentPost: BlogPost, language: BlogLanguage, limit: number = 3): Promise<BlogPost[]> {
    const posts = await this.ensurePostsLoaded(language);

    const relatedPosts = posts
      .filter(post => post.slug !== currentPost.slug)
      .map(post => {
        let score = 0;

        // Same category = +2 points
        if (post.category === currentPost.category) {
          score += 2;
        }

        // Common tags = +1 point each
        const commonTags = post.tags.filter(tag =>
          currentPost.tags.includes(tag)
        );
        score += commonTags.length;

        // Check related posts list
        if (currentPost.relatedPosts?.includes(post.slug)) {
          score += 3;
        }

        return { post, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);

    return relatedPosts;
  }

  /**
   * Get all available categories for a language
   */
  async getCategories(language: BlogLanguage): Promise<BlogCategory[]> {
    const posts = await this.ensurePostsLoaded(language);
    const categoryCounts = new Map<string, number>();

    posts.forEach(post => {
      categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
    });

    return Array.from(categoryCounts.entries()).map(([slug, count]) => ({
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '),
      description: `${slug} related articles`,
      postCount: count,
      language
    }));
  }

  /**
   * Search posts by query
   */
  async searchPosts(query: string, language: BlogLanguage): Promise<BlogPost[]> {
    const posts = await this.ensurePostsLoaded(language);

    if (!query.trim()) {
      return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const searchTerm = query.toLowerCase();

    return posts
      .filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        post.category.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Get blog statistics
   */
  async getBlogStats(language: BlogLanguage) {
    const posts = await this.ensurePostsLoaded(language);

    return {
      totalPosts: posts.length,
      featuredPosts: posts.filter(post => post.featured).length,
      categories: await this.getCategories(language),
      tags: await this.getAllTags(language),
      latestPost: posts.length > 0 ?
        posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0] :
        null
    };
  }

  /**
   * Get all available tags for a language
   */
  private async getAllTags(language: BlogLanguage) {
    const posts = await this.ensurePostsLoaded(language);
    const tagCounts = new Map<string, number>();

    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries()).map(([name, count]) => ({
      slug: name,
      name,
      postCount: count
    }));
  }

  /**
   * Paginate posts (sync operation on already-loaded data)
   */
  paginatePosts(posts: BlogPost[], page: number = 1, postsPerPage: number = 10) {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      currentPage: page,
      totalPages: Math.ceil(posts.length / postsPerPage),
      totalPosts: posts.length,
      hasNextPage: endIndex < posts.length,
      hasPreviousPage: page > 1,
      postsPerPage
    };
  }
}

// Export singleton instance
export const blogService = new SimpleBlogService();
export default blogService;
