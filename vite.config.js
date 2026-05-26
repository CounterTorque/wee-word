import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'))

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
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
