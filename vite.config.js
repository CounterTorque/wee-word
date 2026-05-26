import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: '/wee-word/',
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.js'],
  },
})
