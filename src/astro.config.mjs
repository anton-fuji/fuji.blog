// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321', // TODO: デプロイ前に本番URLに修正
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx()]
});
