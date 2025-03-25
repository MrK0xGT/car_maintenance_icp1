import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'declarations': path.resolve(__dirname, '../declarations'),
      'App.css': path.resolve(__dirname, 'src/App.css')
    }
  },
  define: {
    'process.env': {},
    global: 'window' // 為 global 提供 polyfill
  },
  server: {
    port: 3000
  }
});