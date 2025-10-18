import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  optimizeDeps: {
    include: [
      '@sureapp/canary-design-system',
      'libphonenumber-js',
      'date-fns',
      'clsx',
      'lodash',
      'i18n-iso-countries',
      'i18n-iso-countries/langs/en.json'
    ]
  },
  define: {
    global: 'globalThis',
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      // Add any necessary aliases here if needed
    }
  }
}) 