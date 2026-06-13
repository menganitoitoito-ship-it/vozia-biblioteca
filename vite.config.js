import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8543, // Puerto menos común
    strictPort: false,
    open: true // Abre el navegador automáticamente
  }
});
