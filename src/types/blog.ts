export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  readingTime: number;
  language: 'en' | 'de' | 'fr' | 'es' | 'ru';
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  featured: boolean;
  relatedPosts?: string[];
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  postCount: number;
  language: 'en' | 'de' | 'fr' | 'es' | 'ru';
}

export interface BlogTag {
  slug: string;
  name: string;
  postCount: number;
}

export interface BlogMetadata {
  title: string;
  description: string;
  totalPosts: number;
  featuredPost?: BlogPost;
  categories: BlogCategory[];
  recentPosts: BlogPost[];
}

export interface BlogSearchResult {
  posts: BlogPost[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface BlogFrontmatter {
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  featured?: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  relatedPosts?: string[];
}

export type BlogLanguage = 'en' | 'de' | 'fr' | 'es' | 'ru';

export interface BlogConfig {
  postsPerPage: number;
  maxRelatedPosts: number;
  enableSearch: boolean;
  enableComments: boolean;
  enableRss: boolean;
}