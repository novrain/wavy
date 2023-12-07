// Utilities
import { defineStore } from 'pinia'

export const hostWindowStore = defineStore('hostWindow', {
  state: () => ({
    isMaximized: false,
  }),
})
