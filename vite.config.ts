import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '127.0.0.1',
    port: 8080
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'style.css';
          if (assetInfo.name?.endsWith('.jpg') || assetInfo.name?.endsWith('.png')) return 'img/[name][extname]';
          return '[name][extname]';
        }
      }
    }
  }
});
