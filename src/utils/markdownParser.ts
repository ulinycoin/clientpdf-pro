import { BlogPost, BlogFrontmatter, BlogLanguage } from '../types/blog';
import { calculateReadingTime, generateBlogSlug, extractExcerpt } from './blogUtils';

export const parseFrontmatter = (content: string): { frontmatter: BlogFrontmatter; content: string } => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid frontmatter format');
  }

  const [, frontmatterYaml, markdownContent] = match;
  
  // Simple YAML parser for frontmatter
  const frontmatter: any = {};
  const lines = frontmatterYaml.split('\n');
  let currentKey = '';
  let currentValue: any = '';
  let inArray = false;
  let inObject = false;
  let currentObject: any = {};
  let objectKey = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (trimmedLine.endsWith(':') && !inArray && !inObject) {
      if (currentKey) {
        frontmatter[currentKey] = currentValue;
      }
      currentKey = trimmedLine.slice(0, -1);
      currentValue = '';
      inArray = false;
    } else if (trimmedLine.startsWith('- ') && !inObject) {
      if (!inArray) {
        currentValue = [];
        inArray = true;
      }
      currentValue.push(trimmedLine.slice(2));
    } else if (trimmedLine.includes(':') && (currentKey === 'seo' || inObject)) {
      if (!inObject) {
        currentObject = {};
        inObject = true;
      }
      const [key, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      currentObject[key.trim()] = value;
    } else if (!inArray && !inObject) {
      currentValue = trimmedLine.replace(/^["']|["']$/g, '');
    }
  }

  if (currentKey) {
    if (inObject) {
      frontmatter[currentKey] = currentObject;
    } else {
      frontmatter[currentKey] = currentValue;
    }
  }

  return {
    frontmatter: frontmatter as BlogFrontmatter,
    content: markdownContent,
  };
};

export const parseMarkdownContent = (content: string): string => {
  // Basic markdown parsing - headers, links, bold, italic, code blocks
  let html = content;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-ocean-blue hover:text-seafoam-green transition-colors">$1</a>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded">$1</code>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-6 space-y-2">$1</ul>');
  
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ol class="list-decimal pl-6 space-y-2">$1</ol>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = '<p class="mb-4">' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p class="mb-4"><\/p>/g, '');

  return html;
};

export const createBlogPostFromMarkdown = (
  markdownContent: string,
  language: BlogLanguage = 'en'
): BlogPost => {
  const { frontmatter, content } = parseFrontmatter(markdownContent);
  
  const slug = generateBlogSlug(frontmatter.title);
  const readingTime = calculateReadingTime(content);
  const excerpt = frontmatter.excerpt || extractExcerpt(content);
  const htmlContent = parseMarkdownContent(content);

  return {
    slug,
    title: frontmatter.title,
    excerpt,
    content: htmlContent,
    author: frontmatter.author,
    publishedAt: frontmatter.publishedAt,
    updatedAt: frontmatter.updatedAt,
    category: frontmatter.category,
    tags: frontmatter.tags || [],
    readingTime,
    language,
    seo: frontmatter.seo,
    featured: frontmatter.featured || false,
    relatedPosts: frontmatter.relatedPosts,
  };
};

export const generateTableOfContents = (content: string): Array<{ id: string; title: string; level: number }> => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2];
    const id = generateBlogSlug(title);
    
    toc.push({ id, title, level });
  }

  return toc;
};

export const addTableOfContentsIds = (content: string): string => {
  return content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
    const id = generateBlogSlug(title);
    return `${hashes} ${title} {#${id}}`;
  });
};