import { BlogPost, BlogLanguage, BlogCategory } from '../types/blog';
import blogPostsData from '../data/blogPosts';

/**
 * Simple, reliable blog service with embedded data
 * No external dependencies - works in all environments
 */

export class SimpleBlogService {
  private posts: BlogPost[] = blogPostsData;

  /**
   * Get all posts for a specific language
   */
  getPostsByLanguage(language: BlogLanguage): BlogPost[] {
    return this.posts
      .filter(post => post.language === language)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Get a specific post by slug and language
   */
  getPostBySlug(slug: string, language: BlogLanguage): BlogPost | null {
    return this.posts.find(post => post.slug === slug && post.language === language) || null;
  }

  /**
   * Get featured posts for a language
   */
  getFeaturedPosts(language: BlogLanguage, limit: number = 3): BlogPost[] {
    return this.posts
      .filter(post => post.language === language && post.featured)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get recent posts for a language
   */
  getRecentPosts(language: BlogLanguage, limit: number = 5): BlogPost[] {
    return this.posts
      .filter(post => post.language === language)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get posts by category
   */
  getPostsByCategory(category: string, language: BlogLanguage): BlogPost[] {
    return this.posts
      .filter(post => post.language === language && post.category === category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Get posts by tag
   */
  getPostsByTag(tag: string, language: BlogLanguage): BlogPost[] {
    return this.posts
      .filter(post => post.language === language && post.tags.includes(tag))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Get related posts for a given post
   */
  getRelatedPosts(currentPost: BlogPost, language: BlogLanguage, limit: number = 3): BlogPost[] {
    const relatedPosts = this.posts
      .filter(post =>
        post.language === language &&
        post.slug !== currentPost.slug
      )
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
  getCategories(language: BlogLanguage): BlogCategory[] {
    const categoryCounts = new Map<string, number>();

    this.posts
      .filter(post => post.language === language)
      .forEach(post => {
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
  searchPosts(query: string, language: BlogLanguage): BlogPost[] {
    if (!query.trim()) {
      return this.getPostsByLanguage(language);
    }

    const searchTerm = query.toLowerCase();

    return this.posts
      .filter(post =>
        post.language === language &&
        (
          post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          post.category.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm)
        )
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  /**
   * Get blog statistics
   */
  getBlogStats(language: BlogLanguage) {
    const languagePosts = this.posts.filter(post => post.language === language);

    return {
      totalPosts: languagePosts.length,
      featuredPosts: languagePosts.filter(post => post.featured).length,
      categories: this.getCategories(language),
      tags: this.getAllTags(language),
      latestPost: languagePosts.length > 0 ?
        languagePosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0] :
        null
    };
  }

  /**
   * Get all available tags for a language
   */
  private getAllTags(language: BlogLanguage) {
    const tagCounts = new Map<string, number>();

    this.posts
      .filter(post => post.language === language)
      .forEach(post => {
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
   * Paginate posts
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