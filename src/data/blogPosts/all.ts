import { BlogPost } from '../../types/blog';
import blogPostsEN from './blogPosts.en';
import blogPostsRU from './blogPosts.ru';
import blogPostsDE from './blogPosts.de';
import blogPostsFR from './blogPosts.fr';
import blogPostsES from './blogPosts.es';

/**
 * All blog posts combined - USE ONLY FOR BUILD-TIME SCRIPTS
 *
 * ⚠️ WARNING: Do NOT import this in runtime code!
 * This defeats the purpose of lazy loading optimization.
 * Use loadBlogPostsByLanguage() from ./index.ts instead.
 *
 * This file is only for build-time scripts like:
 * - generate-multilingual-sitemap.ts
 * - Other static site generation scripts
 */

const allBlogPosts: BlogPost[] = [
  ...blogPostsEN,
  ...blogPostsRU,
  ...blogPostsDE,
  ...blogPostsFR,
  ...blogPostsES,
];

export default allBlogPosts;
