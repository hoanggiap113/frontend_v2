import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/router/routes',
      generatedRouteTree: './src/router/routeTree.gen.ts',
    }),
    react(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
  ],
})
