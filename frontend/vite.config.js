import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Corrected backend target port
        changeOrigin: true,
        secure: false
      },
      '/static': {
        target: 'http://localhost:5001', // Corrected static assets target port
        changeOrigin: true,
        secure: false
      }
    }
  }
});