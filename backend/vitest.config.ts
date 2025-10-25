import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.spec.ts', 'tests/integration/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.spec.ts',
        '**/*.config.ts',
        'src/main.ts',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@services': path.resolve(__dirname, './src/services'),
      '@api': path.resolve(__dirname, './src/api'),
      '@database': path.resolve(__dirname, './src/database'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
});
