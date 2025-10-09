// vite.config.js (¡IMPORTANTE: Usar path.resolve!)

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { fileURLToPath, URL } from 'node:url'; // Usamos URL para compatibilidad

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),

    quasar({
      // Usamos el helper de Node.js para construir una ruta absoluta
      sassVariables: fileURLToPath(new URL('./src/assets/quasar-variables.sass', import.meta.url)),
    })
  ],
});