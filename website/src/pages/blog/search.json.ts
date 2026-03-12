export async function GET() {
  type BlogModule = {
    frontmatter: {
      title: string;
      description: string;
      draft?: boolean;
      tags: string[];
      category: string;
    };
  };

  const postModules = import.meta.glob('../../content/blog/*.mdx', { eager: true }) as Record<string, BlogModule>;
  const posts = Object.entries(postModules)
    .map(([path, module]) => ({
      title: module.frontmatter.title,
      description: module.frontmatter.description,
      slug: path.split('/').pop()?.replace(/\.mdx$/, '') ?? '',
      tags: module.frontmatter.tags,
      category: module.frontmatter.category,
      draft: module.frontmatter.draft,
    }))
    .filter((post) => !post.draft)
    .map(({ draft, ...post }) => post);

  return new Response(JSON.stringify(posts), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
