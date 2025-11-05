import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Basic Info
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),

    // Organization
    tags: z.array(z.string()),
    category: z.enum([
      'PDF Basics',
      'Advanced Features',
      'Security & Privacy',
      'Productivity Tips',
      'Tutorials',
      'Comparisons',
      'Use Cases'
    ]),

    // Content Control
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),

    // SEO & Images
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().url().optional(),
    keywords: z.array(z.string()).optional(), // LSI keywords

    // Content Features
    tableOfContents: z.boolean().default(true),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),

    // Internal Linking
    relatedTools: z.array(z.enum([
      'merge-pdf',
      'split-pdf',
      'compress-pdf',
      'protect-pdf',
      'ocr-pdf',
      'add-text-pdf',
      'edit-text-pdf',
      'watermark-pdf',
      'rotate-pdf',
      'delete-pages-pdf',
      'extract-pages-pdf',
      'unlock-pdf',
      'images-to-pdf',
      'pdf-to-images',
      'pdf-to-word',
      'word-to-pdf',
      'sign-pdf',
      'flatten-pdf'
    ])).optional(),

    // Author Info (optional for future)
    author: z.string().default('LocalPDF Team'),
    authorImage: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
