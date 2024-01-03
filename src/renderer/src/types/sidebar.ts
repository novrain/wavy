export type SideBarItem = {
  id: string
  alt?: string
  icon?: string
  name: string
  nameKey?: string
  handler?: SideBarItemEventHandler
  disabled?: any
}


export type SideBarEvent = {
  item: SideBarItem
}

export interface SideBarItemEventHandler {
  (event: SideBarEvent): void | Promise<void>
}
