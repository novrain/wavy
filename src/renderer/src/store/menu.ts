// Utilities
import { MenuComposite } from '@/types/menu'
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuRoot: {
      items: [] as MenuComposite[]
    } as MenuComposite
  }),
  actions: {
    registerMenu(menu: MenuComposite, parents: string[] | undefined = undefined) {
      let menus = this.$state.menuRoot
      if (Array.isArray(parents) && parents.length) {
        for (let i = 0; i < parents.length; i++) {
          menus = menus?.items?.find((m: MenuComposite) => {
            return m?.id === parents[i]
          })
          if (!menus) {
            break
          }
        }
      }
      if (!menus?.items?.find((i: MenuComposite) => i?.id === menu?.id)) {
        menus?.items?.push(menu)
      }
    }
  }
})
