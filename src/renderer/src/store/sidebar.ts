import { SideBarItem } from '@/types/sidebar'
import { defineStore } from 'pinia'

export const useSideBarStore = defineStore('sideBar', {
  state: () => ({
    items: [] as SideBarItem[],
    selected: [] as string[]
  }),
  actions: {
    registerSideBar(sideBar: SideBarItem) {
      let sideBars = this.$state.items
      if (!sideBars?.find((i: SideBarItem) => i?.id === sideBar?.id)) {
        sideBars?.push(sideBar)
      }
    }
  }
})
