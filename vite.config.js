import { defineConfig } from 'vite';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  server: {
    port: 8543,
    strictPort: false,
    open: true
  },
  build: {
    rollupOptions: {
      plugins: [{
        name: 'copy-jszip',
        closeBundle() {
          if (!existsSync('dist')) mkdirSync('dist', { recursive: true });
          copyFileSync('jszip.min.js', 'dist/jszip.min.js');
        }
      }]
    }
  }
});
