// Plugins
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import ViteFonts from 'unplugin-fonts/vite'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/renderer',
  build: {
    outDir: '../../dist/renderer'
  },
  base: './',
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss"
      }
    }),
    ViteFonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
    VueI18nPlugin({
      /* options */
      // locale messages resource pre-compile option
      include: [resolve(__dirname, 'src/renderer/src/locales/**')],
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src/renderer/src', import.meta.url)),
      '@W': fileURLToPath(new URL('src/wavy', import.meta.url)),
      '@M': fileURLToPath(new URL('src/main', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})
