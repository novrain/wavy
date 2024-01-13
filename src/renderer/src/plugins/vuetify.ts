/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import { md1 } from 'vuetify/blueprints'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import i18n from './i18n'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  defaults: {
    global: {
      size: 'small',
      density: 'compact',
      ripple: false,
    },
    VSelect: {
      style: 'font-size: 12px !important;'
    },
    VForm: {
      VSelect: {
        hideDetails: true,
      },
      VInput: {
        hideDetails: true,
      }
    },
    // VTabs: {
    VWindow: {
      VWindowItem: {
        style: {
          flex: 1,
          "flex-direction": 'column'
        }
      }
    },
    // }
    VTabs: {
      VTab: {
        height: 'auto',
        style: {
          padding: '0 0 0 2px',
          display: 'flex',
          "justify-content": 'start'
        }
      }
    }
  },
  blueprint: md1,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          // primary: '#1867C0',
          // secondary: '#5CBBF6',
        },
      },
    },
  },
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
})
