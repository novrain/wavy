import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import type { App } from 'vue'

export default {
  install: (app: App) => {
    app.use(FloatingVue)
  }
}
