// Utilities
import { defineStore } from 'pinia'

interface SerialState {
  paths: String[]
}

export const useSerialStore = defineStore('serial', {
  state: () => ({
    paths: []
  } as SerialState),
})
