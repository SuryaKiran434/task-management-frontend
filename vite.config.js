import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Migrated from create-react-app. react-scripts is unmaintained and pinned its
// own transitive dependencies, so Dependabot could not land a patched version
// of any of them -- fourteen open alerts, including a high on svgo, none of
// which were fixable while it was here.
export default defineConfig({
  plugins: [react()],

  server: {
    // create-react-app served on 3000 and the backend's CORS allow-list names
    // that origin. Vite defaults to 5173, which would have been rejected.
    port: 3000,
    open: false,
  },

  build: {
    // react-scripts wrote to build/; keeping the name means the CI bundle-size
    // step, the Dockerfile and any deploy script keep pointing at the same path.
    outDir: 'build',
    sourcemap: false,
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    // create-react-app's jest config set resetMocks: true, which is why
    // testUtils/mockApi is hand-rolled rather than built from mock functions.
    // Matching it here keeps that comment true and the tests honest.
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/index.jsx',
        'src/reportWebVitals.js',
        'src/setupTests.js',
        'src/testUtils/**',
        'src/**/*.test.{js,jsx}',
      ],
    },
  },
})
