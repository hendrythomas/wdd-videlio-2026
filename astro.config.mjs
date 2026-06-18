// @ts-check
import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  output: "static",
  server: {
      allowedHosts: ['wdd-videlio-2026.onrender.com', 'videlio.nl']
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
