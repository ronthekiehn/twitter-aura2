const { defineConfig } = require('vite');
const { svelte } = require('@sveltejs/vite-plugin-svelte');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
})
