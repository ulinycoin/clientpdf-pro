import React from 'react';
import { Link } from 'react-router-dom';
import { BlogCategory, BlogPost } from '../../types/blog';
import { BlogCard } from './BlogCard';
import { generateCategoryUrl } from '../../utils/blogUtils';
import { useI18n } from '../../hooks/useI18n';

interface BlogSidebarProps {
  categories: BlogCategory[];
  recentPosts: BlogPost[];
  className?: string;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  categories,
  recentPosts,
  className = '',
}) => {
  const { t, language } = useI18n();

  return (
    <aside className={`space-y-8 ${className}`}>
      {/* Categories */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-seafoam-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11H5m14-7H5m14 14H5m14-7l-7-7m7 7l-7 7" />
          </svg>
          {t('blog.sidebar.categories', 'Categories')}
        </h3>
        
        <div className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={generateCategoryUrl(category.slug, language)}
              className="group flex items-center justify-between px-4 py-2 rounded-lg 
                       hover:bg-white/10 transition-colors"
            >
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-seafoam-green 
                             transition-colors capitalize">
                {category.name}
              </span>
              <span className="text-xs bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 
                             dark:text-gray-400 px-2 py-1 rounded-full">
                {category.postCount}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-ocean-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('blog.sidebar.recentPosts', 'Recent Posts')}
        </h3>
        
        <div className="space-y-3">
          {recentPosts.slice(0, 5).map((post) => (
            <BlogCard key={post.slug} post={post} compact />
          ))}
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-sandy-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {t('blog.sidebar.popularTags', 'Popular Tags')}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {/* Mock popular tags - in real implementation, this would come from actual post data */}
          {[
            'pdf-merge', 'tutorial', 'compression', 'security', 'ocr',
            'conversion', 'optimization', 'workflows', 'tips'
          ].map((tag) => (
            <Link
              key={tag}
              to={`${language === 'en' ? '/blog' : `/${language}/blog`}?tag=${tag}`}
              className="inline-block px-3 py-1 text-xs font-medium text-gray-600 
                       dark:text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 rounded-full
                       hover:bg-seafoam-green/20 hover:text-seafoam-green transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-seafoam-green/20 to-ocean-blue/20 
                     backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-seafoam-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {t('blog.sidebar.newsletter.title', 'Stay Updated')}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t('blog.sidebar.newsletter.description', 
            'Get the latest PDF tips and tutorials delivered to your inbox.')}
        </p>
        
        <div className="space-y-3">
          <input
            type="email"
            placeholder={t('blog.sidebar.newsletter.placeholder', 'Enter your email')}
            className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 
                     rounded-lg text-gray-900 dark:text-white placeholder-gray-500 
                     focus:outline-none focus:ring-2 focus:ring-seafoam-green/50"
          />
          <button className="w-full bg-seafoam-green hover:bg-seafoam-green/80 text-white 
                           font-medium py-2 px-4 rounded-lg transition-colors">
            {t('blog.sidebar.newsletter.subscribe', 'Subscribe')}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          {t('blog.sidebar.newsletter.privacy', 'No spam, unsubscribe anytime.')}
        </p>
      </div>
    </aside>
  );
};