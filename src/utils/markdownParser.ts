import { BlogPost, BlogFrontmatter, BlogLanguage } from '../types/blog';
import { calculateReadingTime, generateBlogSlug, extractExcerpt } from './blogUtils';

export const parseFrontmatter = (content: string): { frontmatter: BlogFrontmatter; content: string } => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    console.error('Invalid frontmatter format in markdown file');
    throw new Error('Invalid frontmatter format');
  }

  const [, frontmatterYaml, markdownContent] = match;
  
  // Simple YAML parser for frontmatter - improved version
  const frontmatter: any = {};
  const lines = frontmatterYaml.split('\n');
  let currentKey = '';
  let currentValue: any = '';
  let inArray = false;
  let inObject = false;
  let currentObject: any = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Handle object properties (like seo:)
    if (trimmedLine.endsWith(':') && !inArray) {
      // Save previous key if exists
      if (currentKey) {
        if (inObject) {
          frontmatter[currentKey] = currentObject;
          inObject = false;
          currentObject = {};
        } else {
          frontmatter[currentKey] = currentValue;
        }
      }
      
      currentKey = trimmedLine.slice(0, -1);
      currentValue = '';
      inArray = false;
      
      // Check if this is a special object key
      if (currentKey === 'seo') {
        inObject = true;
        currentObject = {};
      }
    } 
    // Handle array items
    else if (trimmedLine.startsWith('- ') && !inObject) {
      if (!inArray) {
        currentValue = [];
        inArray = true;
      }
      const arrayItem = trimmedLine.slice(2).replace(/^["'\[]|["'\]]$/g, '');
      currentValue.push(arrayItem);
    } 
    // Handle object properties
    else if (trimmedLine.includes(':') && inObject) {
      const colonIndex = trimmedLine.indexOf(':');
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      currentObject[key] = value;
    } 
    // Handle simple key-value pairs
    else if (trimmedLine.includes(':') && !inArray && !inObject) {
      const colonIndex = trimmedLine.indexOf(':');
      const key = trimmedLine.substring(0, colonIndex).trim();
      let value = trimmedLine.substring(colonIndex + 1).trim();
      
      // Check if value is a JSON array (starts with [ and ends with ])
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          frontmatter[key] = JSON.parse(value);
        } catch (e) {
          // If JSON parsing fails, treat as string
          frontmatter[key] = value.replace(/^["']|["']$/g, '');
        }
      } else {
        // Regular string value
        frontmatter[key] = value.replace(/^["']|["']$/g, '');
      }
    }
    // Handle continuation of simple values
    else if (!inArray && !inObject && currentKey) {
      currentValue = trimmedLine.replace(/^["']|["']$/g, '');
    }
  }

  // Save final key
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

  // Paragraphs - let prose handle styling
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');

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
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
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