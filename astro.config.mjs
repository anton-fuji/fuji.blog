// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import remarkLinkCard from './src/lib/remark-link-card';

// https://astro.build/config
export default defineConfig({
  site: 'https://fuji.blog',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx({ remarkPlugins: [remarkLinkCard] })]
});
