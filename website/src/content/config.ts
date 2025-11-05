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
      'add-form-fields-pdf',
      'add-text-pdf',
      'compress-pdf',
      'delete-pages-pdf',
      'edit-text-pdf',
      'extract-pages-pdf',
      'flatten-pdf',
      'images-to-pdf',
      'merge-pdf',
      'ocr-pdf',
      'pdf-to-images',
      'pdf-to-word',
      'protect-pdf',
      'rotate-pdf',
      'sign-pdf',
      'split-pdf',
      'unlock-pdf',
      'watermark-pdf',
      'word-to-pdf'
    ])).optional(),

    // Author Info (optional for future)
    author: z.string().default('LocalPDF Team'),
    authorImage: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
