import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  const sortedPosts = blog.sort((a, b) =>
    b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  return rss({
    title: 'LocalPDF Blog',
    description: 'Learn tips, tricks, and best practices for working with PDFs. Expert guides and tutorials.',
    site: context.site || 'https://localpdf.online',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.slug}`,
      pubDate: post.data.pubDate,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
      // Add cover image as enclosure for RSS readers
      ...(post.data.coverImage && {
        enclosure: {
          url: `https://localpdf.online${post.data.coverImage}`,
          type: 'image/jpeg',
          length: 0 // RSS spec requires this, but we don't know the actual size
        }
      })
    })),
    customData: `
      <language>en-us</language>
      <copyright>Copyright ${new Date().getFullYear()} LocalPDF</copyright>
      <managingEditor>noreply@localpdf.online (LocalPDF Team)</managingEditor>
      <webMaster>noreply@localpdf.online (LocalPDF Team)</webMaster>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <image>
        <url>https://localpdf.online/logos/localpdf-header-64x64.png</url>
        <title>LocalPDF Blog</title>
        <link>https://localpdf.online/blog</link>
      </image>
    `,
  });
}
