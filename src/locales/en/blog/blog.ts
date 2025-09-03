/**
 * Blog translations for EN language
 * Contains all blog-related UI text and messages
 */

export const blog = {
  // Blog header
  header: {
    title: 'PDF Expert Blog',
    description: 'Professional guides, tutorials, and insights about PDF tools and document management.',
    searchPlaceholder: 'Search articles...',
    searchHint: 'Search by title, category, or tags'
  },

  // Blog cards
  card: {
    featured: 'Featured',
    minRead: 'min read',
    readMore: 'Read More'
  },

  // Blog sidebar
  sidebar: {
    categories: 'Categories',
    recentPosts: 'Recent Posts',
    popularTags: 'Popular Tags',
    newsletter: {
      title: 'Stay Updated',
      description: 'Get the latest PDF tips and tutorials delivered to your inbox.',
      placeholder: 'Enter your email',
      subscribe: 'Subscribe',
      privacy: 'No spam, unsubscribe anytime.'
    }
  },

  // Blog search
  search: {
    placeholder: 'Search articles by title, content, or tags...',
    recentSearches: 'Recent Searches',
    searching: 'Searching...',
    results: 'Found {count} results for "{query}"',
    viewAll: 'View all {count} results',
    noResults: 'No articles found for "{query}"',
    noResultsHint: 'Try different keywords or check spelling',
    tips: {
      title: 'Search Tips',
      keywords: 'Use specific keywords like "PDF merge" or "compression"',
      tags: 'Search by tags using #tutorial or #guide',
      categories: 'Try category names like "tutorials" or "tips"'
    }
  },

  // Blog pagination
  pagination: {
    previous: 'Previous',
    next: 'Next',
    showing: 'Page {current} of {total}'
  },

  // Blog layout
  layout: {
    title: 'PDF Expert Blog',
    description: 'Professional guides, tutorials, and insights about PDF tools and document management.',
    featured: 'Featured Articles',
    latestArticles: 'Latest Articles',
    results: 'Results',
    loading: 'Loading articles...',
    searchTitle: 'Search: "{query}"',
    searchDescription: 'Found {count} articles matching your search',
    categoryTitle: '{category} Articles',
    categoryDescription: 'Explore {category} articles and tutorials',
    tagTitle: 'Articles tagged with "{tag}"',
    tagDescription: 'All articles related to {tag}',
    searchResults: '{count} results for "{query}"',
    categoryResults: '{count} articles in {category}',
    tagResults: '{count} articles tagged with "{tag}"',
    clearFilters: 'Clear filters',
    noArticles: 'No articles found',
    noSearchResults: 'Try different keywords or browse our categories',
    noArticlesInCategory: 'No articles available in this category yet'
  },

  // Blog post page
  post: {
    loading: 'Loading article...',
    minRead: 'min read',
    updated: 'Updated {date}',
    publishedBy: 'Published by',
    lastUpdated: 'Updated {date}',
    relatedArticles: 'Related Articles',
    backToBlog: 'Back to Blog',
    breadcrumbs: {
      blog: 'Blog'
    }
  },

  // Blog category page
  category: {
    loading: 'Loading category...',
    articlesCount: '{count} articles',
    noArticles: 'No articles in this category yet',
    noArticlesDescription: 'Check back soon for new content or browse other categories',
    browseBlog: 'Browse All Articles',
    backToBlog: 'Back to All Articles',
    breadcrumbs: {
      blog: 'Blog'
    },
    pageTitle: '{category} Articles',
    seo: {
      title: '{category} Articles - LocalPDF Blog',
      description: 'Discover {count} professional {category} articles about PDF tools and document management.',
      keywords: '{category}, PDF {category}, {slug}, tutorials'
    }
  },

  // Blog page SEO
  page: {
    title: 'PDF Expert Blog',
    description: 'Professional guides, tutorials, and insights about PDF tools',
    seo: {
      title: 'PDF Expert Blog - Tips, Tutorials & Guides | LocalPDF',
      description: 'Professional PDF tutorials, expert tips, and comprehensive guides. Learn advanced PDF techniques, workflows, and best practices from LocalPDF experts.',
      keywords: 'PDF tutorials, PDF tips, PDF guides, document management, PDF tools, compression, merge, conversion, security'
    },
    categoryTitle: '{category} Articles',
    categoryDescription: 'Discover professional {category} articles and tutorials',
    tagTitle: 'Articles tagged "{tag}"',
    tagDescription: 'All articles related to {tag}',
    searchTitle: 'Search: "{query}"',
    searchDescription: 'Search results for "{query}"'
  }
};