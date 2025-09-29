import { defineConfig } from 'vite';

export default defineConfig({
    base: "./",
    publicDir: 'public',
    build: {
        emptyOutDir: true,
        chunkSizeWarningLimit: 2000, // Increased for Phaser library
        rollupOptions: {
            output: {
                // Organize JavaScript files
                entryFileNames: 'js/[name]-[hash].js',
                chunkFileNames: 'js/[name]-[hash].js',

                // Keep assets folder structure as is from project
                assetFileNames: 'assets/[name]-[hash].[ext]',

                // Better chunk splitting strategy
                manualChunks: (id) => {
                    // Vendor libraries
                    if (id.includes('node_modules')) {
                        if (id.includes('phaser')) {
                            return 'vendor-phaser';
                        }
                        // Other vendor dependencies
                        return 'vendor-other';
                    }

                    // Game code organization
                    if (id.includes('/src/')) {
                        return 'game-src';
                    }

                },
            },
        },
    },
    resolve: {
        alias: {
            'httpie': 'httpie/browser',
        },
    },
    optimizeDeps: {
        // Pre-bundle these dependencies for better performance
        include: ['phaser']
    },
    server: {
        host: true,
        hmr: false,
        port: 5170,
        open: true,
    }
});
