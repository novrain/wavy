import { createI18n } from 'vue-i18n'
import { en, zhHans } from 'vuetify/locale'
import messages from '@intlify/unplugin-vue-i18n/messages'

messages!.en.$vuetify = en
messages!.zhHans.$vuetify = zhHans

const i18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

export default i18n