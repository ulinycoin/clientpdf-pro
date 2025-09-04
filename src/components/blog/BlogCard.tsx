import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types/blog';
import { formatDate, generateBlogUrl } from '../../utils/blogUtils';
import { useI18n } from '../../hooks/useI18n';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  compact?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false, compact = false }) => {
  const { t } = useI18n();
  
  const postUrl = generateBlogUrl(post.slug, post.language);
  const formattedDate = formatDate(post.publishedAt, post.language);

  if (compact) {
    return (
      <Link
        to={postUrl}
        className="group block p-4 bg-white/5 backdrop-blur-sm border border-white/10 
                   rounded-lg hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-2 h-2 bg-seafoam-green rounded-full mt-2 
                         group-hover:bg-ocean-blue transition-colors" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white 
                          group-hover:text-seafoam-green transition-colors line-clamp-1">
              {post.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formattedDate} • {post.readingTime} {t('blog.card.minRead', 'min read')}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  const cardClasses = featured
    ? "group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden " +
      "hover:bg-white/15 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl " +
      "col-span-full md:col-span-2"
    : "group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden " +
      "hover:bg-white/15 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl";

  return (
    <article className={cardClasses}>
      <Link to={postUrl} className="block h-full">
        <div className={`p-6 h-full flex flex-col ${featured ? 'md:p-8' : ''}`}>
          {/* Category & Featured Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-seafoam-green 
                           bg-seafoam-green/10 rounded-full border border-seafoam-green/20">
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
            
            {featured && (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-sandy-beige 
                             bg-sandy-beige/10 rounded-full border border-sandy-beige/20">
                {t('blog.card.featured', 'Featured')}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className={`font-bold text-gray-900 dark:text-white mb-3 
                         group-hover:text-seafoam-green transition-colors line-clamp-2
                         ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className={`text-gray-600 dark:text-gray-300 mb-4 flex-grow 
                        ${featured ? 'text-lg line-clamp-3' : 'text-sm line-clamp-2'}`}>
            {post.excerpt}
          </p>

          {/* Tags */}
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100/50 dark:bg-gray-800/50 
                           text-gray-600 dark:text-gray-400 rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100/50 dark:bg-gray-800/50 
                               text-gray-600 dark:text-gray-400 rounded-md">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-4 
                         border-t border-white/10 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{post.author}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{post.readingTime} {t('blog.card.minRead', 'min read')}</span>
            </div>
          </div>

          {/* Read More Arrow */}
          <div className="mt-4 flex items-center text-seafoam-green text-sm font-semibold 
                         group-hover:translate-x-1 transition-transform">
            <span className="mr-2">{t('blog.card.readMore', 'Read More')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
};