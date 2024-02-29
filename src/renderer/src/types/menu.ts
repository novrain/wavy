import { ComputedRef } from 'vue'

type Menu = {
  id: string
  alt?: string
  icon?: string
  name: string
  nameKey?: string
  handler?: MenuItemEventHandler
  isDisabled?: ComputedRef<boolean>
}

export type MenuItem = Menu & { items: undefined, handler: MenuItemEventHandler }
export type MenuGroup = Menu & { items: MenuComposite[] }
export type MenuComposite = MenuItem | MenuGroup | undefined

export type MenuEvent = {
  menu: MenuComposite
}

export interface MenuItemEventHandler {
  (event: MenuEvent): void | Promise<void>
}

// export interface MenuItemIsDisabled {
//   (): boolean
// }

export type MenuItemIsDisabled = ComputedRef<boolean>