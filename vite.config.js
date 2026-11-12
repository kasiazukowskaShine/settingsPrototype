import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the build works from a GitHub Pages project subpath
export default defineConfig({ base: './', plugins: [react()] })
