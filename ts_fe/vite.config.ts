import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Target is your backend API
      '/local': {
        target: 'http://localhost:3001', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/local/, ''),
      }
    }
  }
});
