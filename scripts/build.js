const { build } = require('vite');
const { resolve } = require('path');
const fs = require('fs-extra');

async function buildApp() {
  try {
    // Clean dist directory
    await fs.remove('dist');

    // Build the app
    await build({
      root: process.cwd(),
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
          input: {
            main: resolve(__dirname, '../index.html')
          }
        }
      }
    });

    // Copy necessary files
    await fs.copy('public', 'dist/public');
    await fs.copy('.env.production', 'dist/.env');

    // console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildApp(); 