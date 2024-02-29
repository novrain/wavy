import 'floating-vue/dist/style.css'
import type { App } from 'vue'
import FloatingVue from 'floating-vue'

export default {
  install: (app: App) => {
    app.use(FloatingVue)
  }
}
