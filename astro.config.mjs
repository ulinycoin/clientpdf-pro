import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://localpdf.online',
  integrations: [
    tailwind(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/blog/draft/'),
    })
  ],
  output: 'static',
  build: {
    format: 'file',
    inlineStylesheets: 'auto', // Inline small CSS automatically
  },
  vite: {
    build: {
      cssCodeSplit: true, // Split CSS by route
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
        },
      },
    },
  },
});
