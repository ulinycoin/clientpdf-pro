import { BlogPost, BlogLanguage } from '../../types/blog';

/**
 * Optimized blog posts loading with lazy loading by language
 * This dramatically reduces initial bundle size for mobile performance
 *
 * Instead of loading all 79 blog posts (8603 lines) upfront,
 * we dynamically import only the posts for the requested language.
 *
 * Performance impact:
 * - Before: ~454 KB bundle (all posts loaded)
 * - After: ~90 KB per language (only needed posts)
 * - Mobile LCP improvement: Expected -2-3s
 */

// Cache for loaded language data to avoid re-fetching
const loadedLanguages = new Map<BlogLanguage, BlogPost[]>();

/**
 * Dynamically load blog posts for a specific language
 * Uses Vite's dynamic import for code splitting
 */
export async function loadBlogPostsByLanguage(language: BlogLanguage): Promise<BlogPost[]> {
  // Return from cache if already loaded
  if (loadedLanguages.has(language)) {
    return loadedLanguages.get(language)!;
  }

  let posts: BlogPost[];

  try {
    switch (language) {
      case 'en':
        posts = (await import('./blogPosts.en')).default;
        break;
      case 'ru':
        posts = (await import('./blogPosts.ru')).default;
        break;
      case 'de':
        posts = (await import('./blogPosts.de')).default;
        break;
      case 'fr':
        posts = (await import('./blogPosts.fr')).default;
        break;
      case 'es':
        posts = (await import('./blogPosts.es')).default;
        break;
      default:
        console.warn(`[BlogPosts] Unknown language: ${language}, falling back to EN`);
        posts = (await import('./blogPosts.en')).default;
    }

    // Cache the loaded posts
    loadedLanguages.set(language, posts);

    console.log(`✅ [BlogPosts] Loaded ${posts.length} posts for ${language.toUpperCase()}`);
    return posts;
  } catch (error) {
    console.error(`[BlogPosts] Failed to load posts for ${language}:`, error);
    // Fallback to empty array instead of breaking the app
    return [];
  }
}

/**
 * Preload blog posts for a language (optional optimization)
 * Call this when you know the user will likely need blog data
 */
export function preloadBlogPostsForLanguage(language: BlogLanguage): void {
  if (!loadedLanguages.has(language)) {
    loadBlogPostsByLanguage(language).catch(err => {
      console.error(`[BlogPosts] Preload failed for ${language}:`, err);
    });
  }
}

/**
 * Get synchronously if already loaded, otherwise return empty array
 * Use loadBlogPostsByLanguage() for async loading
 */
export function getBlogPostsSyncIfLoaded(language: BlogLanguage): BlogPost[] {
  return loadedLanguages.get(language) || [];
}

/**
 * Clear cache (useful for testing or memory management)
 */
export function clearBlogPostsCache(): void {
  loadedLanguages.clear();
  console.log('✅ [BlogPosts] Cache cleared');
}
