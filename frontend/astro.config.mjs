import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

import preact from '@astrojs/preact';

export default defineConfig({
  integrations: [tailwind(), preact()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});