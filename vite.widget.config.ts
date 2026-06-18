import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'next-themes': path.resolve(__dirname, './src/widget/next-themes-shim.tsx')
    },
  },
  build: {
    outDir: 'public',
    emptyOutDir: false, // Don't wipe the public folder
    cssCodeSplit: false,
    lib: {
      entry: 'src/widget/index.tsx',
      name: 'ThemeWidget',
      formats: ['iife'], // Immediately Invoked Function Expression for easy script tag injection
      fileName: () => 'theme-widget.js',
    },
  },
});
