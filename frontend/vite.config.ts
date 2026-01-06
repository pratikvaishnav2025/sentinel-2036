
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    // This outputs directly into the Spring Boot static folder
    outDir: "../src/main/resources/static",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      // Direct API calls to the local Spring Boot server during development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
