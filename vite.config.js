import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: '/wee-word/',
  server: {
    port: 10001,
  },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.js'],
  },
})
