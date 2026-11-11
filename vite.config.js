import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Base para GitHub Pages: el sitio se sirve en /gestor-stock-client/
  base: '/gestor-stock-client/',
  plugins: [react(), tailwindcss()],
})
