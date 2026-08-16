import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'esnext', // Support modern ES modules
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production', // Source maps in dev only
    minify: 'esbuild', // Fast minification
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        blog: resolve(__dirname, 'blog.html'),
        contact: resolve(__dirname, 'contact.html'),
        courseRoom: resolve(__dirname, 'course-room.html'),
        courses: resolve(__dirname, 'courses.html'),
        post: resolve(__dirname, 'post.html'),
        projects: resolve(__dirname, 'projects.html'),
        story: resolve(__dirname, 'story.html'),
        services: resolve(__dirname, 'services.html'),
        sudanFree: resolve(__dirname, 'sudan-free.html'),
        privacyPolicy: resolve(__dirname, 'privacy-policy.html'),
        verify: resolve(__dirname, 'verify.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('pdfjs-dist') || id.includes('pdf.js')) {
              return 'pdfjs';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  esbuild: {
    drop: [], // Console logs enabled for diagnostics
  },
  server: {
    port: 3000,
    open: true
  }
});
