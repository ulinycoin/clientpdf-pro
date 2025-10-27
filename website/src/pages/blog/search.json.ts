import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const blog = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  const searchIndex = blog.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    slug: post.slug,
    tags: post.data.tags,
    category: post.data.category,
    pubDate: post.data.pubDate.toISOString(),
    keywords: post.data.keywords || [],
  }));

  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
