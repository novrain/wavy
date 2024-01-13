/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import pinia from '../store'
import app from './app'
import i18n from './i18n'
import vuetify from './vuetify'
// import router from '../router'

// Types
import type { App } from 'vue'

export function registerPlugins(vueApp: App) {
  vueApp
    .use(i18n)
    .use(vuetify)
    // .use(router)
    .use(pinia)
    .use(app)
}
