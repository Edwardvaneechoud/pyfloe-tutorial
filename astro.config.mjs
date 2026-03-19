import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://edwardvaneechoud.github.io',
  base: '/pyfloe-tutorial',
  output: 'static',
  build: {
    assets: '_assets',
  },
});
